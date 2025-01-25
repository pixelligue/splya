import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

export const adminService = {
  // Сделать пользователя администратором
  makeAdmin: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('Пользователь не найден')
      }

      await setDoc(userRef, {
        ...userDoc.data(),
        role: 'admin'
      })

      return true
    } catch (error) {
      console.error('Ошибка при назначении администратора:', error)
      throw error
    }
  },

  // Проверить, является ли пользователь администратором
  checkAdmin: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      return userDoc.data()?.role === 'admin'
    } catch (error) {
      console.error('Ошибка при проверке роли:', error)
      return false
    }
  }
}

export default adminService 