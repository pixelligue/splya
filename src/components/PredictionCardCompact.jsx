import React from 'react'
import { useNavigate } from 'react-router-dom'

const PredictionCardCompact = ({ prediction }) => {
  const navigate = useNavigate()

  const getPredictionStatus = (prediction) => {
    if (!prediction.result) {
      return {
        class: 'bg-yellow-400/10 text-yellow-400',
        text: 'В ожидании'
      }
    }

    return prediction.result === prediction.prediction
      ? { class: 'bg-green-400/10 text-green-400', text: 'Прогноз верный' }
      : { class: 'bg-red-400/10 text-red-400', text: 'Прогноз неверный' }
  }

  const status = getPredictionStatus(prediction)

  return (
    <div 
      className="bg-[#1C1C1E] border border-zinc-800/50 rounded-xl p-6 cursor-pointer hover:bg-[#2C2C2E] transition-colors"
      onClick={() => navigate(`/dashboard/match/${prediction.matchId}`)}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {prediction.game && (
            <img
              src={`/icons/${prediction.game.toLowerCase()}.svg`}
              alt={prediction.game}
              className="h-6 w-6"
            />
          )}
          <span className="text-sm text-zinc-400">{prediction.tournament}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${status.class}`}>
          {status.text}
        </span>
      </div>

      {/* Команды и прогноз */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-white font-medium">{prediction.team1}</div>
          <div className="text-zinc-600">vs</div>
          <div className="text-white font-medium">{prediction.team2}</div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-zinc-400">Победа: </span>
            <span className="text-white font-medium">{prediction.prediction}</span>
          </div>
          {prediction.confidence && (
            <div className="text-sm">
              <span className="text-zinc-400">Уверенность: </span>
              <span className="text-white font-medium">{prediction.confidence}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Время матча */}
      <div className="mt-4 text-sm text-zinc-400">
        {new Date(prediction.startTime).toLocaleString()}
      </div>
    </div>
  )
}

export default PredictionCardCompact 