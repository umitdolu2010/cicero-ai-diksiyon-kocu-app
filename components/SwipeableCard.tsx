import React, { useRef, ReactNode } from 'react';
import { View, Animated, PanResponder, StyleSheet, ViewStyle } from 'react-native';
import { Trash2, Archive } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { lightTheme, darkTheme } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

interface SwipeableCardProps {
  children: ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
  style?: ViewStyle;
}

const SWIPE_THRESHOLD = 120;

export function SwipeableCard({ children, onDelete, onArchive, style }: SwipeableCardProps) {
  const { theme } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(lastOffset.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0 && onDelete) {
          translateX.setValue(gestureState.dx);
        } else if (gestureState.dx > 0 && onArchive) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        
        if (gestureState.dx < -SWIPE_THRESHOLD && onDelete) {
          haptics.medium();
          Animated.timing(translateX, {
            toValue: -200,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD && onArchive) {
          haptics.medium();
          Animated.timing(translateX, {
            toValue: 200,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onArchive();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
          lastOffset.current = 0;
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {onArchive && (
        <View style={[styles.actionContainer, styles.leftAction, { backgroundColor: Colors.info }]}>
          <Archive size={24} color={Colors.textInverse} />
        </View>
      )}
      
      {onDelete && (
        <View style={[styles.actionContainer, styles.rightAction, { backgroundColor: Colors.error }]}>
          <Trash2 size={24} color={Colors.textInverse} />
        </View>
      )}

      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateX }] },
          style,
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'transparent',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAction: {
    left: 0,
  },
  rightAction: {
    right: 0,
  },
});
