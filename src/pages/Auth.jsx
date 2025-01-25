import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login, signup, loginWithGoogle, resetPassword } = useAuth()

  const quotes = [
    {
      text: "Чтобы стать чемпионом, нужно верить в себя, когда никто другой не верит.",
      author: "Данил 'Dendi' Ишутин",
      team: "NAVI"
    },
    {
      text: "Успех приходит к тем, кто готов учиться на каждой ошибке и никогда не сдаваться.",
      author: "Йохан 'N0tail' Сундштайн",
      team: "OG"
    },
    {
      text: "В киберспорте, как и в жизни, важно не то, сколько раз ты падаешь, а то, сколько раз ты поднимаешься.",
      author: "Клемент 'Puppey' Иванов",
      team: "Team Secret"
    }
  ]

  const [currentQuote, setCurrentQuote] = useState(0)

  // Меняем цитату каждые 10 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password, username)
      }
      navigate('/dashboard')
    } catch (error) {
      setError(
        error.code === 'auth/wrong-password' ? 'Неверный пароль' :
        error.code === 'auth/user-not-found' ? 'Пользователь не найден' :
        error.code === 'auth/email-already-in-use' ? 'Email уже используется' :
        'Произошла ошибка. Попробуйте позже.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        setError('Пожалуйста, разрешите всплывающие окна для входа через Google. Проверьте настройки браузера.')
      } else {
        setError('Ошибка входа через Google. Попробуйте другой способ входа.')
      }
      console.error('Google login error:', error)
    }
  }

  const handleResetPassword = async () => {
    try {
      await resetPassword(email)
      setError('Инструкции по сбросу пароля отправлены на ваш email')
    } catch (error) {
      setError('Ошибка при сбросе пароля')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Форма авторизации */}
      <div className="w-1/2 bg-[#0A0A0A] p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'С возвращением' : 'Создать аккаунт'}
            </h2>
            <p className="text-zinc-400">
              {isLogin ? 'Войдите для доступа к AI прогнозам' : 'Зарегистрируйтесь для получения доступа к AI прогнозам'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Имя пользователя
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1C1C1E] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ваше имя"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1C1C1E] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1C1C1E] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-500 bg-[#1C1C1E] border-zinc-800 rounded focus:ring-0 focus:ring-offset-0"
                  />
                  <label className="ml-2 text-sm text-zinc-400">
                    Запомнить меня
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  Забыли пароль?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </button>

            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0A0A0A] text-zinc-400">
                  Или войдите через
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-zinc-800 rounded-xl text-white hover:bg-[#1C1C1E] transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5 mr-2"
              />
              Google
            </button>
          </form>
        </div>
      </div>

      {/* Цитаты */}
      <div className="w-1/2 bg-[#0A0A0A] p-8 flex items-center justify-center relative overflow-hidden">
        {/* Градиентные элементы */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-lg z-10">
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2">
              predict.ai
            </h3>
            <p className="text-zinc-400">AI-прогнозы для профессиональных матчей</p>
          </div>
          
          <div className="space-y-12">
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <blockquote className="text-3xl font-medium text-white mb-6 leading-relaxed">
                "{quotes[currentQuote].text}"
              </blockquote>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
                  {quotes[currentQuote].author.split(' ')[1][1]}
                </div>
                <div>
                  <div className="font-medium text-white text-lg">
                    {quotes[currentQuote].author}
                  </div>
                  <div className="text-blue-400 font-medium">
                    {quotes[currentQuote].team}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {quotes.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentQuote ? 'w-8 bg-blue-500' : 'w-2 bg-zinc-800'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth 