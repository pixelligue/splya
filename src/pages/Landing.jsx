import React from 'react'
import { Link } from 'react-router-dom'
import { RiRobot2Line } from 'react-icons/ri'
import { IoStatsChart, IoNotifications } from 'react-icons/io5'
import { HiCheck } from 'react-icons/hi'
import { FaBitcoin } from 'react-icons/fa'

const Landing = () => {
  const GOOGLE_FORM_URL = "https://forms.gle/gFbCUuyWq7MLtNhr8"

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8">
                AI-прогнозы
                <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  на матчи Dota 2
                </span>
              </h1>
              <p className="text-2xl text-zinc-400 mb-12 leading-relaxed">
                Используйте силу искусственного интеллекта для анализа и прогнозов на профессиональные матчи в режиме реального времени
              </p>
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
                Узнать подробнее
              </a>
            </div>

            {/* Demo Interface */}
            <div className="relative">
              <div className="bg-zinc-900 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <span className="text-blue-400 text-xl font-medium">VP</span>
                    </div>
                    <div>
                      <div className="text-xl font-medium">Virtus.pro vs Team Spirit</div>
                      <div className="text-zinc-400">The International 2024</div>
                    </div>
                  </div>
                  <div className="text-blue-400 font-medium">LIVE</div>
                </div>
                <div className="space-y-6">
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="text-zinc-400 mb-2">AI Рекомендация</div>
                    <div className="text-xl font-medium mb-1">Анализ матча</div>
                    <div className="text-blue-400">В процессе...</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="text-zinc-400 mb-2">Анализ ситуации</div>
                    <div className="text-lg">Детальный разбор текущей игровой ситуации и драфта</div>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <div>Режим реального времени</div>
                    <div>Обновлено 30 сек назад</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <span className="text-blue-400 text-lg font-medium mb-4 block">Возможности</span>
            <h2 className="text-6xl font-bold mb-8 tracking-tight">
              Преимущества сервиса
              <span className="block text-zinc-500">основанные на данных</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Используйте современные технологии для принятия взвешенных решений
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <RiRobot2Line className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI Анализ</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Комплексный анализ ключевых параметров каждой команды в реальном времени на основе последних матчей
                </p>
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Режим работы</span>
                    <span>24/7</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <IoStatsChart className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Статистика</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Детальный анализ винрейта, пиков, банов и других метрик команд
                </p>
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Обновление</span>
                    <span>В реальном времени</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <IoNotifications className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Уведомления</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Мгновенные оповещения о начале матчей и важных событиях
                </p>
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Доставка</span>
                    <span>Мгновенно</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-8">Готовы попробовать?</h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Присоединяйтесь к бета-тестированию и получите ранний доступ к нашей платформе
          </p>
          <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
            Подать заявку
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-4">Тарифные планы</h2>
          <p className="text-xl text-zinc-400 text-center mb-20 max-w-2xl mx-auto">
            Выберите подходящий тариф для ваших целей
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group">
              <div className="bg-zinc-900 rounded-2xl p-10 transition-transform hover:scale-[1.02]">
                <div className="text-2xl font-semibold mb-2">Базовый</div>
                <div className="text-4xl font-bold mb-1">490 ₽</div>
                <div className="text-zinc-400 mb-8">в месяц</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>7 дней бесплатно</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>5 прогнозов в месяц</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>10 разборов игры</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Базовая аналитика</span>
                  </li>
                </ul>
                
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" 
                   className="block text-center py-4 px-6 rounded-full bg-zinc-800 text-lg font-medium transition-transform hover:scale-[1.02] mb-4">
                  Попробовать бесплатно
                </a>
                <div className="flex items-center justify-center text-zinc-400 text-sm">
                  <FaBitcoin className="text-[#F7931A] mr-2" />
                  <span>Доступна оплата криптовалютой</span>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-zinc-900 rounded-2xl p-10 transition-transform hover:scale-[1.02] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-sm px-4 py-1 rounded-full font-medium">
                  Популярный выбор
                </div>
                
                <div className="text-2xl font-semibold mb-2">Продвинутый</div>
                <div className="text-4xl font-bold mb-1">990 ₽</div>
                <div className="text-zinc-400 mb-8">в месяц</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>50 прогнозов в месяц</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>50 разборов игры</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Про аналитика</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Приоритетная поддержка</span>
                  </li>
                </ul>
                
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer"
                   className="block text-center py-4 px-6 rounded-full bg-white text-black text-lg font-medium transition-transform hover:scale-[1.02] mb-4">
                  Получить доступ
                </a>
                <div className="flex items-center justify-center text-zinc-400 text-sm">
                  <FaBitcoin className="text-[#F7931A] mr-2" />
                  <span>Доступна оплата криптовалютой</span>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-zinc-900 rounded-2xl p-10 transition-transform hover:scale-[1.02]">
                <div className="text-2xl font-semibold mb-2">PRO</div>
                <div className="text-4xl font-bold mb-1">2990 ₽</div>
                <div className="text-zinc-400 mb-8">в месяц</div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>250 прогнозов в месяц</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Безлимитные разборы</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Полный доступ к аналитике</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Персональный менеджер</span>
                  </li>
                </ul>
                
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer"
                   className="block text-center py-4 px-6 rounded-full bg-zinc-800 text-lg font-medium transition-transform hover:scale-[1.02] mb-4">
                  Получить доступ
                </a>
                <div className="flex items-center justify-center text-zinc-400 text-sm">
                  <FaBitcoin className="text-[#F7931A] mr-2" />
                  <span>Доступна оплата криптовалютой</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <span className="text-blue-400 text-lg font-medium mb-4 block">Процесс</span>
            <h2 className="text-6xl font-bold mb-8 tracking-tight">
              Как это работает
              <span className="block text-zinc-500">технология ESAi</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Наш искусственный интеллект анализирует множество факторов для создания детальных прогнозов
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div className="bg-zinc-900 rounded-3xl p-10 relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12C21 16.9706 16.9706 21 12 21M21 12C21 7.02944 16.9706 3 12 3M21 12H17M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">1. Сбор данных</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Система собирает информацию о командах, игроках и матчах из множества источников в реальном времени
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div className="bg-zinc-900 rounded-3xl p-10 relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3V21M12 3L7 8M12 3L17 8M12 21L7 16M12 21L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">2. Обработка</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  AI анализирует статистику, историю встреч, текущую форму и другие важные параметры команд
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div className="bg-zinc-900 rounded-3xl p-10 relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">3. Результат</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  На основе анализа система формирует прогноз с указанием вероятности исхода и уверенности в прогнозе
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-zinc-900 rounded-3xl p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">Постоянное совершенствование</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  После каждого матча система анализирует результаты и корректирует свои алгоритмы, становясь точнее с каждым прогнозом
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.5 2V9.85999C15.5 10.3 14.98 10.52 14.66 10.23L12.34 8.09003C12.15 7.91003 11.85 7.91003 11.66 8.09003L9.34003 10.23C9.02003 10.52 8.5 10.3 8.5 9.85999V2H15.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-blue-400 text-lg font-medium mb-4 block">Почему нам доверяют</span>
              <h2 className="text-6xl font-bold mb-8 tracking-tight">
                Технологии и данные
                <span className="block text-zinc-500">для точных прогнозов</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Мы используем передовые технологии и анализ данных для создания точных прогнозов на матчи Dota 2
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mb-24">
              <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">AI</div>
                <div className="text-lg text-zinc-400">Умный анализ</div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">50K+</div>
                <div className="text-lg text-zinc-400">Матчей в базе</div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">24/7</div>
                <div className="text-lg text-zinc-400">Мониторинг матчей</div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">ML</div>
                <div className="text-lg text-zinc-400">Машинное обучение</div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-12 md:p-12 p-6">
              <div className="grid md:grid-cols-2 gap-16 md:gap-16 gap-8">
                <div>
                  <h3 className="text-4xl md:text-4xl text-3xl font-bold mb-6">Анализ тактик и комбинаций</h3>
                  <p className="text-xl md:text-xl text-lg text-zinc-400 leading-relaxed mb-8">
                    Наш AI анализирует эффективность различных комбинаций героев и тактик команд. Система учитывает синергию героев, историю их совместного использования и результативность в разных составах.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-black/50 rounded-2xl py-3 px-6 flex-1 min-w-[140px]">
                      <div className="text-sm text-zinc-400 mb-1">Анализ комбинаций</div>
                      <div className="text-2xl font-semibold">В реальном времени</div>
                    </div>
                    <div className="bg-black/50 rounded-2xl py-3 px-6 flex-1 min-w-[140px]">
                      <div className="text-sm text-zinc-400 mb-1">Матчей сегодня</div>
                      <div className="text-2xl font-semibold">47</div>
                    </div>
                    <div className="bg-black/50 rounded-2xl py-3 px-6 flex-1 min-w-[140px]">
                      <div className="text-sm text-zinc-400 mb-1">Глубина анализа</div>
                      <div className="text-2xl font-semibold">Детальный</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl"></div>
                  <div className="aspect-video bg-black/50 rounded-2xl p-8 md:p-8 p-4 relative z-10">
                    <div className="h-full flex flex-col">
                      <div className="flex justify-between items-center mb-8 md:mb-8 mb-4">
                        <div className="text-lg md:text-lg text-base font-medium">Эффективность тактик</div>
                        <div className="text-blue-400 text-sm md:text-base">Анализ в реальном времени</div>
                      </div>
                      <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-semibold mb-2">Анализ комбинаций героев</div>
                          <p className="text-zinc-400">
                            Оценка эффективности связок героев и тактических решений команд
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Play */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-zinc-900 rounded-3xl p-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-400 text-lg font-medium mb-4 block">Честная игра</span>
                <h2 className="text-4xl font-bold mb-6">Прозрачность и этика</h2>
                <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                  Мы поддерживаем развитие честного киберспорта. Наши алгоритмы основаны только на публичных данных и официальной статистике матчей.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-zinc-400">Анализ основан на открытых данных и официальной статистике</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-zinc-400">Поддержка fair play в киберспорте</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-zinc-400">Сотрудничество с официальными турнирными операторами</p>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl"></div>
                <div className="aspect-square bg-black/50 rounded-2xl p-8 relative z-10">
                  <div className="h-full flex items-center justify-center">
                    <svg className="w-32 h-32 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Начните использовать AI прогнозы</h2>
            <p className="text-xl text-zinc-400 mb-12">
              Присоединяйтесь к тысячам пользователей, которые уже используют искусственный интеллект для анализа матчей
            </p>
            <a href="https://forms.gle/vGTvP3HgSc4pGTDPA" target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
              Попробовать бесплатно
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">
                Sply ai
              </div>
              <a href="https://t.me/esai_support" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 9.89 15.9 13.21 15.6 14.74C15.47 15.42 15.22 15.65 14.98 15.68C14.45 15.75 14.05 15.35 13.54 15.01C12.72 14.47 12.26 14.13 11.47 13.61C10.56 13.01 11.16 12.68 11.69 12.12C11.83 11.97 14.09 9.9 14.14 9.7C14.15 9.67 14.15 9.57 14.09 9.52C14.03 9.47 13.94 9.49 13.87 9.5C13.77 9.52 12.47 10.38 9.96 12.08C9.54 12.37 9.16 12.51 8.82 12.5C8.44 12.49 7.72 12.29 7.17 12.12C6.5 11.91 5.96 11.8 6.01 11.43C6.03 11.24 6.3 11.04 6.82 10.85C9.54 9.65 11.32 8.85 12.18 8.44C14.64 7.26 15.18 7.07 15.54 7.07C15.62 7.07 15.81 7.09 15.93 7.19C16.03 7.27 16.06 7.38 16.07 7.46C16.06 7.52 16.65 8.71 16.64 8.8Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing 