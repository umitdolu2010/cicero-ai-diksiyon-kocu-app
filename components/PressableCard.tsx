import React, { ReactNode, useState } from 'react';
import { Pressable, PressableProps, ViewStyle, Platform } from 'react-native';
import { haptics } from '@/utils/haptics';
import { useApp } from '@/contexts/AppContext';
import { lightTheme, darkTheme } from '@/constants/colors';

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  style?: ViewStyle;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
  elevation?: number;
}

export function PressableCard({
  children,
  style,
  hapticFeedback = 'selection',
  elevation = 2,
  onPress,
  ...props
}: PressableCardProps) {
  const { theme } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = (event: any) => {
    haptics[hapticFeedback]();
    onPress?.(event);
  };

  const getCardStyle = (pressed: boolean): ViewStyle => ({
    backgroundColor: pressed ? Colors.surfaceHover : Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isHovered ? Colors.borderHover : Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: elevation * 2,
    elevation: elevation,
    transform: [{ scale: pressed ? 0.98 : 1 }],
  });

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => [getCardStyle(pressed), style]}
    >
      {children}
    </Pressable>
  );
}
