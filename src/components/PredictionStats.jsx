import React from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { useNavigate } from 'react-router-dom'

const mockStats = {
  totalPredictions: 156,
  successfulPredictions: 98,
  successRate: 62.8,
  proStats: {
    byTournament: [
      { name: 'The International 2023', success: 75.5 },
      { name: 'ESL One Berlin 2023', success: 68.2 },
      { name: 'PGL Major Copenhagen', success: 71.4 }
    ],
    lastPredictions: [
      {
        id: 1,
        team1: 'Team Spirit',
        team2: 'Gaimin Gladiators',
        tournament: 'The International 2023',
        result: 'win'
      },
      {
        id: 2,
        team1: 'Team Liquid',
        team2: 'Tundra Esports',
        tournament: 'ESL One Berlin 2023',
        result: 'loss'
      },
      {
        id: 3,
        team1: 'PSG.LGD',
        team2: 'Team Secret',
        tournament: 'PGL Major Copenhagen',
        result: 'win'
      }
    ]
  }
}

const PredictionStats = () => {
  const { subscription } = useSubscription()
  const navigate = useNavigate()
  const hasProAccess = subscription?.level === 'pro'

  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Всего прогнозов</div>
          <div className="text-2xl font-medium text-white">{mockStats.totalPredictions}</div>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Успешных</div>
          <div className="text-2xl font-medium text-white">{mockStats.successfulPredictions}</div>
        </div>

        <div className="p-6 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <div className="text-sm text-zinc-400 mb-2">Процент успеха</div>
          <div className="text-2xl font-medium text-white">{mockStats.successRate}%</div>
        </div>
      </div>

      {/* PRO статистика */}
      {hasProAccess ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Статистика по турнирам */}
          <div className="p-6 bg-[#1C1C1E] rounded-2xl border border-zinc-800/50">
            <h3 className="text-lg font-medium text-white mb-4">По турнирам</h3>
            <div className="space-y-4">
              {mockStats.proStats.byTournament.map(tournament => (
                <div key={tournament.name} className="flex justify-between items-center">
                  <div className="text-sm text-zinc-400">{tournament.name}</div>
                  <div className="text-sm font-medium text-white">{tournament.success}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Последние прогнозы */}
          <div className="p-6 bg-[#1C1C1E] rounded-2xl border border-zinc-800/50">
            <h3 className="text-lg font-medium text-white mb-4">Последние прогнозы</h3>
            <div className="space-y-4">
              {mockStats.proStats.lastPredictions.map(prediction => (
                <div key={prediction.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white mb-1">
                      {prediction.team1} vs {prediction.team2}
                    </div>
                    <div className="text-xs text-zinc-400">{prediction.tournament}</div>
                  </div>
                  <div className={`text-sm font-medium ${
                    prediction.result === 'win' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {prediction.result === 'win' ? 'Успешный' : 'Неуспешный'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-[#1C1C1E] rounded-2xl border border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Получите больше статистики с PRO
              </h3>
              <p className="text-zinc-400">
                Подробная статистика по турнирам, расширенная аналитика и история прогнозов
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/subscriptions')}
              className="px-4 py-2 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
            >
              Подробнее о PRO
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionStats 