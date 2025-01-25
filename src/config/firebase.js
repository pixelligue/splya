import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

// Проверяем наличие необходимых переменных окружения
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
]

// Проверяем наличие всех необходимых переменных
for (const varName of requiredEnvVars) {
  if (!import.meta.env[varName]) {
    console.error(`Missing environment variable: ${varName}`)
  }
}

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

console.log('Инициализация Firebase с конфигурацией:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
})

// Инициализация Firebase
const app = initializeApp(firebaseConfig)

// Инициализируем Auth
const auth = getAuth(app)

// Настраиваем персистентность
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence установлена')
  })
  .catch((error) => {
    console.error('Ошибка при установке persistence:', error)
  })

// Инициализируем Firestore
const db = getFirestore(app)

// Инициализируем Functions
const functions = getFunctions(app)

// Настраиваем Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
})

// Настраиваем язык
auth.useDeviceLanguage()

// Подключаем эмуляторы только если явно указано в .env
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  console.log('Running in emulator mode, connecting to emulators...')
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.log('Successfully connected to Firebase emulators')
  } catch (error) {
    console.error('Error connecting to emulators:', error)
  }
}

// Инициализируем Storage
const storage = getStorage(app)

console.log('Firebase initialized successfully')

export { auth, db, googleProvider, functions, storage }
export default app 