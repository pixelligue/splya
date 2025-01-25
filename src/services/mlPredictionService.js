import axios from 'axios'
import { openDotaService } from './openDotaService'
import { dotabuffService } from './dotabuffService'
import { datDotaService } from './datDotaService'

class MLPredictionService {
  constructor() {
    this.features = [
      'team_winrate',
      'recent_performance',
      'hero_winrates',
      'side_advantage',
      'head_to_head'
    ]
  }

  // Подготовка данных для модели
  async prepareFeatures(team1Id, team2Id) {
    try {
      // Получаем данные из разных источников
      const [
        team1OpenDota,
        team2OpenDota,
        team1Recent,
        team2Recent,
        headToHead
      ] = await Promise.all([
        openDotaService.getTeamStats(team1Id),
        openDotaService.getTeamStats(team2Id),
        openDotaService.getTeamRecentMatches(team1Id, 10),
        openDotaService.getTeamRecentMatches(team2Id, 10),
        datDotaService.getHeadToHead(team1Id, team2Id)
      ])

      // Базовые метрики
      const features = {
        // Общий винрейт команд
        team1_winrate: team1OpenDota ? team1OpenDota.wins / (team1OpenDota.wins + team1OpenDota.losses) : 0.5,
        team2_winrate: team2OpenDota ? team2OpenDota.wins / (team2OpenDota.wins + team2OpenDota.losses) : 0.5,

        // Последние 10 матчей
        team1_recent: this.calculateRecentPerformance(team1Recent, team1Id),
        team2_recent: this.calculateRecentPerformance(team2Recent, team2Id),

        // История личных встреч
        h2h_advantage: this.calculateH2HAdvantage(headToHead, team1Id, team2Id),

        // Рейтинг команд
        team1_rating: team1OpenDota?.rating || 1000,
        team2_rating: team2OpenDota?.rating || 1000
      }

      return features
    } catch (error) {
      console.error('Ошибка при подготовке данных для ML:', error)
      throw error
    }
  }

  // Расчет производительности в последних матчах
  calculateRecentPerformance(matches, teamId) {
    if (!matches || matches.length === 0) return 0.5

    const wins = matches.filter(match => {
      const isRadiant = match.radiant_team_id === teamId
      return isRadiant ? match.radiant_win : !match.radiant_win
    }).length

    return wins / matches.length
  }

  // Расчет преимущества в личных встречах
  calculateH2HAdvantage(h2h, team1Id, team2Id) {
    if (!h2h || !h2h.matches || h2h.matches.length === 0) return 0.5

    const team1Wins = h2h.matches.filter(match => {
      return match.winner === 'team1'
    }).length

    return team1Wins / h2h.matches.length
  }

  // Базовое предсказание на основе собранных метрик
  async predictMatch(team1Id, team2Id) {
    try {
      const features = await this.prepareFeatures(team1Id, team2Id)

      // Простая модель взвешенных факторов
      const weights = {
        winrate: 0.3,
        recent: 0.3,
        h2h: 0.2,
        rating: 0.2
      }

      // Расчет вероятности победы team1
      const team1Score = 
        (features.team1_winrate * weights.winrate) +
        (features.team1_recent * weights.recent) +
        (features.h2h_advantage * weights.h2h) +
        ((features.team1_rating / (features.team1_rating + features.team2_rating)) * weights.rating)

      // Нормализация результата
      const team1Probability = Math.min(Math.max(team1Score, 0.1), 0.9)
      const team2Probability = 1 - team1Probability

      return {
        team1: {
          probability: team1Probability,
          confidence: this.calculateConfidence(features, team1Probability)
        },
        team2: {
          probability: team2Probability,
          confidence: this.calculateConfidence(features, team2Probability)
        },
        features: features // Возвращаем метрики для анализа
      }
    } catch (error) {
      console.error('Ошибка при генерации ML-предсказания:', error)
      throw error
    }
  }

  // Расчет уверенности в предсказании
  calculateConfidence(features, probability) {
    // Базовая формула уверенности на основе разброса метрик
    const metrics = [
      features.team1_winrate,
      features.team2_winrate,
      features.team1_recent,
      features.team2_recent,
      features.h2h_advantage
    ]

    // Стандартное отклонение метрик
    const mean = metrics.reduce((a, b) => a + b, 0) / metrics.length
    const variance = metrics.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / metrics.length
    const stdDev = Math.sqrt(variance)

    // Чем меньше разброс, тем выше уверенность
    const baseConfidence = 1 - stdDev
    
    // Корректируем уверенность на основе вероятности
    // Очень высокие или низкие вероятности увеличивают уверенность
    const probabilityFactor = Math.abs(probability - 0.5) * 2
    
    return Math.min(Math.max(baseConfidence * (1 + probabilityFactor), 0.3), 0.9)
  }
}

export const mlPredictionService = new MLPredictionService() 