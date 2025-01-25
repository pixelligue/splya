import React, { useState } from 'react'
import { RiRobot2Line } from 'react-icons/ri'
import { IoStatsChart, IoNotifications, IoTrendingUp, IoGameController, IoChatbubbles } from 'react-icons/io5'
import { subscriptionService } from '../../services/subscriptionService'
import toast from 'react-hot-toast'

const Live = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Введите email')
      return
    }

    setIsLoading(true)
    try {
      await subscriptionService.subscribe(email)
      toast.success('Вы успешно подписались на обновления!')
      setEmail('')
    } catch (error) {
      if (error.message === 'Этот email уже подписан') {
        toast.error('Этот email уже подписан на обновления')
      } else {
        toast.error('Произошла ошибка при подписке')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <IoGameController className="text-3xl text-blue-400" />,
      title: 'Live-трансляции',
      description: 'Смотрите матчи в реальном времени с комментариями'
    },
    {
      icon: <RiRobot2Line className="text-3xl text-blue-400" />,
      title: 'AI-аналитика',
      description: 'Анализ матчей и прогнозы от нашего ИИ'
    },
    {
      icon: <IoStatsChart className="text-3xl text-blue-400" />,
      title: 'Статистика',
      description: 'Детальная статистика команд и игроков'
    },
    {
      icon: <IoTrendingUp className="text-3xl text-blue-400" />,
      title: 'Тренды',
      description: 'Анализ текущей формы и трендов команд'
    },
    {
      icon: <IoChatbubbles className="text-3xl text-blue-400" />,
      title: 'Чат',
      description: 'Общайтесь с другими зрителями матча'
    },
    {
      icon: <IoNotifications className="text-3xl text-blue-400" />,
      title: 'Уведомления',
      description: 'Оповещения о важных событиях матча'
    }
  ]

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">Live матчи</h1>
          <span className="px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-full font-medium">
            Скоро
          </span>
        </div>
        <p className="text-xl text-white/90 leading-relaxed">
          Мы разрабатываем новый раздел с live-трансляциями матчей и AI-аналитикой в реальном времени
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="group">
            <div className="bg-zinc-900 rounded-2xl p-8 h-full transition-transform hover:scale-[1.02]">
              <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-white/80 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="bg-zinc-900 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-6">
            <IoNotifications className="text-3xl text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-white">Хотите узнать о запуске первыми?</h3>
          <p className="text-white/80 text-base mb-6">
            Оставьте свой email, и мы сообщим вам, когда раздел станет доступен
          </p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                className="flex-1 px-4 py-3 bg-black/50 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center bg-white text-black px-8 py-3 rounded-xl text-base font-medium transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? 'Подписка...' : 'Подписаться'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Live 