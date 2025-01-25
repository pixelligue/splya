import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { SUBSCRIPTION_LEVELS } from '../config/subscriptions';

export const useSubscription = () => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных подписки
  useEffect(() => {
    const loadSubscription = async () => {
      if (!currentUser) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();

        // Если нет данных о подписке, создаем базовую
        if (!userData?.subscription) {
          const defaultSubscription = {
            level: 'free',
            startDate: new Date(),
            endDate: null,
            predictionsUsedToday: 0,
            lastPredictionDate: new Date()
          };

          await updateDoc(doc(db, 'users', currentUser.uid), {
            subscription: defaultSubscription
          });

          setSubscription(defaultSubscription);
        } else {
          setSubscription(userData.subscription);
        }
      } catch (error) {
        console.error('Ошибка при загрузке подписки:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [currentUser]);

  // Проверка доступности функции
  const checkFeatureAccess = (feature) => {
    if (!subscription) return false;
    const level = SUBSCRIPTION_LEVELS[subscription.level];
    return level?.features[feature] || false;
  };

  // Проверка и обновление лимита прогнозов
  const checkAndUpdatePredictionLimit = async () => {
    if (!subscription) return false;

    const level = SUBSCRIPTION_LEVELS[subscription.level];
    
    // Для безлимитного тарифа
    if (level.features.predictionsPerDay === -1) return true;

    // Сброс счетчика если новый день
    const today = new Date().toDateString();
    const lastPrediction = new Date(subscription.lastPredictionDate.toDate()).toDateString();
    
    if (today !== lastPrediction) {
      const updatedSubscription = {
        ...subscription,
        predictionsUsedToday: 1,
        lastPredictionDate: new Date()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscription: updatedSubscription
      });

      setSubscription(updatedSubscription);
      return true;
    }

    // Проверка лимита
    if (subscription.predictionsUsedToday >= level.features.predictionsPerDay) {
      return false;
    }

    // Увеличение счетчика
    const updatedSubscription = {
      ...subscription,
      predictionsUsedToday: subscription.predictionsUsedToday + 1,
      lastPredictionDate: new Date()
    };

    await updateDoc(doc(db, 'users', currentUser.uid), {
      subscription: updatedSubscription
    });

    setSubscription(updatedSubscription);
    return true;
  };

  // Мок для обновления подписки (позже заменим на реальную оплату)
  const upgradePlan = async (planId) => {
    if (!currentUser || !SUBSCRIPTION_LEVELS[planId]) return;

    try {
      // Здесь будет интеграция с платежной системой
      const updatedSubscription = {
        level: planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
        predictionsUsedToday: 0,
        lastPredictionDate: new Date()
      };

      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscription: updatedSubscription
      });

      setSubscription(updatedSubscription);
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении подписки:', error);
      return false;
    }
  };

  return {
    subscription,
    loading,
    checkFeatureAccess,
    checkAndUpdatePredictionLimit,
    upgradePlan
  };
}; 