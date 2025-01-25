import React, { useState, useEffect } from 'react'

const MatchAnalysis = ({ match, loading, onAnalyze, onResetPrediction, analysisData }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [hasPrediction, setHasPrediction] = useState(false)

  // Преобразуем ID в строку для безопасности
  const matchId = String(match.id)
  const matchAnalysis = analysisData?.[matchId]

  useEffect(() => {
    if (matchAnalysis && Object.keys(matchAnalysis).length > 0) {
      setHasPrediction(true)
    } else {
      setHasPrediction(false)
    }
  }, [matchAnalysis])

  const formatTeamData = (teamData) => {
    if (!teamData) {
      console.log('Нет данных для команды')
      return 'Нет данных'
    }
    console.log('Форматирование данных команды:', teamData)
    return (
      <div className="space-y-2">
        <div>
          <strong>OpenDota:</strong>
          <pre className="text-sm">{JSON.stringify(teamData.openDota, null, 2)}</pre>
        </div>
        <div>
          <strong>Dotabuff:</strong>
          <pre className="text-sm">{JSON.stringify(teamData.dotabuff, null, 2)}</pre>
        </div>
        <div>
          <strong>DatDota:</strong>
          <pre className="text-sm">{JSON.stringify(teamData.datDota, null, 2)}</pre>
        </div>
      </div>
    )
  }

  const formatAiPrediction = (prediction) => {
    if (!prediction) {
      console.log('Нет данных для AI прогноза')
      return 'Нет прогноза'
    }
    console.log('Форматирование прогноза:', prediction)
    return (
      <div className="space-y-2">
        <div><strong>Прогноз:</strong> {prediction.prediction}</div>
        <div><strong>Уверенность:</strong> {prediction.confidence}%</div>
        <div>
          <strong>Коэффициенты:</strong>
          <div>Команда 1: {prediction.odds?.team1 || 'N/A'}</div>
          <div>Команда 2: {prediction.odds?.team2 || 'N/A'}</div>
        </div>
        {prediction.explanation && (
          <div className="mt-4">
            <strong>Объяснение ИИ:</strong>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
              {prediction.explanation}
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleAnalyze = async () => {
    try {
      await onAnalyze(match)
      setHasPrediction(true)
    } catch (error) {
      console.error('Ошибка при анализе:', error)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Вы уверены, что хотите сбросить прогноз?')) {
      try {
        await onResetPrediction(match.id)
        setHasPrediction(false)
        setShowDetails(false)
      } catch (error) {
        console.error('Ошибка при сбросе:', error)
      }
    }
  }

  // Проверяем наличие данных для отображения
  const shouldShowDetails = showDetails && matchAnalysis

  return (
    <div className={`border rounded-lg p-4 mb-4 shadow-sm ${hasPrediction ? 'bg-green-50' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {match.opponents?.[0]?.opponent?.name || 'TBD'} vs {match.opponents?.[1]?.opponent?.name || 'TBD'}
          </h3>
          <p className="text-sm text-gray-600">
            {match.tournament?.name || 'Турнир не указан'} - {new Date(match.begin_at).toLocaleString()}
          </p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            {showDetails ? 'Скрыть детали' : 'Показать детали'}
          </button>
          {!hasPrediction ? (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded disabled:opacity-50"
            >
              {loading ? 'Анализ...' : 'Сделать прогноз'}
            </button>
          ) : (
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-500 text-white hover:bg-red-600 rounded disabled:opacity-50"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {shouldShowDetails && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Команда 1: {match.opponents?.[0]?.opponent?.name || 'TBD'}</h4>
              {formatTeamData(matchAnalysis?.team1Analysis)}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Команда 2: {match.opponents?.[1]?.opponent?.name || 'TBD'}</h4>
              {formatTeamData(matchAnalysis?.team2Analysis)}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Прогноз ИИ</h4>
            {formatAiPrediction(matchAnalysis?.aiPrediction)}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchAnalysis 