import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export const useAdmin = () => {
  const { currentUser } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === 'admin')
        } else {
          // Если документ пользователя не существует, создаем его с ролью admin (только для разработки)
          if (import.meta.env.DEV) {
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              role: 'admin',
              createdAt: serverTimestamp()
            })
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error('Ошибка при проверке прав администратора:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [currentUser])

  return { isAdmin, loading }
}

export default useAdmin 