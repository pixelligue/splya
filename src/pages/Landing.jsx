import React from 'react'
import { Link } from 'react-router-dom'
import { RiRobot2Line } from 'react-icons/ri'
import { IoStatsChart, IoNotifications } from 'react-icons/io5'
import { HiCheck } from 'react-icons/hi'
import { MdSecurity } from 'react-icons/md'

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
                Dota 2
                <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  AI-аналитика игр
                </span>
              </h1>
              <p className="text-2xl text-zinc-400 mb-12 leading-relaxed">
                Профессиональный разбор драфтов, тактик и стратегий команд с помощью искусственного интеллекта
              </p>
              <div className="text-sm text-zinc-500 mb-6">
                * Сервис предоставляет исключительно аналитическую информацию для улучшения игровых навыков
              </div>
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" 
                 className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
                Стать участником беты
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
                      <div className="text-zinc-400">DPC 2024 - Восточная Европа</div>
                    </div>
                  </div>
                  <div className="text-blue-400 font-medium">LIVE</div>
                </div>
                <div className="space-y-6">
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="text-zinc-400 mb-2">Анализ драфта</div>
                    <div className="text-xl font-medium mb-1">Разбор пиков и банов</div>
                    <div className="text-blue-400">Преимущество Spirit</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="text-zinc-400 mb-2">Тактический разбор</div>
                    <div className="text-lg">Анализ лейнинга и ротаций команд</div>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <div>Обновление в реальном времени</div>
                    <div>30 сек назад</div>
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
              Глубокий анализ
              <span className="block text-zinc-500">каждого матча</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Улучшайте свое понимание игры с помощью продвинутой аналитики
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <RiRobot2Line className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Драфт-анализ</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Детальный разбор выбора героев, контрпиков и общей стратегии драфта команд
                </p>
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Анализ</span>
                    <span>В реальном времени</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <IoStatsChart className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Статистика героев</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Подробная статистика по героям, их сочетаемости и эффективности на разных этапах игры
                </p>
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>База данных</span>
                    <span>Все патчи</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <IoNotifications className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Турнирный трекер</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Отслеживание важных матчей DPC, мейджоров и других турниров с мгновенными уведомлениями
                </p>
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Охват</span>
                    <span>Все регионы</span>
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
          <h2 className="text-5xl font-bold mb-8">Готовы стать лучше?</h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Присоединяйтесь к бета-тестированию и получите доступ к профессиональной аналитике Dota 2
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
            Выберите подходящий тариф для развития своих навыков
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
                    <span>5 разборов драфтов</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Базовая статистика героев</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Уведомления о матчах</span>
                  </li>
                </ul>
                
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" 
                   className="block text-center py-4 px-6 rounded-full bg-zinc-800 text-lg font-medium transition-transform hover:scale-[1.02] mb-4">
                  Попробовать бесплатно
                </a>
                <div className="flex items-center justify-center text-zinc-400 text-sm">
                  <MdSecurity className="text-blue-400 mr-2" />
                  <span>Безопасная оплата</span>
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
                    <span>50 разборов драфтов</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Расширенная статистика</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Анализ тактик команд</span>
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
                  <MdSecurity className="text-blue-400 mr-2" />
                  <span>Безопасная оплата</span>
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
                    <span>Безлимитные разборы</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Премиум аналитика</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>Персональные рекомендации</span>
                  </li>
                  <li className="flex items-center text-lg">
                    <HiCheck className="text-blue-400 text-2xl mr-4" />
                    <span>24/7 поддержка</span>
                  </li>
                </ul>
                
                <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer"
                   className="block text-center py-4 px-6 rounded-full bg-zinc-800 text-lg font-medium transition-transform hover:scale-[1.02] mb-4">
                  Получить доступ
                </a>
                <div className="flex items-center justify-center text-zinc-400 text-sm">
                  <MdSecurity className="text-blue-400 mr-2" />
                  <span>Безопасная оплата</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Details */}
      <section className="py-32 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-8">
                Полная аналитика
                <span className="block text-blue-400">каждой игры</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Наш ИИ анализирует все ключевые аспекты матча для максимально точного понимания игры
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Анализ драфта</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Синергия героев</span>
                      <p className="text-zinc-400 mt-1">Оценка совместимости способностей и ролей выбранных героев</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Тайминги силы</span>
                      <p className="text-zinc-400 mt-1">Определение ключевых моментов усиления команды на основе выбранных героев</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Контрпики</span>
                      <p className="text-zinc-400 mt-1">Анализ сильных и слабых сторон драфта против команды противника</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Игровая аналитика</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Распределение ресурсов</span>
                      <p className="text-zinc-400 mt-1">Анализ эффективности фарма и распределения золота между керри</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Командные действия</span>
                      <p className="text-zinc-400 mt-1">Оценка командных перемещений, тактических решений и тимфайтов</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Объективный контроль</span>
                      <p className="text-zinc-400 mt-1">Анализ контроля карты, тайминги Рошана и захвата целей</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Статистический анализ</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">История встреч</span>
                      <p className="text-zinc-400 mt-1">Статистика предыдущих матчей между командами и их составами</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Мета-анализ</span>
                      <p className="text-zinc-400 mt-1">Тренды текущего патча и эффективность стратегий</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Индивидуальная статистика</span>
                      <p className="text-zinc-400 mt-1">Показатели эффективности игроков на конкретных героях</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Рекомендации</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Оптимизация драфта</span>
                      <p className="text-zinc-400 mt-1">Рекомендации по выбору героев и банам на основе статистики</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Тактические советы</span>
                      <p className="text-zinc-400 mt-1">Предложения по развитию игры и использованию преимуществ</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mt-1 mr-4">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-medium">Развитие навыков</span>
                      <p className="text-zinc-400 mt-1">Персональные рекомендации по улучшению игровых показателей</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="py-8 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center text-zinc-500 text-sm">
            <p className="mb-2">© 2024 AI Analytics. Все права защищены.</p>
            <p className="mb-4">Сервис предоставляет исключительно аналитическую информацию для улучшения игровых навыков в Dota 2.</p>
            <p>Не является платформой для ставок. Для получения полных правил использования сервиса обратитесь к пользовательскому соглашению.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing 