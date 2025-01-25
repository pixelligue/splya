import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const Onboarding = () => {
  const { currentUser } = useAuth();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!currentUser) return;

      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      if (!userData?.hasCompletedOnboarding) {
        setRun(true);
      }
    };

    checkOnboardingStatus();
  }, [currentUser]);

  const handleJoyrideCallback = async (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      
      // Отмечаем, что пользователь прошел онбординг
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          hasCompletedOnboarding: true
        });
      }
    }
  };

  const steps = [
    {
      target: '.dashboard-nav',
      content: 'Здесь находится главное меню. Через него вы можете перейти к основным разделам сервиса.',
      placement: 'right',
      disableBeacon: true
    },
    {
      target: '.predictions-section',
      content: 'В этом разделе вы можете создавать и просматривать прогнозы на матчи.',
      placement: 'bottom'
    },
    {
      target: '.matches-section',
      content: 'Здесь отображаются все предстоящие матчи с актуальной статистикой.',
      placement: 'bottom'
    },
    {
      target: '.analytics-section',
      content: 'В разделе аналитики вы найдете детальный анализ команд и игроков.',
      placement: 'left'
    },
    {
      target: '.subscription-info',
      content: 'Информация о вашем текущем тарифе и доступных функциях.',
      placement: 'bottom'
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3B82F6',
          textColor: '#fff',
          backgroundColor: '#1C1C1E',
          arrowColor: '#1C1C1E',
          overlayColor: 'rgba(0, 0, 0, 0.85)'
        },
        tooltip: {
          padding: '20px'
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          fontSize: '14px',
          padding: '8px 16px'
        },
        buttonBack: {
          color: '#3B82F6',
          fontSize: '14px',
          marginRight: '8px'
        },
        buttonSkip: {
          color: '#6B7280',
          fontSize: '14px'
        }
      }}
      locale={{
        back: 'Назад',
        close: 'Закрыть',
        last: 'Завершить',
        next: 'Далее',
        skip: 'Пропустить'
      }}
    />
  );
};

export default Onboarding; 