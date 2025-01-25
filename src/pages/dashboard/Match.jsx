import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const Match = () => {
  const { id } = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  // Временные данные для демонстрации
  const demoMatch = {
    id: 1,
    team1: {
      name: 'OG',
      logo: null,
      recentMatches: [
        { result: 'win', opponent: 'Team Spirit', score: '2:0' },
        { result: 'win', opponent: 'Liquid', score: '2:1' },
        { result: 'loss', opponent: 'Gaimin Gladiators', score: '1:2' }
      ],
      winRate: 67
    },
    team2: {
      name: 'Zero Tenacity',
      logo: null,
      recentMatches: [
        { result: 'loss', opponent: 'BetBoom', score: '0:2' },
        { result: 'win', opponent: 'Entity', score: '2:1' },
        { result: 'loss', opponent: '9Pandas', score: '0:2' }
      ],
      winRate: 33
    },
    tournament: 'PGL',
    startTime: '2025-01-13T00:00:00',
    format: 'BO3',
    prediction: {
      winner: 'OG',
      confidence: 78,
      odds: 1.45,
      factors: [
        'Сильная форма OG в последних матчах',
        'Преимущество в личных встречах',
        'Более опытный состав'
      ]
    }
  }

  useEffect(() => {
    // Здесь будет загрузка реальных данных
    setMatch(demoMatch)
    setLoading(false)
  }, [id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Матч не найден</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 text-sm text-zinc-400 mb-2">
          <span>{match.tournament}</span>
          <span>•</span>
          <span>{formatDate(match.startTime)}</span>
          <span>•</span>
          <span>{match.format}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-medium text-white">{match.team1.name}</div>
            <div className="text-zinc-600">vs</div>
            <div className="text-2xl font-medium text-white">{match.team2.name}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Статистика команд */}
        <div className="col-span-2 space-y-6">
          {/* Команда 1 */}
          <div className="bg-[#1C1C1E] rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">{match.team1.name}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">Винрейт</div>
                <div className="text-white font-medium">{match.team1.winRate}%</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-2">Последние матчи</div>
                <div className="space-y-2">
                  {match.team1.recentMatches.map((m, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="text-sm text-zinc-400">{m.opponent}</div>
                      <div className={`text-sm font-medium ${
                        m.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {m.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Команда 2 */}
          <div className="bg-[#1C1C1E] rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">{match.team2.name}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">Винрейт</div>
                <div className="text-white font-medium">{match.team2.winRate}%</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400 mb-2">Последние матчи</div>
                <div className="space-y-2">
                  {match.team2.recentMatches.map((m, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="text-sm text-zinc-400">{m.opponent}</div>
                      <div className={`text-sm font-medium ${
                        m.result === 'win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {m.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Прогноз */}
        <div className="space-y-6">
          <div className="bg-[#1C1C1E] rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Прогноз AI</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">Победитель</div>
                <div className="text-white font-medium">{match.prediction.winner}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">Уверенность</div>
                <div className="text-white font-medium">{match.prediction.confidence}%</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-zinc-400">Коэффициент</div>
                <div className="text-white font-medium">{match.prediction.odds}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1C1E] rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Факторы</h3>
            <div className="space-y-2">
              {match.prediction.factors.map((factor, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                  <div className="text-sm text-zinc-400">{factor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Match 