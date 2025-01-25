import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../config/firebase'
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'

const PredictionComments = ({ predictionId }) => {
  const { currentUser } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('predictionId', '==', predictionId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setComments(commentsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [predictionId])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    if (!newComment.trim()) return

    try {
      await addDoc(collection(db, 'comments'), {
        predictionId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        text: newComment,
        createdAt: Timestamp.now()
      })
      setNewComment('')
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    )
  }

  const visibleComments = showAll ? comments : comments.slice(0, 5)

  return (
    <div className="space-y-4">
      {currentUser ? (
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            className="flex-1 bg-[#1C1C1E] border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Отправить
          </button>
        </form>
      ) : (
        <div className="text-zinc-500 text-sm">Войдите, чтобы оставить комментарий</div>
      )}

      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="bg-[#1C1C1E] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-zinc-400">{comment.userEmail}</div>
              <div className="text-xs text-zinc-500">
                {comment.createdAt.toDate().toLocaleString()}
              </div>
            </div>
            <div className="text-white">{comment.text}</div>
          </div>
        ))}
        
        {comments.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {showAll ? 'Скрыть' : `Показать еще ${comments.length - 5} комментариев`}
          </button>
        )}
      </div>
    </div>
  )
}

export default PredictionComments 