import React, { useState } from 'react';
import { Pressable, PressableProps, Text, ViewStyle, TextStyle, ActivityIndicator, Platform } from 'react-native';
import { haptics } from '@/utils/haptics';
import { useApp } from '@/contexts/AppContext';
import { lightTheme, darkTheme } from '@/constants/colors';

interface PressableButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'selection';
}

export function PressableButton({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  hapticFeedback = 'light',
  onPress,
  ...props
}: PressableButtonProps) {
  const { theme } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = (event: any) => {
    if (!disabled && !loading) {
      haptics[hapticFeedback]();
      onPress?.(event);
    }
  };

  const getButtonStyle = (pressed: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
      medium: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 48 },
      large: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 56 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
        borderWidth: 1,
        borderColor: isHovered ? Colors.borderHover : 'transparent',
      },
      secondary: {
        backgroundColor: pressed ? Colors.surfaceHover : Colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: isHovered ? Colors.borderHover : Colors.border,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: isHovered ? Colors.borderHover : (pressed ? Colors.primaryDark : Colors.primary),
      },
      ghost: {
        backgroundColor: pressed ? Colors.surfaceHover : 'transparent',
        borderWidth: 1,
        borderColor: isHovered ? Colors.borderHover : 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled || loading ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 14, fontWeight: '600' as const },
      medium: { fontSize: 16, fontWeight: '600' as const },
      large: { fontSize: 18, fontWeight: '700' as const },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: Colors.textInverse },
      secondary: { color: Colors.text },
      outline: { color: Colors.primary },
      ghost: { color: Colors.primary },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      disabled={disabled || loading}
      onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
      style={({ pressed }) => [getButtonStyle(pressed), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.textInverse : Colors.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}
