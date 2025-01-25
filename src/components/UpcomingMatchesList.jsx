import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle } from 'react-feather'
import { pandaScoreService } from '../services/pandaScoreService'
import { aiPredictionService } from '../services/aiPredictionService'
import { Button, Space } from 'antd'
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useSubscription } from '../hooks/useSubscription'
import { auth } from '../config/firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const UpcomingMatchesList = ({ onPredictionCreated, adminMode = false, isGenerating = false, onManualPrediction }) => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingPrediction, setCreatingPrediction] = useState(null)
  const [existingPredictions, setExistingPredictions] = useState({})
  const [page, setPage] = useState(1)
  const matchesPerPage = 5
  const { subscription, checkAndUpdatePredictionLimit } = useSubscription()

  // Загрузка прогнозов для матчей из Firebase
  const loadPredictions = async (matches) => {
    try {
      const predictionsRef = collection(db, 'predictions')
      const matchIds = matches.map(m => m.external_id)
      
      // Проверяем, есть ли матчи для загрузки
      if (matchIds.length === 0) {
        setExistingPredictions({})
        return
      }

      // Загружаем прогнозы порциями по 10 матчей
      const batchSize = 10
      const predictionsMap = {}

      for (let i = 0; i < matchIds.length; i += batchSize) {
        const batchIds = matchIds.slice(i, i + batchSize)
        const q = query(predictionsRef, where('match_id', 'in', batchIds))
        const querySnapshot = await getDocs(q)
        
        querySnapshot.forEach(doc => {
          const prediction = doc.data()
          predictionsMap[prediction.match_id] = prediction
        })
      }
      
      setExistingPredictions(predictionsMap)
    } catch (error) {
      console.error('Ошибка при загрузке прогнозов:', error)
      toast.error('Не удалось загрузить прогнозы')
    }
  }

  // Загрузка матчей
  const loadMatches = async () => {
    try {
      setLoading(true)
      
      // Сначала пробуем загрузить из Firebase
      const matchesRef = collection(db, 'matches')
      const q = query(
        matchesRef, 
        where('status', '==', 'upcoming'),
        orderBy('begin_at', 'asc')
      )
      const snapshot = await getDocs(q)
      
      let matchesData = []
      snapshot.forEach(doc => {
        matchesData.push({ id: doc.id, ...doc.data() })
      })

      // Если матчей нет или их мало, обновляем из PandaScore
      if (matchesData.length < 10) {
        const newMatches = await pandaScoreService.getUpcomingMatches()
        // После получения новых матчей, они уже сохранены в Firebase
        // Загружаем обновленный список
        const newSnapshot = await getDocs(q)
        matchesData = []
        newSnapshot.forEach(doc => {
          matchesData.push({ id: doc.id, ...doc.data() })
        })
      }

      setMatches(matchesData)
      await loadPredictions(matchesData)
    } catch (error) {
      console.error('Ошибка при загрузке матчей:', error)
      toast.error('Ошибка при загрузке матчей')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [])

  const handlePredictionCreate = async (match) => {
    try {
      // Проверяем лимит прогнозов
      const canCreatePrediction = await checkAndUpdatePredictionLimit()
      if (!canCreatePrediction) {
        toast.error('Достигнут дневной лимит прогнозов для вашего тарифа')
        return
      }

      setCreatingPrediction(match.external_id)
      
      // Получаем прогноз от ИИ
      const prediction = await aiPredictionService.generatePredictionFromPandascore(match)
      
      console.log('Полученный прогноз:', prediction) // Добавляем для отладки
      
      // Создаем прогноз в Firebase
      const predictionData = {
        match_id: match.external_id,
        tournament_name: match.tournament?.name || 'Неизвестный турнир',
        tournament_serie: match.tournament?.serie || '',
        tournament_stage: match.tournament?.stage || '',
        team1_name: match.teams?.[0]?.name || match.opponents?.[0]?.opponent?.name || 'Команда 1',
        team2_name: match.teams?.[1]?.name || match.opponents?.[1]?.opponent?.name || 'Команда 2',
        team1_chance: prediction.team1_chance || prediction.confidence || 50,
        team2_chance: prediction.team2_chance || (100 - (prediction.confidence || 50)),
        predicted_winner: prediction.predicted_winner || prediction.prediction || prediction.team1_name || match.teams?.[0]?.name || 'Неизвестно',
        reasoning: prediction.explanation || prediction.reasoning || 'Анализ не предоставлен',
        created_at: new Date().toISOString(),
        begin_at: match.begin_at || new Date().toISOString(),
        status: 'pending',
        type: 'auto',
        odds: prediction.odds || null,
        confidence: prediction.confidence || prediction.team1_chance || 50,
        result: null,
        viewedBy: [auth.currentUser.uid]
      }

      console.log('Данные для сохранения:', predictionData) // Добавляем для отладки

      const predictionsRef = collection(db, 'predictions')
      await addDoc(predictionsRef, predictionData)
      
      // Обновляем список прогнозов
      await loadPredictions([match])
      
      // Уведомляем родительский компонент
      if (onPredictionCreated) {
        onPredictionCreated(match)
      }

      toast.success('Прогноз успешно создан')
    } catch (error) {
      console.error('Ошибка при создании прогноза:', error)
      toast.error('Не удалось создать прогноз: ' + error.message)
    } finally {
      setCreatingPrediction(null)
    }
  }

  const loadTeamStats = async (teamName) => {
    try {
      const response = await fetch(`/api/teams/${encodeURIComponent(teamName)}/stats`);
      if (!response.ok) {
        console.warn(`Не удалось загрузить статистику для команды ${teamName}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Ошибка при загрузке статистики для команды ${teamName}:`, error);
      return null;
    }
  };

  const displayedMatches = matches.slice(0, page * matchesPerPage)
  const hasMoreMatches = matches.length > page * matchesPerPage

  return (
    <div className="bg-[#1C1C1E] border border-zinc-800/50 rounded-2xl overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-white">Доступные матчи</h2>
            {!adminMode && subscription && (
              <p className="text-sm text-zinc-400 mt-1">
                Использовано прогнозов: {subscription.predictionsUsedToday || 0} из {
                  subscription.level === 'free' ? '3' : '∞'
                }
              </p>
            )}
          </div>
          <button
            onClick={loadMatches}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0A0A0A] rounded-xl hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : 'Обновить список'}
          </button>
        </div>

        {displayedMatches.length > 0 ? (
          <>
            <div className="space-y-4">
              {displayedMatches.map(match => (
                <div
                  key={match.external_id}
                  className="p-6 bg-[#1C1C1E] border border-zinc-800/50 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-medium text-white">
                          {match.teams[0].name} vs {match.teams[1].name}
                        </h3>
                        <span className="px-3 py-1 text-sm bg-[#0A0A0A] text-zinc-400 rounded-full">
                          {match.tournament.format}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-400">
                        <span className="text-orange-400">{match.tournament.name}</span>
                        {match.tournament.serie && <> • <span className="text-zinc-500">{match.tournament.serie}</span></>}
                        {match.tournament.stage && <> • <span>{match.tournament.stage}</span></>} • {new Date(match.begin_at).toLocaleString()}
                      </div>
                    </div>
                    {existingPredictions[match.external_id] ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-sm text-zinc-400">
                          Прогноз получен
                        </span>
                      </div>
                    ) : (
                      <Space>
                        <button
                          onClick={() => handlePredictionCreate(match)}
                          disabled={creatingPrediction === match.external_id || isGenerating}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#0A0A0A] rounded-xl hover:bg-zinc-900 transition-colors disabled:opacity-50"
                        >
                          {creatingPrediction === match.external_id ? (
                            'Загрузка...'
                          ) : adminMode ? (
                            'Авто прогноз'
                          ) : (
                            'Получить прогноз'
                          )}
                        </button>
                        {adminMode && (
                          <button
                            onClick={() => onManualPrediction && onManualPrediction({
                              match_id: match.external_id,
                              team1_name: match.teams[0].name,
                              team2_name: match.teams[1].name,
                              tournament_name: match.tournament.name,
                              tournament_serie: match.tournament.serie,
                              tournament_stage: match.tournament.stage
                            })}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors"
                          >
                            Ручной прогноз
                          </button>
                        )}
                      </Space>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMoreMatches && (
              <div className="text-center pt-6">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  className="px-6 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Показать ещё
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-[#1C1C1E] rounded-2xl border border-zinc-800/50">
            <div className="text-zinc-400 text-lg">Нет доступных матчей</div>
            <div className="mt-2 text-sm text-zinc-500">
              Нажмите кнопку "Обновить список" для загрузки матчей
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpcomingMatchesList 