import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import SubscriptionPlans from '../../components/SubscriptionPlans';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Settings = () => {
  const { currentUser } = useAuth();
  const { subscription } = useSubscription();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Настройки</h2>
        
        {/* Информация о пользователе */}
        <div className="bg-[#1C1C1E]/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800/50">
          <div className="flex items-center space-x-4 mb-6">
            <img 
              src={currentUser?.photoURL || '/default-avatar.png'} 
              alt={currentUser?.displayName || 'Пользователь'} 
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-medium text-white">
                {currentUser?.displayName || 'Пользователь'}
              </h3>
              <p className="text-zinc-400">
                {currentUser?.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
              <div>
                <div className="text-white font-medium">Текущий тариф</div>
                <div className="text-zinc-400 text-sm">
                  {subscription?.level === 'free' ? 'Бесплатный' : 
                   subscription?.level === 'pro' ? 'Продвинутый' :
                   subscription?.level === 'premium' ? 'Премиум' : 
                   subscription?.level === 'enterprise' ? 'Безлимитный' : 'Загрузка...'}
                </div>
              </div>
              <div className="text-blue-400">
                {subscription?.endDate ? format(subscription.endDate.toDate(), 'd MMMM yyyy', { locale: ru }) : 'Бессрочно'}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
              <div>
                <div className="text-white font-medium">Прогнозов сегодня</div>
                <div className="text-zinc-400 text-sm">
                  {subscription?.predictionsUsedToday || 0} из {
                    subscription?.level === 'free' ? '3' :
                    subscription?.level === 'pro' ? '50' :
                    subscription?.level === 'premium' ? '200' : '∞'
                  }
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <div className="text-white font-medium">Telegram уведомления</div>
                <div className="text-zinc-400 text-sm">
                  {subscription?.level === 'free' ? 'Недоступно' : 'Доступно'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Тарифы */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Тарифные планы</h3>
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default Settings; 