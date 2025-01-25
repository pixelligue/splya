import axios from 'axios'

const API_URL = import.meta.env.VITE_PUSHR_API_URL || 'https://pushr.ru/wp-json/wp/v2'
const API_KEY = import.meta.env.VITE_PUSHR_API_KEY

// Создаем инстанс axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Добавляем интерцептор для логирования запросов
apiClient.interceptors.request.use(request => {
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    params: request.params,
    headers: request.headers
  })
  return request
}, error => {
  console.error('Request Error:', error)
  return Promise.reject(error)
})

// Добавляем интерцептор для логирования ответов
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    })
    return Promise.reject(error)
  }
)

export const pushrApiService = {
  // Герои
  heroes: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/dota_hero', { params })
      return response.data
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/dota_hero/${id}`)
      return response.data
    }
  },

  // Матчи
  matches: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/dota_match', { params })
      return response.data
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/dota_match/${id}`)
      return response.data
    }
  },

  // Команды
  teams: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/dota_team', { params })
      return response.data
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/dota_team/${id}`)
      return response.data
    },

    // Поиск команды по названию
    findByName: async (teamName) => {
      try {
        const response = await apiClient.get('/dota_team', { 
          params: { 
            search: teamName,
            per_page: 5 // Получаем топ-5 наиболее релевантных результатов
          }
        })
        return response.data
      } catch (error) {
        console.error('Ошибка при поиске команды:', error)
        throw error
      }
    },

    // Получить ID команды по названию из Pandascore
    getIdByPandascoreName: async (pandascoreName) => {
      try {
        // Сначала пробуем точное совпадение
        const exactMatch = await apiClient.get('/dota_team', {
          params: {
            search: pandascoreName,
            exact: true
          }
        })

        if (exactMatch.data && exactMatch.data.length > 0) {
          return exactMatch.data[0].id
        }

        // Если точного совпадения нет, ищем похожие названия
        const response = await apiClient.get('/dota_team', {
          params: {
            search: pandascoreName
          }
        })

        if (response.data && response.data.length > 0) {
          // Возвращаем ID наиболее релевантного результата
          return response.data[0].id
        }

        throw new Error(`Команда "${pandascoreName}" не найдена`)
      } catch (error) {
        console.error('Ошибка при поиске ID команды:', error)
        throw error
      }
    }
  },

  // Игроки
  players: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/dota_player', { params })
      return response.data
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/dota_player/${id}`)
      return response.data
    },

    // Получить детальную статистику игрока
    getPlayerStats: async (playerId) => {
      const response = await apiClient.get(`/dota_player/${playerId}`)
      const playerData = response.data

      // Форматируем статистику героев
      const heroStats = []
      for (let i = 0; i < 10; i++) { // Берем топ-10 героев
        if (playerData[`player_hero_stats_${i}_hero`]) {
          heroStats.push({
            hero: playerData[`player_hero_stats_${i}_hero`],
            matches: playerData[`player_hero_stats_${i}_matches`],
            wins: playerData[`player_hero_stats_${i}_wins`],
            winrate: playerData[`player_hero_stats_${i}_winrate`],
            kda: playerData[`player_hero_stats_${i}_kda`],
            kills_avg: playerData[`player_hero_stats_${i}_kills_avg`],
            deaths_avg: playerData[`player_hero_stats_${i}_deaths_avg`],
            assists_avg: playerData[`player_hero_stats_${i}_assists_avg`]
          })
        }
      }

      return {
        id: playerData.player_id,
        nickname: playerData.player_info_player_nickname,
        realName: playerData.player_info_player_real_name,
        country: playerData.player_info_player_country,
        birthDate: playerData.player_info_player_birth_date,
        team: playerData.player_team,
        statistics: {
          totalMatches: playerData.player_statistics_total_matches,
          wins: playerData.player_statistics_wins,
          losses: playerData.player_statistics_losses,
          winrate: playerData.player_statistics_winrate,
          avgKda: playerData.player_statistics_avg_kda
        },
        heroStats
      }
    }
  },

  // Турниры
  tournaments: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/dota_tournament', { params })
      return response.data
    },
    
    getById: async (id) => {
      const response = await apiClient.get(`/dota_tournament/${id}`)
      return response.data
    }
  },

  // Вспомогательные методы для прогнозов
  predictions: {
    // Получение данных для прогноза по матчу из Pandascore
    getMatchPredictionDataByPandascoreTeams: async (team1Name, team2Name) => {
      try {
        // Получаем данные команд по их названиям
        const [team1Response, team2Response] = await Promise.all([
          apiClient.get('/dota_team', { 
            params: { 
              search: team1Name,
              per_page: 1
            }
          }),
          apiClient.get('/dota_team', { 
            params: { 
              search: team2Name,
              per_page: 1
            }
          })
        ])

        const team1Data = team1Response.data[0]
        const team2Data = team2Response.data[0]

        if (!team1Data || !team2Data) {
          throw new Error('Команды не найдены')
        }

        // Получаем статистику игроков для каждой команды
        const getTeamPlayersStats = async (teamData) => {
          const playerStats = []
          for (let i = 0; i < 5; i++) {
            const playerId = teamData[`team_roster_${i}_player`]
            if (playerId) {
              const playerData = await pushrApiService.players.getPlayerStats(playerId)
              playerStats.push({
                ...playerData,
                role: teamData[`team_roster_${i}_role`]
              })
            }
          }
          return playerStats
        }

        const [team1Players, team2Players] = await Promise.all([
          getTeamPlayersStats(team1Data),
          getTeamPlayersStats(team2Data)
        ])

        // Форматируем данные для ИИ
        return {
          teams: {
            team1: {
              id: team1Data.team_id,
              name: team1Data.title.rendered,
              pandascoreName: team1Name,
              location: team1Data.team_location,
              totalMatches: team1Data.total_matches,
              wins: team1Data.wins,
              losses: team1Data.losses,
              winRate: team1Data.team_winrate,
              roster: team1Players.map(player => ({
                nickname: player.nickname,
                realName: player.realName,
                role: player.role,
                country: player.country,
                statistics: player.statistics,
                topHeroes: player.heroStats.slice(0, 5).map(hero => ({
                  id: hero.hero,
                  matches: hero.matches,
                  winrate: hero.winrate,
                  kda: hero.kda
                }))
              }))
            },
            team2: {
              id: team2Data.team_id,
              name: team2Data.title.rendered,
              pandascoreName: team2Name,
              location: team2Data.team_location,
              totalMatches: team2Data.total_matches,
              wins: team2Data.wins,
              losses: team2Data.losses,
              winRate: team2Data.team_winrate,
              roster: team2Players.map(player => ({
                nickname: player.nickname,
                realName: player.realName,
                role: player.role,
                country: player.country,
                statistics: player.statistics,
                topHeroes: player.heroStats.slice(0, 5).map(hero => ({
                  id: hero.hero,
                  matches: hero.matches,
                  winrate: hero.winrate,
                  kda: hero.kda
                }))
              }))
            }
          },
          headToHead: {
            totalMatches: 0, // TODO: добавить историю встреч
            team1Wins: 0,
            team2Wins: 0,
            recentMatches: []
          }
        }
      } catch (error) {
        console.error('Ошибка при подготовке данных для прогноза:', error)
        throw error
      }
    },

    // Получение всех необходимых данных для прогноза матча
    getMatchPredictionData: async (matchId) => {
      try {
        // Получаем информацию о матче
        const matchData = await pushrApiService.matches.getById(matchId)
        
        // Получаем данные обеих команд
        const [team1Data, team2Data] = await Promise.all([
          pushrApiService.teams.getById(matchData.team1_id),
          pushrApiService.teams.getById(matchData.team2_id)
        ])

        // Форматируем данные для ИИ
        return {
          match: {
            id: matchId,
            tournament: matchData.tournament_name,
            format: matchData.format, // bo1, bo3, bo5
            date: matchData.start_time
          },
          teams: {
            team1: {
              id: team1Data.id,
              name: team1Data.name,
              rank: team1Data.rank,
              winRate: team1Data.win_rate,
              recentResults: team1Data.recent_matches?.map(match => ({
                opponent: match.opponent,
                result: match.result,
                score: match.score,
                date: match.date
              })),
              roster: team1Data.roster?.map(player => ({
                nickname: player.nickname,
                role: player.role,
                signature_heroes: player.signature_heroes,
                performance: {
                  averageKDA: player.average_kda,
                  winRate: player.win_rate
                }
              }))
            },
            team2: {
              id: team2Data.id,
              name: team2Data.name,
              rank: team2Data.rank,
              winRate: team2Data.win_rate,
              recentResults: team2Data.recent_matches?.map(match => ({
                opponent: match.opponent,
                result: match.result,
                score: match.score,
                date: match.date
              })),
              roster: team2Data.roster?.map(player => ({
                nickname: player.nickname,
                role: player.role,
                signature_heroes: player.signature_heroes,
                performance: {
                  averageKDA: player.average_kda,
                  winRate: player.win_rate
                }
              }))
            }
          },
          headToHead: {
            totalMatches: matchData.h2h_total || 0,
            team1Wins: matchData.h2h_team1_wins || 0,
            team2Wins: matchData.h2h_team2_wins || 0,
            recentMatches: matchData.h2h_recent_matches || []
          }
        }
      } catch (error) {
        console.error('Ошибка при подготовке данных для прогноза:', error)
        throw error
      }
    },

    // Анализ статистики команды
    analyzeTeamStats: async (teamId) => {
      try {
        const teamData = await pushrApiService.teams.getById(teamId)
        
        // Получаем последние матчи команды
        const recentMatches = teamData.recent_matches || []
        
        // Анализируем форму команды
        const formAnalysis = {
          totalGames: recentMatches.length,
          wins: recentMatches.filter(match => match.result === 'win').length,
          losses: recentMatches.filter(match => match.result === 'loss').length,
          winStreak: 0,
          averageGameDuration: 0,
          performanceByFormat: {
            bo1: { played: 0, won: 0 },
            bo3: { played: 0, won: 0 },
            bo5: { played: 0, won: 0 }
          }
        }

        // Анализируем статистику по игрокам
        const rosterAnalysis = teamData.roster?.map(player => ({
          nickname: player.nickname,
          role: player.role,
          performance: {
            averageKDA: player.average_kda,
            winRate: player.win_rate,
            impactScore: calculatePlayerImpact(player)
          },
          heroPool: player.signature_heroes?.map(hero => ({
            name: hero.name,
            gamesPlayed: hero.games_played,
            winRate: hero.win_rate
          }))
        }))

        return {
          teamId,
          teamName: teamData.name,
          rank: teamData.rank,
          overallWinRate: teamData.win_rate,
          formAnalysis,
          rosterAnalysis,
          strengthScore: calculateTeamStrength(formAnalysis, rosterAnalysis)
        }
      } catch (error) {
        console.error('Ошибка при анализе статистики команды:', error)
        throw error
      }
    }
  }
}

// Вспомогательные функции для расчетов
function calculatePlayerImpact(player) {
  // Рассчитываем влияние игрока на основе его статистики
  const kdaWeight = 0.4
  const winRateWeight = 0.6
  
  const kdaScore = (player.average_kda / 5) * 100 // Нормализуем KDA до 100
  const winRateScore = player.win_rate
  
  return (kdaScore * kdaWeight + winRateScore * winRateWeight).toFixed(2)
}

function calculateTeamStrength(formAnalysis, rosterAnalysis) {
  // Рассчитываем общую силу команды
  const recentFormWeight = 0.4
  const rosterStrengthWeight = 0.6
  
  // Оценка недавней формы (последние матчи)
  const recentFormScore = (formAnalysis.wins / formAnalysis.totalGames) * 100
  
  // Оценка силы состава
  const rosterStrength = rosterAnalysis.reduce((acc, player) => {
    return acc + parseFloat(player.performance.impactScore)
  }, 0) / rosterAnalysis.length
  
  return (recentFormScore * recentFormWeight + rosterStrength * rosterStrengthWeight).toFixed(2)
} 