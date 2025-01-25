import { openDotaService } from './openDotaService'
import { dotabuffService } from './dotabuffService'
import { datDotaService } from './datDotaService'
import { stratzService } from './stratzService'
import { teamsService } from './teamsService'

export const teamSyncService = {
  // Получение полных данных о команде из всех сервисов
  getFullTeamData: async (teamId, teamName) => {
    try {
      console.log(`Получение данных для команды ${teamName} (${teamId})`)
      
      // Получаем все данные из OpenDota
      const [
        basicInfo,
        players,
        matches,
        heroes,
        matchups,
        recentMatches,
        playersByHero,
        matchesByDay
      ] = await Promise.allSettled([
        openDotaService.getTeamStats(teamId),
        fetch(`https://api.opendota.com/api/teams/${teamId}/players`).then(r => r.json()),
        fetch(`https://api.opendota.com/api/teams/${teamId}/matches`).then(r => r.json()),
        fetch(`https://api.opendota.com/api/teams/${teamId}/heroes`).then(r => r.json()),
        fetch(`https://api.opendota.com/api/teams/${teamId}/matchups`).then(r => r.json()),
        // Дополнительные эндпоинты
        fetch(`https://api.opendota.com/api/teams/${teamId}/matches?limit=100`).then(r => r.json()),
        fetch(`https://api.opendota.com/api/teams/${teamId}/players/heroes`).then(r => r.json()),
        fetch(`https://api.opendota.com/api/teams/${teamId}/matches/days`).then(r => r.json())
      ])

      // Получаем данные из других сервисов
      const [dotabuffStats, datDotaStats, stratzStats] = await Promise.allSettled([
        dotabuffService.getTeamById(teamId, teamName),
        datDotaService.getTeamStats(teamId),
        stratzService.getTeamDetails(teamId)
      ])

      // Формируем полную информацию о команде
      const fullTeamData = {
        team_id: teamId,
        name: teamName,
        openDota: {
          basic: basicInfo.status === 'fulfilled' ? basicInfo.value : null,
          players: players.status === 'fulfilled' ? players.value : null,
          matches: matches.status === 'fulfilled' ? matches.value?.slice(0, 100) : null,
          heroes: heroes.status === 'fulfilled' ? heroes.value : null,
          matchups: matchups.status === 'fulfilled' ? matchups.value : null,
          recentMatches: recentMatches.status === 'fulfilled' ? recentMatches.value : null,
          playersByHero: playersByHero.status === 'fulfilled' ? playersByHero.value : null,
          matchesByDay: matchesByDay.status === 'fulfilled' ? matchesByDay.value : null
        },
        dotabuff: dotabuffStats.status === 'fulfilled' ? dotabuffStats.value : null,
        datDota: datDotaStats.status === 'fulfilled' ? datDotaStats.value : null,
        stratz: stratzStats.status === 'fulfilled' ? stratzStats.value : null,
        lastSync: new Date().toISOString(),
        stats: {
          totalMatches: 0,
          winRate: 0,
          lastMatch: null,
          topHeroes: [],
          currentPlayers: [],
          recentResults: [],
          matchHistory: {
            daily: [],
            monthly: [],
            total: 0
          },
          heroStats: [],
          playerStats: [],
          performance: {
            avgKills: 0,
            avgDeaths: 0,
            avgAssists: 0,
            avgGPM: 0,
            avgXPM: 0,
            avgLastHits: 0,
            avgDenies: 0
          }
        }
      }

      // Обрабатываем базовую статистику
      if (fullTeamData.openDota.basic) {
        const basic = fullTeamData.openDota.basic
        fullTeamData.stats.totalMatches = basic.wins + basic.losses
        fullTeamData.stats.winRate = fullTeamData.stats.totalMatches > 0 
          ? (basic.wins / fullTeamData.stats.totalMatches * 100).toFixed(2)
          : 0
        
        // Добавляем рейтинг и базовую информацию
        fullTeamData.rating = basic.rating || 0
        fullTeamData.wins = basic.wins || 0
        fullTeamData.losses = basic.losses || 0
        fullTeamData.last_match_time = basic.last_match_time || 0
        fullTeamData.tag = basic.tag || ''
        fullTeamData.logo_url = basic.logo_url || ''
      }

      // Обрабатываем историю матчей
      if (fullTeamData.openDota.matches) {
        const matches = fullTeamData.openDota.matches
        
        // Последние результаты
        fullTeamData.stats.recentResults = matches
          .slice(0, 10)
          .map(match => ({
            match_id: match.match_id,
            opponent_id: match.opposing_team_id,
            opponent_name: match.opposing_team_name || 'Unknown',
            result: match.radiant_win === (match.radiant_team_id === teamId) ? 'win' : 'loss',
            date: new Date(match.start_time * 1000).toISOString(),
            duration: match.duration,
            league_name: match.league_name || '',
            radiant: match.radiant_team_id === teamId,
            score: {
              radiant: match.radiant_score || 0,
              dire: match.dire_score || 0
            }
          }))

        // Считаем среднюю статистику
        let totalStats = matches.reduce((acc, match) => {
          acc.kills += match.radiant_score || 0
          acc.deaths += match.dire_score || 0
          acc.duration += match.duration || 0
          return acc
        }, { kills: 0, deaths: 0, duration: 0 })

        if (matches.length > 0) {
          fullTeamData.stats.performance = {
            avgKills: (totalStats.kills / matches.length).toFixed(2),
            avgDeaths: (totalStats.deaths / matches.length).toFixed(2),
            avgDuration: (totalStats.duration / matches.length / 60).toFixed(2) // в минутах
          }
        }
      }

      // Обрабатываем статистику героев
      if (fullTeamData.openDota.heroes) {
        fullTeamData.stats.heroStats = fullTeamData.openDota.heroes
          .sort((a, b) => b.games_played - a.games_played)
          .slice(0, 20)
          .map(hero => ({
            hero_id: hero.hero_id,
            games_played: hero.games_played,
            wins: hero.wins,
            winRate: ((hero.wins / hero.games_played) * 100).toFixed(2),
            lastPlayed: hero.last_played ? new Date(hero.last_played * 1000).toISOString() : null
          }))
      }

      // Обрабатываем статистику игроков
      if (fullTeamData.openDota.players) {
        fullTeamData.stats.playerStats = fullTeamData.openDota.players
          .filter(player => player.games_played > 0)
          .map(player => ({
            account_id: player.account_id,
            name: player.name || 'Unknown',
            games_played: player.games_played,
            wins: player.wins,
            winRate: ((player.wins / player.games_played) * 100).toFixed(2),
            is_current_team_member: player.is_current_team_member,
            heroes: fullTeamData.openDota.playersByHero?.[player.account_id] || []
          }))
      }

      // Обрабатываем статистику по дням
      if (fullTeamData.openDota.matchesByDay) {
        const days = Object.entries(fullTeamData.openDota.matchesByDay)
          .map(([day, matches]) => ({
            date: new Date(parseInt(day) * 86400000).toISOString(), // конвертируем дни в миллисекунды
            matches: matches.games_played,
            wins: matches.wins
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        fullTeamData.stats.matchHistory.daily = days
      }

      return fullTeamData
    } catch (error) {
      console.error(`Ошибка получения данных для команды ${teamName}:`, error)
      return null
    }
  },

  // Синхронизация всех команд
  syncAllTeams: async () => {
    try {
      console.log('Начало синхронизации команд')
      
      // Получаем список всех команд из OpenDota
      const response = await fetch('https://api.opendota.com/api/teams')
      const teams = await response.json()
      
      // Фильтруем только активные команды
      const activeTeams = teams.filter(team => 
        team.rating && 
        team.last_match_time && 
        team.last_match_time > (Date.now()/1000 - 30*24*60*60) // матчи за последние 30 дней
      )
      
      console.log(`Найдено ${activeTeams.length} активных команд`)
      
      // Получаем детальные данные для каждой команды
      const processedTeams = []
      for (const team of activeTeams) {
        // Добавляем задержку между запросами
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const fullData = await teamSyncService.getFullTeamData(team.team_id, team.name)
        if (fullData) {
          processedTeams.push({
            ...team,
            details: fullData,
            lastUpdated: new Date().toISOString()
          })
        }
      }
      
      // Сохраняем все данные в Firebase
      await teamsService.saveTeams(processedTeams)
      
      console.log(`Синхронизация завершена. Обработано команд: ${processedTeams.length}`)
      return {
        status: 'success',
        totalTeams: teams.length,
        activeTeams: activeTeams.length,
        processedTeams: processedTeams.length
      }
    } catch (error) {
      console.error('Ошибка синхронизации команд:', error)
      throw error
    }
  },

  // Проверка необходимости обновления команды
  needsUpdate: (team) => {
    if (!team.lastUpdated) return true
    
    const lastUpdate = new Date(team.lastUpdated)
    const now = new Date()
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60)
    
    return hoursSinceUpdate >= 24 // Обновляем если прошло 24 часа
  },

  // Синхронизация только устаревших данных
  syncOutdatedTeams: async () => {
    try {
      console.log('Начало синхронизации устаревших данных')
      
      // Получаем все команды из Firebase
      const existingTeams = await teamsService.getAllTeams()
      
      // Фильтруем команды, требующие обновления
      const outdatedTeams = existingTeams.filter(teamSyncService.needsUpdate)
      
      console.log(`Найдено ${outdatedTeams.length} команд для обновления`)
      
      // Обновляем каждую команду
      const updatedTeams = []
      for (const team of outdatedTeams) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const fullData = await teamSyncService.getFullTeamData(team.team_id, team.name)
        if (fullData) {
          updatedTeams.push({
            ...team,
            details: fullData,
            lastUpdated: new Date().toISOString()
          })
        }
      }
      
      // Сохраняем обновленные данные
      for (const team of updatedTeams) {
        await teamsService.saveTeam(team)
      }
      
      console.log(`Обновление завершено. Обновлено команд: ${updatedTeams.length}`)
      return {
        status: 'success',
        totalTeams: existingTeams.length,
        outdatedTeams: outdatedTeams.length,
        updatedTeams: updatedTeams.length
      }
    } catch (error) {
      console.error('Ошибка обновления команд:', error)
      throw error
    }
  },

  // Обновление пользовательских данных команды
  updateCustomData: async (teamId, customData, userId) => {
    try {
      console.log(`Обновление пользовательских данных команды ${teamId}`)
      
      // Получаем текущие данные команды
      const team = await teamsService.getTeamById(teamId)
      if (!team) {
        throw new Error('Команда не найдена')
      }

      // Объединяем существующие и новые данные
      const updatedCustomData = {
        ...team.customData,
        ...customData,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date().toISOString()
      }

      // Сохраняем обновленные данные
      await teamsService.saveTeam({
        ...team,
        customData: updatedCustomData
      })

      return {
        status: 'success',
        message: 'Данные успешно обновлены',
        teamId,
        customData: updatedCustomData
      }
    } catch (error) {
      console.error(`Ошибка обновления данных команды ${teamId}:`, error)
      throw error
    }
  },

  // Добавление достижения команды
  addTeamAchievement: async (teamId, achievement, userId) => {
    try {
      const team = await teamsService.getTeamById(teamId)
      if (!team) {
        throw new Error('Команда не найдена')
      }

      const newAchievement = {
        ...achievement,
        id: Date.now().toString(),
        addedBy: userId,
        addedAt: new Date().toISOString()
      }

      const updatedCustomData = {
        ...team.customData,
        achievements: [...(team.customData?.achievements || []), newAchievement],
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date().toISOString()
      }

      await teamsService.saveTeam({
        ...team,
        customData: updatedCustomData
      })

      return {
        status: 'success',
        message: 'Достижение добавлено',
        achievement: newAchievement
      }
    } catch (error) {
      console.error(`Ошибка добавления достижения команды ${teamId}:`, error)
      throw error
    }
  },

  // Обновление состава команды
  updateTeamRoster: async (teamId, roster, userId) => {
    try {
      const team = await teamsService.getTeamById(teamId)
      if (!team) {
        throw new Error('Команда не найдена')
      }

      const updatedCustomData = {
        ...team.customData,
        roster: {
          ...team.customData?.roster,
          ...roster,
          lastUpdated: new Date().toISOString()
        },
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date().toISOString()
      }

      await teamsService.saveTeam({
        ...team,
        customData: updatedCustomData
      })

      return {
        status: 'success',
        message: 'Состав команды обновлен',
        roster: updatedCustomData.roster
      }
    } catch (error) {
      console.error(`Ошибка обновления состава команды ${teamId}:`, error)
      throw error
    }
  },

  // Добавление произвольного поля
  addCustomField: async (teamId, fieldName, fieldValue, userId) => {
    try {
      const team = await teamsService.getTeamById(teamId)
      if (!team) {
        throw new Error('Команда не найдена')
      }

      const updatedCustomData = {
        ...team.customData,
        customFields: {
          ...(team.customData?.customFields || {}),
          [fieldName]: {
            value: fieldValue,
            addedBy: userId,
            addedAt: new Date().toISOString()
          }
        },
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date().toISOString()
      }

      await teamsService.saveTeam({
        ...team,
        customData: updatedCustomData
      })

      return {
        status: 'success',
        message: 'Поле добавлено',
        fieldName,
        fieldValue
      }
    } catch (error) {
      console.error(`Ошибка добавления поля команды ${teamId}:`, error)
      throw error
    }
  }
}

export default teamSyncService 