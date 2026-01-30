import { Platform, InteractionManager } from 'react-native';

export const androidOptimizations = {
  runAfterInteractions: (callback: () => void) => {
    if (Platform.OS === 'android') {
      InteractionManager.runAfterInteractions(() => {
        callback();
      });
    } else {
      callback();
    }
  },

  requestAnimationFrame: (callback: () => void) => {
    if (Platform.OS === 'android') {
      requestAnimationFrame(() => {
        callback();
      });
    } else {
      callback();
    }
  },

  setImmediate: (callback: () => void) => {
    if (Platform.OS === 'android') {
      setImmediate(() => {
        callback();
      });
    } else {
      callback();
    }
  },
};

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isWeb = Platform.OS === 'web';

export const platformSelect = <T,>(options: {
  android?: T;
  ios?: T;
  web?: T;
  default: T;
}): T => {
  if (Platform.OS === 'android' && options.android !== undefined) {
    return options.android;
  }
  if (Platform.OS === 'ios' && options.ios !== undefined) {
    return options.ios;
  }
  if (Platform.OS === 'web' && options.web !== undefined) {
    return options.web;
  }
  return options.default;
};
