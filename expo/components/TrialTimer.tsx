import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';

export default function TrialTimer() {
  const { user, remainingTime } = useAuth();
  const { theme } = useApp();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const router = useRouter();
  const [displayTime, setDisplayTime] = useState(remainingTime);

  useEffect(() => {
    setDisplayTime(remainingTime);
    
    const interval = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);

  if (!user?.trialStartedAt) {
    return null;
  }

  const hours = Math.floor(displayTime / 3600);
  const minutes = Math.floor((displayTime % 3600) / 60);
  const seconds = displayTime % 60;

  const isLowTime = hours < 3;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: isLowTime ? colors.error : colors.border }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Clock size={20} color={isLowTime ? colors.error : colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>24 Saat Ücretsiz Dene</Text>
          <Text style={[styles.time, { color: isLowTime ? colors.error : colors.text }]}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>
      </View>
      {isLowTime && (
        <TouchableOpacity 
          style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/product-info' as any)}
        >
          <Text style={styles.upgradeText}>Premium&apos;a Geç</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  time: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  upgradeButton: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
