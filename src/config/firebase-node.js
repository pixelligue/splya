import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import dotenv from 'dotenv'

// Загружаем переменные окружения из .env
dotenv.config()

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig)

// Инициализируем Firestore
const db = getFirestore(app)

export { db }
export default app 