import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Обработка ошибок Firebase
  const handleFirebaseError = (error) => {
    console.error('Firebase error:', error)
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Неверный формат email'
      case 'auth/user-disabled':
        return 'Пользователь заблокирован'
      case 'auth/user-not-found':
        return 'Пользователь не найден'
      case 'auth/wrong-password':
        return 'Неверный пароль'
      case 'auth/email-already-in-use':
        return 'Email уже используется'
      case 'auth/operation-not-allowed':
        return 'Операция не разрешена'
      case 'auth/weak-password':
        return 'Слишком простой пароль'
      case 'auth/popup-blocked':
        return 'Браузер заблокировал всплывающее окно. Пожалуйста, разрешите всплывающие окна для этого сайта.'
      case 'auth/popup-closed-by-user':
        return 'Окно авторизации было закрыто'
      case 'auth/cancelled-popup-request':
        return 'Авторизация была отменена'
      case 'auth/missing-or-invalid-nonce':
        return 'Ошибка безопасности. Попробуйте еще раз'
      default:
        return 'Произошла ошибка. Попробуйте позже.'
    }
  }

  // Регистрация
  async function signup(email, password, username) {
    try {
      setError('')
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Создаем документ пользователя
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        createdAt: serverTimestamp(),
        subscription: {
          plan: 'free',
          status: 'active',
          expiresAt: null
        },
        settings: {
          notifications: {
            telegram: false,
            discord: false,
            email: true
          }
        }
      })

      return user
    } catch (error) {
      setError(handleFirebaseError(error))
      throw error
    }
  }

  // Вход через Google
  async function loginWithGoogle() {
    try {
      setError('')
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Проверяем, существует ли документ пользователя
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // Создаем документ для нового пользователя
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          createdAt: serverTimestamp(),
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: null
          },
          settings: {
            notifications: {
              telegram: false,
              discord: false,
              email: true
            }
          }
        })
      }

      return user
    } catch (error) {
      setError(handleFirebaseError(error))
      throw error
    }
  }

  // Вход
  async function login(email, password) {
    try {
      setError('')
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      setError(handleFirebaseError(error))
      throw error
    }
  }

  // Выход
  async function logout() {
    try {
      setError('')
      await signOut(auth)
    } catch (error) {
      setError(handleFirebaseError(error))
      throw error
    }
  }

  // Сброс пароля
  async function resetPassword(email) {
    try {
      setError('')
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      setError(handleFirebaseError(error))
      throw error
    }
  }

  // Получение данных пользователя
  async function getUserData() {
    try {
      if (!currentUser) return null
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      return userDoc.data()
    } catch (error) {
      setError(handleFirebaseError(error))
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    getUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthContext 