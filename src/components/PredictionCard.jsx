import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Trash2, Edit2, Save, X, Lock } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useSubscription } from '../hooks/useSubscription'
import { doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const PredictionCard = ({ prediction, isAdmin = false, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrediction, setEditedPrediction] = useState({
    predicted_winner: prediction.predicted_winner || '',
    team1_chance: prediction.team1_chance || 50,
    team2_chance: prediction.team2_chance || 50,
    reasoning: prediction.reasoning || ''
  })
  const navigate = useNavigate()
  const { subscription } = useSubscription()
  const [showFullExplanation, setShowFullExplanation] = useState(false)

  const isAccessible = subscription?.level === 'pro' || isAdmin

  const getPredictionStatus = (prediction) => {
    if (!prediction.result) {
      return {
        class: 'bg-yellow-400/10 text-yellow-400',
        text: 'В ожидании'
      }
    }

    return prediction.result === prediction.predicted_winner
      ? { class: 'bg-green-400/10 text-green-400', text: 'Прогноз верный' }
      : { class: 'bg-red-400/10 text-red-400', text: 'Прогноз неверный' }
  }

  const handleDelete = async () => {
    try {
      console.log('Deleting prediction:', prediction);
      
      await deleteDoc(doc(db, "predictions", prediction.id));
      
      toast.success('Прогноз удален');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Ошибка при удалении прогноза:', error);
      toast.error('Ошибка при удалении прогноза');
    }
  };

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "predictions", prediction.id), {
        predicted_winner: editedPrediction.predicted_winner,
        team1_chance: editedPrediction.team1_chance,
        team2_chance: editedPrediction.team2_chance,
        reasoning: editedPrediction.reasoning,
        updated_at: new Date().toISOString()
      });

      setIsEditing(false);
      toast.success('Прогноз обновлен');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Ошибка при обновлении прогноза:', error);
      toast.error('Ошибка при обновлении прогноза');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPrediction({
      predicted_winner: prediction.predicted_winner || '',
      team1_chance: prediction.team1_chance || 50,
      team2_chance: prediction.team2_chance || 50,
      reasoning: prediction.reasoning || ''
    });
  };

  const status = getPredictionStatus(prediction)

  return (
    <div className="bg-[#1C1C1E] border border-zinc-800/50 rounded-2xl overflow-hidden">
      <div className="p-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Заголовок матча */}
            <div className="flex items-center mb-8">
              <img
                src="/icons/dota2.svg"
                alt="Dota 2"
                className="h-10 w-10 mr-4"
              />
              <div>
                <h3 className="text-xl font-medium text-white mb-1">
                  {prediction.team1_name} vs {prediction.team2_name}
                </h3>
                <p className="text-sm text-zinc-400">
                  {[
                    prediction.tournament_name,
                    prediction.tournament_serie,
                    prediction.tournament_stage
                  ].filter(Boolean).join(' • ')}
                </p>
              </div>
            </div>

            {/* Основная информация */}
            <div className="space-y-8">
              {/* Прогноз и статус */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-sm text-zinc-400 mb-3">
                    Прогноз ИИ
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-400/10 text-blue-400 rounded-full">
                      Верифицирован
                    </span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value={editedPrediction.predicted_winner}
                        onChange={(e) => setEditedPrediction({
                          ...editedPrediction,
                          predicted_winner: e.target.value
                        })}
                        className="bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-2 text-white"
                      />
                      <input
                        type="number"
                        value={editedPrediction.team1_chance}
                        onChange={(e) => setEditedPrediction({
                          ...editedPrediction,
                          team1_chance: parseInt(e.target.value),
                          team2_chance: 100 - parseInt(e.target.value)
                        })}
                        className="bg-[#0A0A0A] border border-zinc-800 rounded-xl px-4 py-2 text-white w-24"
                        min="1"
                        max="100"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 text-sm bg-[#0A0A0A] text-white rounded-full">
                        {prediction.predicted_winner || 'Нет прогноза'}
                      </span>
                      <span className="text-sm text-zinc-400">
                        Уверенность: {prediction.team1_chance ? Math.round(prediction.team1_chance) : 0}%
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-3">Статус</div>
                  <span className={`px-4 py-1.5 text-sm rounded-full ${status.class}`}>
                    {status.text}
                  </span>
                </div>
              </div>

              {/* Анализ ИИ */}
              <div className="bg-[#0A0A0A] rounded-xl p-6">
                <div className="text-sm font-medium text-white mb-3">Анализ ИИ</div>
                {isEditing ? (
                  <textarea
                    value={editedPrediction.reasoning}
                    onChange={(e) => setEditedPrediction({
                      ...editedPrediction,
                      reasoning: e.target.value
                    })}
                    className="w-full bg-[#1C1C1E] border border-zinc-800 rounded-xl p-4 text-white"
                    rows={4}
                  />
                ) : (
                  <div className="text-sm text-zinc-400 whitespace-pre-wrap">
                    {prediction.reasoning || 'Анализ не предоставлен'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Админ-панель */}
          {isAdmin && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Время и результат */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <div className="text-sm text-zinc-400">
              Создан: {new Date(prediction.created_at).toLocaleString()}
            </div>
            {prediction.result && (
              <div className="text-sm font-medium text-white">
                Счёт: {prediction.result}
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        {isAccessible && prediction.odds && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#2C2C2E] rounded-xl">
              <div className="text-sm text-zinc-400 mb-2">Коэффициент</div>
              <div className="text-lg font-medium text-white">
                {typeof prediction.odds === 'number' 
                  ? prediction.odds.toFixed(2)
                  : prediction.odds.bestOdds?.team1?.toFixed(2) || '-'}
              </div>
            </div>
            <div className="p-4 bg-[#2C2C2E] rounded-xl">
              <div className="text-sm text-zinc-400 mb-2">Потенциальный выигрыш</div>
              <div className="text-lg font-medium text-white">
                {typeof prediction.odds === 'number' && prediction.confidence
                  ? `x${(prediction.odds * prediction.confidence).toFixed(2)}`
                  : (prediction.odds.bestOdds?.team1 && prediction.confidence
                    ? `x${(prediction.odds.bestOdds.team1 * prediction.confidence).toFixed(2)}`
                    : '-')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionCard 