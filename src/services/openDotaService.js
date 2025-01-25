import axios from 'axios'

const OPENDOTA_API_URL = 'https://api.opendota.com/api'

// Функция задержки для предотвращения превышения лимитов API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const openDotaService = {
  // Поиск игроков по имени с дополнительной информацией о команде
  searchPlayers: async (query) => {
    try {
      console.log('Поиск игроков:', query)
      const [searchResponse, proPlayersResponse] = await Promise.all([
        axios.get(`${OPENDOTA_API_URL}/search`, {
          params: { q: query }
        }),
        axios.get(`${OPENDOTA_API_URL}/proPlayers`)
      ])
      
      // Создаем карту профессиональных игроков для быстрого поиска
      const proPlayersMap = proPlayersResponse.data.reduce((acc, player) => {
        acc[player.account_id] = player
        return acc
      }, {})
      
      // Добавляем информацию о команде к результатам поиска
      const results = searchResponse.data.map(player => ({
        account_id: player.account_id,
        personaname: player.personaname,
        avatarfull: player.avatarfull,
        last_match_time: player.last_match_time,
        similarity: player.similarity,
        // Добавляем информацию о профессиональной команде, если есть
        team_name: proPlayersMap[player.account_id]?.team_name || null,
        team_tag: proPlayersMap[player.account_id]?.team_tag || null,
        is_pro: !!proPlayersMap[player.account_id],
        country_code: proPlayersMap[player.account_id]?.country_code || null
      }))

      // Сортируем результаты: сначала про-игроки, потом по схожести
      results.sort((a, b) => {
        if (a.is_pro && !b.is_pro) return -1
        if (!a.is_pro && b.is_pro) return 1
        return b.similarity - a.similarity
      })
      
      console.log(`Найдено ${results.length} игроков`)
      return results
    } catch (error) {
      console.error('Ошибка при поиске игроков:', error)
      return []
    }
  },

  // Получение основной информации об игроке
  getPlayerProfile: async (accountId) => {
    try {
      console.log('Получение профиля игрока:', accountId)
      const response = await axios.get(`${OPENDOTA_API_URL}/players/${accountId}`)
      
      return {
        account_id: accountId,
        steamid: response.data.profile.steamid,
        personaname: response.data.profile.personaname,
        name: response.data.profile.name,
        avatar: response.data.profile.avatar,
        avatarfull: response.data.profile.avatarfull,
        last_login: response.data.profile.last_login,
        country_code: response.data.profile.loccountrycode,
        rank_tier: response.data.rank_tier,
        leaderboard_rank: response.data.leaderboard_rank
      }
    } catch (error) {
      console.error('Ошибка при получении профиля игрока:', error)
      return null
    }
  },

  // Получение статистики WL игрока
  getPlayerWinLoss: async (accountId) => {
    try {
      console.log('Получение W/L статистики игрока:', accountId)
      const response = await axios.get(`${OPENDOTA_API_URL}/players/${accountId}/wl`)
      
      return {
        wins: response.data.win,
        losses: response.data.lose,
        winrate: response.data.win / (response.data.win + response.data.lose) * 100
      }
    } catch (error) {
      console.error('Ошибка при получении W/L статистики:', error)
      return null
    }
  },

  // Получение статистики по героям
  getPlayerHeroes: async (accountId) => {
    try {
      console.log('Получение статистики героев игрока:', accountId)
      const response = await axios.get(`${OPENDOTA_API_URL}/players/${accountId}/heroes`)
      
      return response.data.map(hero => ({
        hero_id: hero.hero_id,
        games: hero.games,
        wins: hero.win,
        winrate: (hero.win / hero.games) * 100,
        last_played: hero.last_played
      }))
    } catch (error) {
      console.error('Ошибка при получении статистики героев:', error)
      return []
    }
  },

  // Получение последних матчей
  getPlayerRecentMatches: async (accountId) => {
    try {
      console.log('Получение последних матчей игрока:', accountId)
      const response = await axios.get(`${OPENDOTA_API_URL}/players/${accountId}/recentMatches`)
      
      return response.data.map(match => ({
        match_id: match.match_id,
        hero_id: match.hero_id,
        result: match.radiant_win === match.player_slot < 128,
        game_mode: match.game_mode,
        duration: match.duration,
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        xp_per_min: match.xp_per_min,
        gold_per_min: match.gold_per_min,
        last_hits: match.last_hits,
        denies: match.denies,
        start_time: match.start_time
      }))
    } catch (error) {
      console.error('Ошибка при получении последних матчей:', error)
      return []
    }
  },

  // Получение полной статистики игрока
  getPlayerStats: async (accountId) => {
    try {
      console.log('Получение полной статистики игрока:', accountId)
      
      // Получаем все данные параллельно
      const [profile, winLoss, heroes, recentMatches] = await Promise.all([
        openDotaService.getPlayerProfile(accountId),
        openDotaService.getPlayerWinLoss(accountId),
        openDotaService.getPlayerHeroes(accountId),
        openDotaService.getPlayerRecentMatches(accountId)
      ])

      // Рассчитываем средние показатели по последним матчам
      const averages = recentMatches.reduce((acc, match) => {
        acc.kills += match.kills
        acc.deaths += match.deaths
        acc.assists += match.assists
        acc.xpm += match.xp_per_min
        acc.gpm += match.gold_per_min
        return acc
      }, { kills: 0, deaths: 0, assists: 0, xpm: 0, gpm: 0 })

      const matchCount = recentMatches.length
      
      return {
        profile,
        stats: {
          ...winLoss,
          averages: {
            kills: matchCount ? (averages.kills / matchCount).toFixed(1) : 0,
            deaths: matchCount ? (averages.deaths / matchCount).toFixed(1) : 0,
            assists: matchCount ? (averages.assists / matchCount).toFixed(1) : 0,
            xpm: matchCount ? Math.round(averages.xpm / matchCount) : 0,
            gpm: matchCount ? Math.round(averages.gpm / matchCount) : 0
          }
        },
        heroes: heroes.sort((a, b) => b.games - a.games).slice(0, 10), // топ-10 героев
        recent_matches: recentMatches
      }
    } catch (error) {
      console.error('Ошибка при получении полной статистики игрока:', error)
      return null
    }
  }
}

export default openDotaService 