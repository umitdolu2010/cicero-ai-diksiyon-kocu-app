import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export function useAndroidBackHandler(onBack?: () => boolean) {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onBack) {
        return onBack();
      }

      if (router.canGoBack()) {
        router.back();
        return true;
      }

      return false;
    });

    return () => backHandler.remove();
  }, [onBack, router]);
}

export function useAndroidBackExit() {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    let backPressCount = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (backPressCount === 0) {
        backPressCount++;
        timeout = setTimeout(() => {
          backPressCount = 0;
        }, 2000);
        return true;
      } else {
        if (timeout) {
          clearTimeout(timeout);
        }
        BackHandler.exitApp();
        return false;
      }
    });

    return () => {
      backHandler.remove();
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);
}
