import OpenAI from 'openai'
import { pushrApiService } from './pushrApiService'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL,
  dangerouslyAllowBrowser: true
})

const formatMatchDataForPrompt = (matchData, teamStats) => {
  const { teams, headToHead } = teamStats

  return {
    game: 'dota2',
    team1: {
      name: teams.team1.name,
      rank: teams.team1.rank,
      winRate: teams.team1.winRate,
      recentForm: teams.team1.recentResults?.map(m => m.result).join(', '),
      roster: teams.team1.roster?.map(p => ({
        name: p.nickname,
        role: p.role,
        performance: p.performance
      }))
    },
    team2: {
      name: teams.team2.name,
      rank: teams.team2.rank,
      winRate: teams.team2.winRate,
      recentForm: teams.team2.recentResults?.map(m => m.result).join(', '),
      roster: teams.team2.roster?.map(p => ({
        name: p.nickname,
        role: p.role,
        performance: p.performance
      }))
    },
    tournament: matchData.tournament || 'Unknown',
    format: matchData.format || 'bo3',
    startTime: matchData.startTime || new Date().toISOString(),
    headToHead: {
      total: headToHead.totalMatches,
      team1Wins: headToHead.team1Wins,
      team2Wins: headToHead.team2Wins
    }
  }
}

const generatePrompt = (formattedData) => {
  return `Проанализируй матч Dota 2 между командами ${formattedData.team1.name} и ${formattedData.team2.name}.

Информация о командах:

${formattedData.team1.name}:
- Ранг: ${formattedData.team1.rank}
- Винрейт: ${formattedData.team1.winRate}%
- Недавняя форма: ${formattedData.team1.recentForm}
- Состав: ${formattedData.team1.roster?.map(p => `${p.name} (${p.role})`).join(', ') || 'Нет данных'}

${formattedData.team2.name}:
- Ранг: ${formattedData.team2.rank}
- Винрейт: ${formattedData.team2.winRate}%
- Недавняя форма: ${formattedData.team2.recentForm}
- Состав: ${formattedData.team2.roster?.map(p => `${p.name} (${p.role})`).join(', ') || 'Нет данных'}

История встреч:
- Всего матчей: ${formattedData.headToHead.total}
- Победы ${formattedData.team1.name}: ${formattedData.headToHead.team1Wins}
- Победы ${formattedData.team2.name}: ${formattedData.headToHead.team2Wins}

Турнир: ${formattedData.tournament}
Формат: ${formattedData.format}

Дай прогноз в следующем формате (верни только JSON, без маркеров markdown):
{
  "prediction": "команда или исход",
  "confidence": число от 1 до 100,
  "explanation": "подробное объяснение на 1000 символов, почему сделан такой прогноз",
  "odds": {
    "team1": число от 1 до 5,
    "team2": число от 1 до 5
  }
}`
}

export const aiPredictionService = {
  // Генерация прогноза на основе данных из Pandascore
  generatePredictionFromPandascore: async (matchData) => {
    try {
      // Получаем имена команд из структуры матча
      const team1Name = matchData.teams?.[0]?.name || matchData.opponents?.[0]?.opponent?.name
      const team2Name = matchData.teams?.[1]?.name || matchData.opponents?.[1]?.opponent?.name

      if (!team1Name || !team2Name) {
        throw new Error('Не удалось получить имена команд')
      }

      console.log('Получаем данные для команд:', team1Name, team2Name)

      // Получаем данные о командах из WordPress API
      const teamStats = await pushrApiService.predictions.getMatchPredictionDataByPandascoreTeams(
        team1Name,
        team2Name
      )

      console.log('Данные команд из WordPress:', teamStats)

      // Форматируем данные для промпта
      const formattedData = formatMatchDataForPrompt(matchData, teamStats)
      
      console.log('Данные для AI:', formattedData)
      
      // Генерируем промпт
      const prompt = generatePrompt(formattedData)

      // Получаем прогноз от OpenAI
      const chatCompletion = await client.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'Ты опытный аналитик Dota 2 с глубоким пониманием игры. Твои прогнозы должны быть подробными и хорошо обоснованными. Отвечай только в формате JSON без маркеров markdown и других символов.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 1000,
        model: 'gpt-4o-mini',
        temperature: 0.7
      })

      const response = chatCompletion.choices[0]?.message?.content
      if (!response) throw new Error('Нет ответа от AI')

      // Очищаем и парсим ответ
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
      
      try {
        const parsedResponse = JSON.parse(cleanResponse)
        const result = {
          ...parsedResponse,
          matchId: matchData.id || matchData.external_id,
          team1: team1Name,
          team2: team2Name,
          tournament: matchData.tournament?.name,
          startTime: matchData.begin_at || matchData.scheduled_at,
          format: matchData.tournament?.format || (matchData.number_of_games > 1 ? `bo${matchData.number_of_games}` : 'bo1'),
          explanation: parsedResponse.explanation || parsedResponse.reasoning || 'Объяснение не предоставлено',
          predicted_winner: parsedResponse.prediction || team1Name,
          team1_chance: parsedResponse.confidence || 50,
          team2_chance: 100 - (parsedResponse.confidence || 50)
        }
        console.log('Финальный результат:', result)
        return result
      } catch (e) {
        console.error('Ошибка парсинга JSON ответа:', e)
        throw new Error('Ошибка обработки ответа от AI')
      }
    } catch (error) {
      console.error('Ошибка при генерации прогноза:', error)
      throw error
    }
  }
}

export default aiPredictionService 