import { db } from '../config/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'

const COLLECTION_NAME = 'subscriptions'

export const subscriptionService = {
  async subscribe(email, type = 'live_launch') {
    try {
      // Проверяем, не подписан ли уже этот email
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email),
        where('type', '==', type)
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        throw new Error('Этот email уже подписан')
      }

      // Добавляем новую подписку
      await addDoc(collection(db, COLLECTION_NAME), {
        email,
        type,
        createdAt: serverTimestamp(),
        status: 'active'
      })

      return { success: true }
    } catch (error) {
      console.error('Ошибка при подписке:', error)
      throw error
    }
  },

  async unsubscribe(email, type = 'live_launch') {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('email', '==', email),
        where('type', '==', type)
      )
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        throw new Error('Подписка не найдена')
      }

      // Обновляем статус на cancelled
      const docRef = querySnapshot.docs[0].ref
      await docRef.update({
        status: 'cancelled',
        updatedAt: serverTimestamp()
      })

      return { success: true }
    } catch (error) {
      console.error('Ошибка при отписке:', error)
      throw error
    }
  }
} 