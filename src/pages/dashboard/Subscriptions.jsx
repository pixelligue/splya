import React from 'react';
import SubscriptionPlans from '../../components/SubscriptionPlans';

const Subscriptions = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-white tracking-tight mb-2">
          Тарифные планы
        </h1>
        <p className="text-zinc-400">
          Выберите подходящий тариф для доступа к расширенным возможностям
        </p>
      </div>

      <SubscriptionPlans />
    </div>
  );
};

export default Subscriptions; 