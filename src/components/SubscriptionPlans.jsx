import React from 'react';
import { SUBSCRIPTION_LEVELS } from '../config/subscriptions';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';

const SubscriptionPlans = () => {
  const { subscription, upgradePlan } = useSubscription();

  const handleUpgrade = async (planId) => {
    try {
      const success = await upgradePlan(planId);
      if (success) {
        toast.success('Подписка успешно обновлена');
      } else {
        toast.error('Не удалось обновить подписку');
      }
    } catch (error) {
      toast.error('Произошла ошибка при обновлении подписки');
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 max-w-[1440px] mx-auto px-4">
      {Object.values(SUBSCRIPTION_LEVELS).map((plan) => (
        <div 
          key={plan.id}
          className={`relative flex flex-col bg-[#1C1C1E]/80 backdrop-blur-sm rounded-2xl p-4 border transition-all ${
            subscription?.level === plan.id
              ? 'border-blue-500 shadow-lg shadow-blue-500/20'
              : plan.id === 'premium' || plan.id === 'enterprise'
              ? 'border-blue-500/50 hover:border-blue-500 shadow-lg shadow-blue-500/10'
              : 'border-zinc-800/50 hover:border-zinc-700/50'
          }`}
        >
          {/* Заголовок */}
          <div className="mb-3">
            <h3 className={`text-lg font-medium mb-1 ${
              plan.id === 'free' ? 'text-white' : 'text-blue-400'
            }`}>
              {plan.name}
            </h3>
            <p className="text-sm text-zinc-400 h-12">
              {plan.description}
            </p>
          </div>

          {/* Цена */}
          <div className="mb-4">
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold ${
                plan.id === 'free' ? 'text-white' : 'text-blue-400'
              }`}>
                {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽`}
              </span>
              {plan.price > 0 && (
                <span className="text-zinc-400 ml-2 text-sm">/месяц</span>
              )}
            </div>
          </div>

          {/* Список возможностей */}
          <div className="flex-grow">
            <ul className="space-y-2 mb-4 text-sm">
              {plan.featuresList.map((feature, index) => (
                <li key={index} className="flex items-start text-zinc-300">
                  <svg 
                    className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${
                      plan.id === 'free' ? 'text-zinc-500' : 'text-blue-500'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  <span className="text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Кнопка подключения */}
          <button 
            onClick={() => handleUpgrade(plan.id)}
            disabled={subscription?.level === plan.id}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-medium transition-all ${
              subscription?.level === plan.id
                ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed'
                : plan.id === 'free'
                ? 'bg-zinc-700 hover:bg-zinc-600'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {subscription?.level === plan.id ? 'Текущий тариф' : 'Подключить'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans; 