export const SUBSCRIPTION_LEVELS = {
  free: {
    id: 'free',
    name: 'Базовый',
    description: 'Базовый доступ к прогнозам',
    price: 0,
    features: {
      predictionsPerDay: 3,
      liveData: false,
      aiAnalytics: true,
      apiAccess: false,
      customization: false,
      prioritySupport: false,
      dataDelay: 900, // 15 минут в секундах
      historicalData: false,
      maxPredictionsHistory: 10,
      telegramNotifications: false
    },
    featuresList: [
      'До 3 прогнозов в день',
      'Базовая аналитика',
      'Задержка данных 15 минут',
      'История последних 10 прогнозов',
      'Доступ к общим обсуждениям'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Премиум',
    description: 'Полный доступ ко всем возможностям',
    price: 2990,
    features: {
      predictionsPerDay: -1, // безлимитно
      liveData: true,
      aiAnalytics: true,
      apiAccess: true,
      customization: true,
      prioritySupport: true,
      dataDelay: 0,
      historicalData: true,
      maxPredictionsHistory: -1, // безлимитно
      telegramNotifications: true
    },
    featuresList: [
      'Безлимитные прогнозы',
      'Расширенная аналитика с ИИ',
      'Данные в реальном времени',
      'Безлимитная история прогнозов',
      'Уведомления в Telegram',
      'Доступ к PRO обсуждениям',
      'Расширенная статистика матчей',
      'Приоритетная поддержка',
      'Настройка параметров ИИ',
      'Доступ к API'
    ]
  }
}; 