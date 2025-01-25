import React from 'react'
import MatchAnalysis from './MatchAnalysis'

const MatchList = ({ matches, loadingMatches, onAnalyze, onResetPrediction, analysisData }) => {
  if (!matches.length) {
    return null
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Предстоящие матчи</h2>
      <div className="space-y-4">
        {matches.map((match) => (
          <MatchAnalysis
            key={match?.id || Math.random()}
            match={match}
            loading={loadingMatches[match.id] || false}
            onAnalyze={onAnalyze}
            onResetPrediction={onResetPrediction}
            analysisData={analysisData}
          />
        ))}
      </div>
    </div>
  )
}

export default MatchList 