import { db } from '../config/firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

export const userStatsService = {
  // Получение статистики пользователя
  getUserStats: async (userId) => {
    try {
      const stats = {
        totalPredictions: 0,
        successRate: 0,
        profitPercent: 0,
        currentStreak: 0
      }

      // Получаем все прогнозы пользователя
      const predictionsRef = collection(db, 'predictions')
      const userPredictionsQuery = query(
        predictionsRef,
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      )
      const predictionsSnapshot = await getDocs(userPredictionsQuery)
      const predictions = predictionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Общее количество прогнозов
      stats.totalPredictions = predictions.length

      // Подсчет успешных прогнозов
      if (predictions.length > 0) {
        const completedPredictions = predictions.filter(p => p.result)
        const successfulPredictions = completedPredictions.filter(p => {
          const actualWinner = p.score ? 
            p.score.split(':').reduce((winner, score, index) => {
              return parseInt(score) > parseInt(p.score.split(':')[winner ? 0 : 1]) ? index : winner
            }, null) : null
          const predictedWinner = p.prediction === p.team1 ? 0 : 1
          return actualWinner === predictedWinner
        })

        if (completedPredictions.length > 0) {
          stats.successRate = Math.round((successfulPredictions.length / completedPredictions.length) * 100)
        }

        // Подсчет текущей серии
        let streak = 0
        for (const prediction of predictions) {
          if (!prediction.result) continue

          const actualWinner = prediction.score ? 
            prediction.score.split(':').reduce((winner, score, index) => {
              return parseInt(score) > parseInt(prediction.score.split(':')[winner ? 0 : 1]) ? index : winner
            }, null) : null
          const predictedWinner = prediction.prediction === prediction.team1 ? 0 : 1

          if (actualWinner === predictedWinner) {
            streak++
          } else {
            break
          }
        }
        stats.currentStreak = streak

        // Расчет прибыли (если есть коэффициенты)
        const predictionsWithOdds = completedPredictions.filter(p => p.odds)
        if (predictionsWithOdds.length > 0) {
          let totalBet = predictionsWithOdds.length * 100 // Предполагаем ставку 100 на каждый прогноз
          let totalWin = predictionsWithOdds.reduce((sum, p) => {
            const actualWinner = p.score ? 
              p.score.split(':').reduce((winner, score, index) => {
                return parseInt(score) > parseInt(p.score.split(':')[winner ? 0 : 1]) ? index : winner
              }, null) : null
            const predictedWinner = p.prediction === p.team1 ? 0 : 1
            const isWin = actualWinner === predictedWinner

            if (isWin) {
              const odds = p.prediction === p.team1 ? p.odds.team1 : p.odds.team2
              return sum + (odds * 100)
            }
            return sum
          }, 0)

          stats.profitPercent = Math.round(((totalWin - totalBet) / totalBet) * 100)
        }
      }

      return stats
    } catch (error) {
      console.error('Ошибка при получении статистики пользователя:', error)
      throw error
    }
  },

  // Получение информации о подписке
  getUserSubscriptionInfo: async (userId) => {
    try {
      const subscriptionsRef = collection(db, 'subscriptions')
      const userSubscriptionQuery = query(
        subscriptionsRef,
        where('userId', '==', userId),
        where('active', '==', true),
        limit(1)
      )
      const subscriptionSnapshot = await getDocs(userSubscriptionQuery)
      
      if (subscriptionSnapshot.empty) {
        return null
      }

      const subscription = subscriptionSnapshot.docs[0].data()
      return {
        plan: subscription.plan,
        predictionsLeft: subscription.predictionsLeft,
        validUntil: subscription.validUntil.toDate()
      }
    } catch (error) {
      console.error('Ошибка при получении информации о подписке:', error)
      throw error
    }
  }
}

export default userStatsService 