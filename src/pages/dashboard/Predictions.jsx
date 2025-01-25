import React from 'react'
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, Timestamp, limit, updateDoc, doc } from 'firebase/firestore'
import { db, auth } from '../../config/firebase'
import PredictionCard from '../../components/PredictionCard'
import UpcomingMatchesList from '../../components/UpcomingMatchesList'
import { predictionService } from '../../services/predictionService'
import { toast } from 'react-hot-toast'
import { useSubscription } from '../../hooks/useSubscription'
import { useNavigate } from 'react-router-dom'

const Predictions = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [gameFilter, setGameFilter] = useState('all')
  const [tournamentFilter, setTournamentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { subscription } = useSubscription()
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      console.log('Начинаем загрузку прогнозов...')
      
      const predictionsRef = collection(db, 'predictions')
      const now = new Date()
      const currentTimestamp = Timestamp.fromDate(now)
      
      // Получаем только просмотренные прогнозы
      const q = query(
        predictionsRef,
        where('viewedBy', 'array-contains', auth.currentUser.uid),
        orderBy('startTime', 'desc'),
        limit(50)
      )
      
      const querySnapshot = await getDocs(q)
      const predictionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate?.() || doc.data().startTime
      }))
      
      setPredictions(predictionsList)
    } catch (error) {
      console.error('Ошибка при загрузке прогнозов:', error)
      toast.error('Не удалось загрузить прогнозы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  // Автоматическое обновление результатов
  useEffect(() => {
    const updateResults = async () => {
      try {
        const updatedCount = await predictionService.updateMatchResults()
        if (updatedCount > 0) {
          // Обновляем список прогнозов если были обновления
          fetchPredictions()
        }
      } catch (error) {
        console.error('Ошибка при обновлении результатов:', error)
      }
    }

    // Обновляем результаты при загрузке
    updateResults()

    // Запускаем обновление каждые 5 минут
    const interval = setInterval(updateResults, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Функция для проверки, соответствует ли прогноз выбранной дате
  const matchesSelectedDate = (prediction) => {
    if (!prediction.startTime) return false
    
    const predictionDate = new Date(prediction.startTime)
    const selectedDate = new Date(dateFilter)
    
    return predictionDate.getFullYear() === selectedDate.getFullYear() &&
           predictionDate.getMonth() === selectedDate.getMonth() &&
           predictionDate.getDate() === selectedDate.getDate()
  }

  // Функция для фильтрации прогнозов
  const filterPredictions = (prediction) => {
    const matchesGame = gameFilter === 'all' || prediction.game === gameFilter
    const matchesTournament = tournamentFilter === 'all' || prediction.tournament === tournamentFilter
    const matchesDate = matchesSelectedDate(prediction)
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && !prediction.result) ||
      (statusFilter === 'completed' && prediction.result)

    return matchesGame && matchesTournament && matchesDate && matchesStatus
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-zinc-400 text-lg">Загрузка прогнозов...</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Информация о подписке */}
      {subscription?.level === 'free' && (
        <div className="mb-8 p-6 bg-[#1C1C1E] border border-zinc-800/50 rounded-2xl">
          <h2 className="text-xl font-medium text-white mb-2">
            Получите больше возможностей с PRO
          </h2>
          <p className="text-zinc-400 mb-4">
            Подпишитесь на PRO тариф, чтобы получить неограниченный доступ к прогнозам и аналитике
          </p>
          <a
            href="/dashboard/subscriptions"
            className="inline-block px-4 py-2 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
          >
            Подробнее о PRO
          </a>
        </div>
      )}

      {/* Доступные матчи */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white mb-6">Доступные матчи</h1>
        <UpcomingMatchesList />
      </div>

      {/* История прогнозов */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-medium text-white">История прогнозов</h2>
          <div className="px-4 py-1 rounded-full bg-[#1C1C1E] text-zinc-400 text-sm font-medium">
            {predictions.filter(filterPredictions).length}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {predictions.filter(filterPredictions).map(prediction => (
            <PredictionCard 
              key={prediction.id} 
              prediction={prediction}
              isAdmin={false}
            />
          ))}
        </div>

        {predictions.filter(filterPredictions).length === 0 && (
          <div className="text-center py-12">
            <div className="text-xl text-white mb-2">Нет прогнозов</div>
            <div className="text-zinc-400">
              Прогнозы появятся здесь после их создания
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Predictions 