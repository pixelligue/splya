import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { IoFootball, IoTrophy, IoAnalytics } from 'react-icons/io5'

const Overview = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [demoPredictions, setDemoPredictions] = useState([])
  const [stats, setStats] = useState({
    totalMatches: 0,
    accuracy: 0,
    rating: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(
          collection(db, 'predictions'),
          where('isPublic', '==', true),
          where('status', '==', 'completed')
        )
        const snapshot = await getDocs(q)
        const predictions = snapshot.docs.map(doc => doc.data())
        
        const successful = predictions.filter(p => p.result === 'win').length
        const totalMatches = predictions.length
        const accuracy = totalMatches > 0 ? ((successful / totalMatches) * 100).toFixed(1) : 0
        const rating = predictions.reduce((acc, p) => acc + (p.rating || 0), 0) / totalMatches

        setStats({
          totalMatches,
          accuracy,
          rating: rating.toFixed(2)
        })
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error)
      }
    }

    const fetchDemoPredictions = async () => {
      try {
        const q = query(
          collection(db, 'predictions'),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(3)
        )
        const snapshot = await getDocs(q)
        const predictionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setDemoPredictions(predictionsData)
      } catch (error) {
        console.error('Ошибка при загрузке демо прогнозов:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    fetchDemoPredictions()
  }, [])

  const insights = [
    {
      icon: <IoFootball className="text-3xl text-blue-400" />,
      title: `${stats.totalMatches}+`,
      description: 'Матчей проанализировано'
    },
    {
      icon: <IoTrophy className="text-3xl text-blue-400" />,
      title: `${stats.accuracy}%`,
      description: 'Точность прогнозов'
    },
    {
      icon: <IoAnalytics className="text-3xl text-blue-400" />,
      title: `${stats.rating}`,
      description: 'Рейтинг качества'
    }
  ]

  const tips = [
    {
      title: 'Как работают наши прогнозы',
      content: 'Каждый прогноз включает: детальный анализ команд, историю встреч, текущую форму и статистику. AI помогает выявить скрытые закономерности.'
    },
    {
      title: 'Управление рисками',
      content: 'Рекомендуем придерживаться системного подхода и не принимать импульсивных решений. Следуйте стратегии.'
    },
    {
      title: 'Важность аналитики',
      content: 'Используйте наши прогнозы как часть вашего анализа. Изучайте предоставленную статистику и принимайте взвешенные решения.'
    }
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Прогнозы нового поколения
        </h1>
        <p className="text-xl text-zinc-400">
          Используйте силу искусственного интеллекта для принятия верных решений
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {insights.map((insight, index) => (
          <div key={index} className="bg-zinc-900 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              {insight.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{insight.title}</h3>
            <p className="text-zinc-400">{insight.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 rounded-2xl p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Полезные советы</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tips.map((tip, index) => (
            <div key={index} className="bg-black/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">{tip.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Последние прогнозы</h2>
          <button
            onClick={() => navigate('/dashboard/subscriptions')}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Получить доступ
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {demoPredictions.map(prediction => (
              <div key={prediction.id} className="bg-black/20 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">
                      {prediction.teams?.team1} vs {prediction.teams?.team2}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {prediction.tournament}
                    </p>
                  </div>
                  <div className="text-sm text-zinc-400">
                    {prediction.matchDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                    Демо
                  </div>
                  <div className="text-zinc-400">
                    Оформите подписку для доступа к полному прогнозу
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Готовы принимать правильные решения?
        </h2>
        <p className="text-lg text-zinc-300 mb-6">
          Получите доступ к профессиональной аналитике
        </p>
        <button
          onClick={() => navigate('/dashboard/subscriptions')}
          className="px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-100 transition-colors"
        >
          Выбрать тариф
        </button>
      </div>
    </div>
  )
}

export default Overview 