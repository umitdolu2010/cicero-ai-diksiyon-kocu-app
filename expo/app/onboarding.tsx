import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Clock, TrendingUp, Globe, ArrowLeft } from 'lucide-react-native';
import { useApp, Language } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useTranslation } from '@/constants/translations';

type GoalLevel = 'beginner' | 'intermediate' | 'advanced';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateProfile, language } = useApp();
  const t = useTranslation(language);
  const [selectedGoal, setSelectedGoal] = useState<GoalLevel>('beginner');
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const goals: { level: GoalLevel; title: string; description: string }[] = [
    {
      level: 'beginner',
      title: t.onboarding.beginner,
      description: t.onboarding.beginnerDesc,
    },
    {
      level: 'intermediate',
      title: t.onboarding.intermediate,
      description: t.onboarding.intermediateDesc,
    },
    {
      level: 'advanced',
      title: t.onboarding.advanced,
      description: t.onboarding.advancedDesc,
    },
  ];

  const durations = [
    { minutes: 3, label: `3 ${t.common.minutes}`, description: t.common.start },
    { minutes: 7, label: `7 ${t.common.minutes}`, description: t.common.day },
    { minutes: 15, label: `15 ${t.common.minutes}`, description: t.common.week },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'tr', label: t.languages.turkish },
    { code: 'en', label: t.languages.english },
    { code: 'de', label: t.languages.german },
  ];

  const handleComplete = () => {
    updateProfile({
      goal: selectedGoal,
      dailyTargetMinutes: selectedDuration,
      language: selectedLanguage,
    });
    router.replace('/premium-welcome' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle]}
          style={styles.header}
        >
          <TouchableOpacity
            style={[styles.backButton, { marginTop: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.onboarding.selectGoal}</Text>
          <Text style={styles.headerSubtitle}>
            {t.onboarding.selectGoalDescription}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.onboarding.selectLanguage}</Text>
            </View>

            <View style={styles.optionsRow}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.durationCard,
                    selectedLanguage === lang.code && styles.durationCardSelected,
                  ]}
                  onPress={() => setSelectedLanguage(lang.code)}
                >
                  <Text
                    style={[
                      styles.durationLabel,
                      selectedLanguage === lang.code && styles.durationLabelSelected,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.onboarding.selectLevel}</Text>
            </View>

            <View style={styles.optionsGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.level}
                  style={[
                    styles.optionCard,
                    selectedGoal === goal.level && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedGoal(goal.level)}
                >
                  <Text
                    style={[
                      styles.optionTitle,
                      selectedGoal === goal.level && styles.optionTitleSelected,
                    ]}
                  >
                    {goal.title}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      selectedGoal === goal.level && styles.optionDescriptionSelected,
                    ]}
                  >
                    {goal.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t.profile.dailyTarget}</Text>
            </View>

            <View style={styles.optionsRow}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.minutes}
                  style={[
                    styles.durationCard,
                    selectedDuration === duration.minutes && styles.durationCardSelected,
                  ]}
                  onPress={() => setSelectedDuration(duration.minutes)}
                >
                  <Text
                    style={[
                      styles.durationLabel,
                      selectedDuration === duration.minutes && styles.durationLabelSelected,
                    ]}
                  >
                    {duration.label}
                  </Text>
                  <Text
                    style={[
                      styles.durationDescription,
                      selectedDuration === duration.minutes &&
                        styles.durationDescriptionSelected,
                    ]}
                  >
                    {duration.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoBox}>
            <TrendingUp size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              {language === 'tr' ? 'Düzenli çalışma ile 4 hafta içinde belirgin gelişme görebilirsiniz' : 
               language === 'en' ? 'With regular practice, you can see significant improvement in 4 weeks' :
               'Mit regelmäßiger Übung können Sie in 4 Wochen deutliche Verbesserungen sehen'}
            </Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
            <LinearGradient
              colors={[Colors.gradient.start, Colors.gradient.end]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>{t.welcome.getStarted}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textInverse,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceSecondary,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  optionDescriptionSelected: {
    color: Colors.primaryDark,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  durationCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceSecondary,
  },
  durationLabel: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  durationLabelSelected: {
    color: Colors.primary,
  },
  durationDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  durationDescriptionSelected: {
    color: Colors.primaryDark,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
});
