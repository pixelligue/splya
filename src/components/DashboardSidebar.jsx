import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../hooks/useSubscription'
import { toast } from 'react-hot-toast'
import logo from '../assets/logo.png'

const DashboardSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { subscription, loading } = useSubscription()

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Личный кабинет',
      requiresPro: false,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      path: '/dashboard/predictions',
      label: 'Прогнозы',
      requiresPro: false,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      path: '/dashboard/analytics',
      label: 'Аналитика',
      requiresPro: true,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/dashboard/live',
      label: 'Live матчи',
      requiresPro: true,
      badge: 'Скоро',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      )
    },
    {
      path: '/dashboard/subscriptions',
      label: 'Подписки',
      requiresPro: false,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ]

  const handleMenuClick = (item) => {
    // Если это страница подписок, всегда разрешаем доступ
    if (item.path === '/dashboard/subscriptions') {
      navigate(item.path)
      return
    }

    // Если данные загружаются, ждем
    if (loading) {
      return
    }
    
    // Проверяем необходимость PRO доступа
    if (item.requiresPro && subscription?.level !== 'pro') {
      toast.error('Этот раздел доступен только для PRO пользователей')
      navigate('/dashboard/subscriptions')
      return
    }
    
    navigate(item.path)
  }

  const hasProAccess = loading || subscription?.level === 'pro'

  return (
    <div className="w-80 bg-[#0A0A0A] border-r border-zinc-800 h-screen fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="flex justify-left">
          <Link to="/" className="block m-0">
            <img 
              src={logo} 
              alt="predict.ai" 
              className="h-36 w-auto hover:opacity-80 transition-opacity -mt-10 -mb-12"
            />
          </Link>
        </div>

        <div className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center px-8 py-4 text-lg text-zinc-400 hover:bg-[#1C1C1E] hover:text-white transition-all ${
                location.pathname === item.path ? 'text-white bg-[#1C1C1E]' : ''
              }`}
            >
              <span className="mr-4">{item.icon}</span>
              <div className="flex items-center gap-2">
                {item.label}
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-blue-400/10 text-blue-400 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.requiresPro && !hasProAccess && (
                  <span className="px-2 py-0.5 text-xs bg-orange-400/10 text-orange-400 rounded-full">
                    PRO
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button
            onClick={logout}
            className="w-full flex items-center px-6 py-4 text-lg text-red-400 hover:text-red-300 hover:bg-[#1C1C1E] rounded-xl transition-all"
          >
            <svg className="w-7 h-7 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardSidebar 