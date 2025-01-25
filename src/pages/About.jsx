import React from 'react'
import { Link } from 'react-router-dom'
import { HiUsers, HiLightBulb, HiChartBar, HiGlobe } from 'react-icons/hi'

const About = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8">
              О компании
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                ESAi
              </span>
            </h1>
            <p className="text-2xl text-zinc-400 mb-12 leading-relaxed">
              Мы создаем будущее киберспортивной аналитики, используя передовые технологии искусственного интеллекта
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-blue-400 text-lg font-medium mb-4 block">Наша миссия</span>
                <h2 className="text-4xl font-bold mb-6">Делаем киберспорт прозрачнее</h2>
                <p className="text-xl text-zinc-400 leading-relaxed mb-8">
                  Мы стремимся сделать киберспорт более прозрачным и понятным для всех, предоставляя точную аналитику на основе искусственного интеллекта.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <HiLightBulb className="text-2xl text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Инновации</h3>
                      <p className="text-zinc-400">
                        Постоянно совершенствуем наши алгоритмы и технологии для достижения максимальной точности
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <HiChartBar className="text-2xl text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Точность</h3>
                      <p className="text-zinc-400">
                        Используем большие данные и машинное обучение для создания точных прогнозов
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl"></div>
                <div className="aspect-square bg-black/50 rounded-2xl p-8 relative z-10">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">3+</div>
                      <div className="text-xl text-zinc-400">года разработки AI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-blue-400 text-lg font-medium mb-4 block">Команда</span>
              <h2 className="text-5xl font-bold mb-8">Эксперты своего дела</h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Наша команда состоит из опытных специалистов в области машинного обучения, аналитики и киберспорта
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiUsers className="text-4xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Data Scientists</h3>
                <p className="text-zinc-400">
                  Эксперты в области машинного обучения и анализа данных
                </p>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiChartBar className="text-4xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Аналитики</h3>
                <p className="text-zinc-400">
                  Профессиональные аналитики с опытом в киберспорте
                </p>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiGlobe className="text-4xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Разработчики</h3>
                <p className="text-zinc-400">
                  Опытные инженеры и разработчики программного обеспечения
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">15+</div>
                <div className="text-zinc-400">Специалистов в команде</div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">3+</div>
                <div className="text-zinc-400">Года разработки</div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">50K+</div>
                <div className="text-zinc-400">Матчей проанализировано</div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-8 text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">10K+</div>
                <div className="text-zinc-400">Активных пользователей</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Присоединяйтесь к нам</h2>
            <p className="text-xl text-zinc-400 mb-12">
              Станьте частью будущего киберспортивной аналитики вместе с ESAi
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link to="/auth" className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
                Попробовать бесплатно
              </Link>
              <Link to="/partners" className="inline-flex items-center justify-center bg-zinc-800 text-white px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
                Стать партнером
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About 