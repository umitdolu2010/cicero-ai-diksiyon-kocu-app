import React, { useEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { lightTheme, darkTheme } from '@/constants/colors';

interface AndroidStatusBarProps {
  theme?: 'light' | 'dark';
}

export function AndroidStatusBar({ theme = 'light' }: AndroidStatusBarProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const Colors = currentTheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    const updateStatusBar = () => {
      try {
        StatusBar.setBarStyle(currentTheme === 'dark' ? 'light-content' : 'dark-content');
        StatusBar.setBackgroundColor(Colors.background);
      } catch (error) {
        console.log('StatusBar error:', error);
      }
    };
    
    updateStatusBar();
  }, [currentTheme, Colors.background]);

  if (Platform.OS !== 'android') {
    return null;
  }

  return (
    <StatusBar
      barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor={Colors.background}
      translucent={false}
    />
  );
}
