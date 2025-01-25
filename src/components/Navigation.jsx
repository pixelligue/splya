import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import logo from '../assets/logo.png'

const Navigation = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Закрываем дропдаун при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <nav className="w-full z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-zinc-800 fixed top-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-12">
              <Link to="/" className="block">
                <img 
                  src={logo} 
                  alt="predict.ai" 
                  className="h-36 w-auto hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-zinc-800/50 flex items-center justify-center overflow-hidden">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-zinc-400">
                          {currentUser.email?.[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1C1C1E] border border-zinc-800/50 rounded-xl shadow-lg py-1">
                      <div className="px-4 py-2 border-b border-zinc-800/50">
                        <p className="text-sm text-zinc-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-[#0A0A0A] transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Личный кабинет
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-[#0A0A0A] transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Настройки
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            setIsDropdownOpen(false)
                            await logout()
                            navigate('/auth')
                          } catch (error) {
                            console.error('Ошибка при выходе:', error)
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#0A0A0A] transition-colors"
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Кнопки временно отключены
                  <Link 
                    to="/auth?mode=login" 
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    Войти
                  </Link>
                  <Link 
                    to="/auth?mode=register" 
                    className="text-sm px-4 py-2 rounded-xl bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] transition-colors"
                  >
                    Регистрация
                  </Link>
                  */}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="h-20"></div>
    </>
  )
}

export default Navigation 