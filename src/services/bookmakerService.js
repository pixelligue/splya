import axios from 'axios'
import cheerio from 'cheerio'

const PROXY_URL = import.meta.env.VITE_PROXY_URL

// Конфигурация axios с прокси
const proxyApi = axios.create({
  baseURL: PROXY_URL,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
})

export const bookmakerService = {
  // Парсинг 1xBet
  parse1xBet: async () => {
    try {
      const response = await proxyApi.get('/1xbet/esports/cs-go')
      const $ = cheerio.load(response.data)
      
      const matches = []
      
      // Селекторы для 1xBet (нужно адаптировать под реальную структуру)
      $('div[class*="game-block"]').each((i, elem) => {
        try {
          const team1Name = $(elem).find('div[class*="team1"] span[class*="name"]').text().trim()
          const team2Name = $(elem).find('div[class*="team2"] span[class*="name"]').text().trim()
          const team1Odds = parseFloat($(elem).find('div[class*="coef1"]').text().trim())
          const team2Odds = parseFloat($(elem).find('div[class*="coef2"]').text().trim())
          const startTimeStr = $(elem).find('div[class*="time"]').attr('data-time')
          const tournament = $(elem).find('div[class*="tournament"]').text().trim()

          // Проверяем валидность данных
          if (team1Name && team2Name && !isNaN(team1Odds) && !isNaN(team2Odds)) {
            matches.push({
              team1: {
                name: team1Name,
                odds: team1Odds
              },
              team2: {
                name: team2Name,
                odds: team2Odds
              },
              startTime: startTimeStr ? new Date(startTimeStr).toISOString() : null,
              tournament,
              source: '1xBet',
              game: 'cs-go'
            })
          }
        } catch (error) {
          console.error('Error parsing match element:', error)
        }
      })

      return matches
    } catch (error) {
      console.error('Error parsing 1xBet:', error)
      return []
    }
  },

  // Парсинг Fonbet
  parseFonbet: async () => {
    try {
      const response = await proxyApi.get('/fonbet/esports/counter-strike')
      const $ = cheerio.load(response.data)
      
      const matches = []
      
      // Селекторы для Fonbet (нужно адаптировать под реальную структуру)
      $('div[class*="event-item"]').each((i, elem) => {
        try {
          const team1Name = $(elem).find('span[class*="team1-name"]').text().trim()
          const team2Name = $(elem).find('span[class*="team2-name"]').text().trim()
          const team1Odds = parseFloat($(elem).find('span[class*="factor1"]').text().trim())
          const team2Odds = parseFloat($(elem).find('span[class*="factor2"]').text().trim())
          const startTimeStr = $(elem).find('span[class*="time"]').attr('data-time')
          const tournament = $(elem).find('span[class*="tournament"]').text().trim()

          // Проверяем валидность данных
          if (team1Name && team2Name && !isNaN(team1Odds) && !isNaN(team2Odds)) {
            matches.push({
              team1: {
                name: team1Name,
                odds: team1Odds
              },
              team2: {
                name: team2Name,
                odds: team2Odds
              },
              startTime: startTimeStr ? new Date(startTimeStr).toISOString() : null,
              tournament,
              source: 'Fonbet',
              game: 'cs-go'
            })
          }
        } catch (error) {
          console.error('Error parsing match element:', error)
        }
      })

      return matches
    } catch (error) {
      console.error('Error parsing Fonbet:', error)
      return []
    }
  },

  // Агрегация коэффициентов с разных букмекеров
  aggregateOdds: async (matchData) => {
    try {
      // Получаем данные параллельно
      const [xbetOdds, fonbetOdds] = await Promise.all([
        bookmakerService.parse1xBet(),
        bookmakerService.parseFonbet()
      ])

      // Функция для нечеткого сравнения названий команд
      const fuzzyTeamMatch = (bookieTeam, matchTeam) => {
        const normalize = (str) => str.toLowerCase().replace(/[^a-zа-я0-9]/g, '')
        const bookieNorm = normalize(bookieTeam)
        const matchNorm = normalize(matchTeam)
        return bookieNorm.includes(matchNorm) || matchNorm.includes(bookieNorm)
      }

      // Ищем матч в данных букмекеров с учетом нечеткого сравнения
      const findMatchOdds = (bookieMatches, match) => {
        return bookieMatches.find(bookieMatch => {
          const team1Match = fuzzyTeamMatch(bookieMatch.team1.name, match.team1)
          const team2Match = fuzzyTeamMatch(bookieMatch.team2.name, match.team2)
          return team1Match && team2Match
        })
      }

      const xbetMatch = findMatchOdds(xbetOdds, matchData)
      const fonbetMatch = findMatchOdds(fonbetOdds, matchData)

      // Вычисляем лучшие коэффициенты и маржу
      const bestOdds = {
        team1: Math.max(
          xbetMatch?.team1.odds || 0,
          fonbetMatch?.team1.odds || 0
        ),
        team2: Math.max(
          xbetMatch?.team2.odds || 0,
          fonbetMatch?.team2.odds || 0
        )
      }

      // Вычисляем маржу букмекера (если есть коэффициенты)
      const calculateMargin = (odds1, odds2) => {
        if (!odds1 || !odds2) return null
        return ((1 / odds1 + 1 / odds2) - 1) * 100
      }

      return {
        match: matchData,
        odds: {
          '1xbet': xbetMatch ? {
            team1: xbetMatch.team1.odds,
            team2: xbetMatch.team2.odds,
            margin: calculateMargin(xbetMatch.team1.odds, xbetMatch.team2.odds)
          } : null,
          'fonbet': fonbetMatch ? {
            team1: fonbetMatch.team1.odds,
            team2: fonbetMatch.team2.odds,
            margin: calculateMargin(fonbetMatch.team1.odds, fonbetMatch.team2.odds)
          } : null
        },
        bestOdds,
        valueOdds: {
          team1: bestOdds.team1 > 0 ? {
            value: bestOdds.team1,
            source: bestOdds.team1 === xbetMatch?.team1.odds ? '1xbet' : 'fonbet'
          } : null,
          team2: bestOdds.team2 > 0 ? {
            value: bestOdds.team2,
            source: bestOdds.team2 === xbetMatch?.team2.odds ? '1xbet' : 'fonbet'
          } : null
        },
        updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error aggregating odds:', error)
      return null
    }
  },

  // Получение истории коэффициентов
  getOddsHistory: async (matchId) => {
    try {
      const response = await proxyApi.get(`/odds/history/${matchId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching odds history:', error)
      return null
    }
  }
}

export default bookmakerService 