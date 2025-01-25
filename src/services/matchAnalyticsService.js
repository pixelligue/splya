import { pushrApiService } from './pushrApiService'

export const matchAnalyticsService = {
  // Получение матчей с собранной аналитикой
  getMatchesWithAnalytics: async (game = 'all') => {
    try {
      // Получаем предстоящие матчи через pushrApiService
      const matches = await pushrApiService.matches.getAll({
        page: 1,
        perPage: 20,
        orderBy: 'startTime',
        orderDir: 'asc',
        status: 'upcoming'
      })
      
      return matches.map(match => ({
        id: match.id,
        teams: [
          {
            team_id: match.team1Id,
            name: match.team1Name,
            logo_url: match.team1Logo
          },
          {
            team_id: match.team2Id,
            name: match.team2Name,
            logo_url: match.team2Logo
          }
        ],
        tournament: {
          name: match.tournament,
          format: `BO${match.format}`
        },
        begin_at: new Date(match.startTime),
        analytics: {
          'Формат': `BO${match.format}`,
          'Турнир': match.tournament,
          'Статус': match.status || 'upcoming'
        }
      }))
    } catch (error) {
      console.error('Ошибка при получении матчей с аналитикой:', error)
      throw error
    }
  },

  // Получение детальной аналитики по команде
  getTeamAnalytics: async (teamId) => {
    try {
      // Получаем информацию о команде
      const team = await pushrApiService.teams.getById(teamId)
      
      // Получаем историю матчей команды
      const matches = await pushrApiService.matches.getAll({
        page: 1,
        perPage: 20,
        orderBy: 'startTime',
        orderDir: 'desc',
        teamId: teamId
      })
      
      const matchHistory = matches.map(match => {
        const isTeam1 = match.team1Id === teamId
        
        return {
          id: match.id,
          teams: [
            {
              team_id: match.team1Id,
              name: match.team1Name,
              logo_url: match.team1Logo,
              result: isTeam1 ? match.winner === 'team1' ? 'win' : 'loss' : match.winner === 'team2' ? 'win' : 'loss'
            },
            {
              team_id: match.team2Id,
              name: match.team2Name,
              logo_url: match.team2Logo,
              result: !isTeam1 ? match.winner === 'team2' ? 'win' : 'loss' : match.winner === 'team1' ? 'win' : 'loss'
            }
          ],
          begin_at: new Date(match.startTime),
          tournament: {
            name: match.tournament,
            format: `BO${match.format}`
          }
        }
      })

      // Считаем статистику
      const totalMatches = matchHistory.length
      const wins = matchHistory.filter(match => {
        const teamInMatch = match.teams.find(t => t.team_id === teamId)
        return teamInMatch?.result === 'win'
      }).length
      const winrate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

      // Получаем последние результаты
      const recentResults = matchHistory.slice(0, 5).map(match => {
        const teamInMatch = match.teams.find(t => t.team_id === teamId)
        return teamInMatch?.result === 'win'
      })

      return {
        team_id: teamId,
        name: team.name,
        logo_url: team.logo,
        region: team.region,
        matchHistory,
        stats: {
          totalMatches,
          winrate
        },
        analytics: {
          'Последние матчи': `${wins}W-${totalMatches - wins}L`,
          'Винрейт': `${winrate}%`,
          'Текущая форма': recentResults.map(win => win ? 'W' : 'L').join('-')
        }
      }
    } catch (error) {
      console.error('Ошибка при получении аналитики команды:', error)
      throw error
    }
  },

  // Получение истории матчей команды
  getTeamMatchHistory: async (teamId, limit = 10) => {
    try {
      const matchesRef = collection(db, 'matches')
      const q = query(
        matchesRef,
        where('teamIds', 'array-contains', teamId),
        where('hasAnalytics', '==', true),
        orderBy('date', 'desc'),
        limit(limit)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }))
    } catch (error) {
      console.error('Ошибка при получении истории матчей:', error)
      throw error
    }
  },

  // Получение статистики личных встреч команд
  getHeadToHead: async (team1Id, team2Id, limit = 5) => {
    try {
      const matchesRef = collection(db, 'matches')
      const q = query(
        matchesRef,
        where('teamIds', 'array-contains', team1Id),
        where('opponentId', '==', team2Id),
        orderBy('date', 'desc'),
        limit(limit)
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      }))
    } catch (error) {
      console.error('Ошибка при получении истории личных встреч:', error)
      throw error
    }
  }
}

export default matchAnalyticsService 