import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../config/firebase'
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'

const PredictionLikes = ({ predictionId }) => {
  const { currentUser } = useAuth()
  const [likes, setLikes] = useState([])
  const [hasLiked, setHasLiked] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'likes'),
      where('predictionId', '==', predictionId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const likesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setLikes(likesData)
      setHasLiked(likesData.some(like => like.userId === currentUser?.uid))
    })

    return () => unsubscribe()
  }, [predictionId, currentUser])

  const toggleLike = async () => {
    if (!currentUser) return

    const likeRef = doc(db, 'likes', `${predictionId}_${currentUser.uid}`)

    try {
      if (hasLiked) {
        await deleteDoc(likeRef)
      } else {
        await setDoc(likeRef, {
          predictionId,
          userId: currentUser.uid,
          createdAt: new Date()
        })
      }
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleLike}
        className={`p-1.5 rounded-full transition-colors ${
          hasLiked ? 'text-red-500 hover:bg-red-500/10' : 'text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        {hasLiked ? (
          <HeartIconSolid className="w-5 h-5" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
      </button>
      <span className="text-sm text-zinc-400">{likes.length}</span>
    </div>
  )
}

export default PredictionLikes 