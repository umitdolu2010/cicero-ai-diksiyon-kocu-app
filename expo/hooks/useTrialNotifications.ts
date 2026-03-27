import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export function useTrialNotifications() {
  const { user, remainingTime } = useAuth();
  const lastNotificationRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.isPremium || !user?.trialStartedAt || remainingTime <= 0) {
      return;
    }

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);

    const checkAndNotify = () => {
      if (hours === 0 && minutes <= 60 && minutes > 50 && lastNotificationRef.current !== '1hour') {
        lastNotificationRef.current = '1hour';
        
        Alert.alert(
          '⏰ Deneme Süresi Uyarısı',
          'Deneme süreniz 1 saat içinde sona erecek.\n\nPremium üyeliğe geçerek tüm özelliklere sınırsız erişim sağlayabilirsiniz.',
          [
            { text: 'Daha Sonra', style: 'cancel' },
            { text: 'Premium Ol', onPress: () => {} },
          ]
        );
      }
      else if (hours === 2 && minutes <= 5 && lastNotificationRef.current !== '2hours') {
        lastNotificationRef.current = '2hours';
        
        Alert.alert(
          '⏰ Deneme Süresi Uyarısı',
          'Deneme süreniz 2 saat içinde sona erecek.\n\nArkadaşlarınızı davet ederek sürenizi uzatabilir veya premium üyeliğe geçebilirsiniz.',
          [
            { text: 'Tamam', style: 'cancel' },
            { text: 'Arkadaş Davet Et', onPress: () => {} },
          ]
        );
      }
      else if (hours === 6 && minutes <= 5 && lastNotificationRef.current !== '6hours') {
        lastNotificationRef.current = '6hours';
        
        Alert.alert(
          '⏰ Deneme Süresi',
          'Deneme süreniz 6 saat içinde sona erecek.\n\nArkadaşlarınızı davet ederek sürenizi uzatmayı unutmayın!',
          [{ text: 'Tamam' }]
        );
      }
      else if (hours === 12 && minutes <= 5 && lastNotificationRef.current !== '12hours') {
        lastNotificationRef.current = '12hours';
        
        Alert.alert(
          'ℹ️ Deneme Süresi',
          'Deneme sürenizin yarısı geçti. Cicero ile konuşma becerilerinizi geliştirmeye devam edin!',
          [{ text: 'Tamam' }]
        );
      }
    };

    checkAndNotify();

    const interval = setInterval(checkAndNotify, 60000);

    return () => clearInterval(interval);
  }, [remainingTime, user]);
}
