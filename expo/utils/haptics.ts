import { Platform, Vibration } from 'react-native';

export const haptics = {
  light: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(10);
    }
  },
  
  medium: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(20);
    }
  },
  
  heavy: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(40);
    }
  },
  
  success: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 10, 50, 10]);
    }
  },
  
  error: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 20, 100, 20, 100, 20]);
    }
  },
  
  selection: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(5);
    }
  },
  
  notification: () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 10, 100, 10]);
    }
  },
};
