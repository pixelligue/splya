import React from 'react'
import { Link } from 'react-router-dom'
import { HiCheck, HiChartBar, HiCash, HiUserGroup, HiLightningBolt } from 'react-icons/hi'

const Partners = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8">
                Партнерская
                <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  программа ESAi
                </span>
              </h1>
              <p className="text-2xl text-zinc-400 mb-12 leading-relaxed">
                Зарабатывайте до 30% с каждой подписки, рекомендуя сервис аналитики Dota 2
              </p>
              <Link to="/auth?partner=true" className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
                Стать партнером
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="relative">
              <div className="bg-zinc-900 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="text-zinc-400 mb-2">Средний доход партнера</div>
                    <div className="text-3xl font-medium mb-1">45,000 ₽</div>
                    <div className="text-blue-400">в месяц</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-6">
                    <div className="text-zinc-400 mb-2">Конверсия</div>
                    <div className="text-3xl font-medium mb-1">12.5%</div>
                    <div className="text-blue-400">средняя конверсия переходов</div>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <div>500+ активных партнеров</div>
                    <div>Выплаты каждую неделю</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <span className="text-blue-400 text-lg font-medium mb-4 block">Преимущества</span>
            <h2 className="text-6xl font-bold mb-8 tracking-tight">
              Почему стоит стать
              <span className="block text-zinc-500">нашим партнером</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <HiCash className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Высокий доход</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  До 30% с каждой оплаченной подписки. Пожизненные отчисления с каждого приведенного клиента
                </p>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <HiChartBar className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Аналитика</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Детальная статистика по переходам, регистрациям и оплатам в личном кабинете
                </p>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <HiLightningBolt className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Быстрый старт</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Готовые промо-материалы, баннеры и тексты для быстрого начала работы
                </p>
              </div>
            </div>
            
            <div className="group h-full">
              <div className="bg-zinc-900 rounded-3xl p-10 h-full transition-transform hover:scale-[1.02] flex flex-col">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <HiUserGroup className="text-3xl text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Поддержка</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-6 flex-grow">
                  Персональный менеджер и закрытый чат для партнеров с советами по продвижению
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-blue-400 text-lg font-medium mb-4 block">Процесс</span>
              <h2 className="text-5xl font-bold mb-8">Как начать зарабатывать</h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Всего 4 простых шага для начала работы с партнерской программой
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-zinc-900 rounded-2xl p-8">
                <div className="flex items-start gap-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Регистрация</h3>
                    <p className="text-zinc-400 text-lg">
                      Создайте партнерский аккаунт и заполните информацию о вашем канале или площадке
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-8">
                <div className="flex items-start gap-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Получение материалов</h3>
                    <p className="text-zinc-400 text-lg">
                      Получите доступ к промо-материалам и вашей уникальной партнерской ссылке
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-8">
                <div className="flex items-start gap-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-400">3</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Продвижение</h3>
                    <p className="text-zinc-400 text-lg">
                      Рекомендуйте сервис вашей аудитории используя готовые материалы или создавая свой контент
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-8">
                <div className="flex items-start gap-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-blue-400">4</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">Получение дохода</h3>
                    <p className="text-zinc-400 text-lg">
                      Получайте до 30% с каждой оплаченной подписки. Выплаты каждую неделю любым удобным способом
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Rates */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-zinc-900 rounded-3xl p-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Комиссионные отчисления</h2>
              <p className="text-xl text-zinc-400">
                Чем больше активных подписчиков - тем выше ваш процент
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-black/50 rounded-2xl p-8">
                <div className="text-2xl font-semibold mb-2">Начальный</div>
                <div className="text-4xl font-bold text-blue-400 mb-4">20%</div>
                <div className="text-zinc-400 mb-6">До 10 активных подписчиков</div>
                <ul className="space-y-4">
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Базовые промо-материалы</span>
                  </li>
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Еженедельные выплаты</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/50 rounded-2xl p-8 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-sm px-4 py-1 rounded-full font-medium">
                  Популярный
                </div>
                <div className="text-2xl font-semibold mb-2">Продвинутый</div>
                <div className="text-4xl font-bold text-blue-400 mb-4">25%</div>
                <div className="text-zinc-400 mb-6">10-50 активных подписчиков</div>
                <ul className="space-y-4">
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Расширенные промо-материалы</span>
                  </li>
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Персональный менеджер</span>
                  </li>
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Доступ к закрытому чату</span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/50 rounded-2xl p-8">
                <div className="text-2xl font-semibold mb-2">VIP</div>
                <div className="text-4xl font-bold text-blue-400 mb-4">30%</div>
                <div className="text-zinc-400 mb-6">Более 50 активных подписчиков</div>
                <ul className="space-y-4">
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Все промо-материалы</span>
                  </li>
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Приоритетная поддержка</span>
                  </li>
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Индивидуальные условия</span>
                  </li>
                  <li className="flex items-center text-zinc-400">
                    <HiCheck className="text-blue-400 text-xl mr-4" />
                    <span>Особые промо-акции</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Начните зарабатывать с ESAi</h2>
            <p className="text-xl text-zinc-400 mb-12">
              Присоединяйтесь к сотням партнеров, которые уже зарабатывают с нами
            </p>
            <Link to="/auth?partner=true" className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-lg font-medium transition-transform hover:scale-105">
              Стать партнером
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center text-zinc-500">
            © 2024 ESAi. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Partners 