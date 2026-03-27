import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Lightbulb, RefreshCw, Volume2 } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateDailyTip } from '@/utils/gptService';
import * as Speech from 'expo-speech';
import { useTranslation } from '@/constants/translations';
import { useVoiceCoach, getScreenCoachIntro } from '@/hooks/useVoiceCoach';

interface Tip {
  title: string;
  content: string;
  exercise: string;
}

export default function DailyTipsScreen() {
  const { theme, language } = useApp();
  const { user } = useAuth();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const t = useTranslation(language);
  const styles = createStyles(Colors);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const loadDailyTip = React.useCallback(async () => {
    setIsGenerating(true);
    
    try {
      const tip = await generateDailyTip(language);
      setCurrentTip(tip);
    } catch (error) {
      console.error('Error generating tip:', error);
      
      setCurrentTip({
        title: 'Nefes Kontrolü',
        content: 'Konuşurken nefes kontrolü çok önemlidir. Derin nefes alıp yavaşça vererek başlayın.',
        exercise: '5 saniye nefes alın, 3 saniye tutun, 7 saniye verin. 3 kez tekrarlayın.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [language]);

  const voiceCoach = useVoiceCoach({ language, delay: 800 });

  useEffect(() => {
    loadDailyTip();
    const intro = getScreenCoachIntro('dailyTips', user?.name || '', language);
    if (intro) voiceCoach.speakOnce(intro);
    
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, [loadDailyTip]);

  const speakTip = () => {
    if (!currentTip) return;
    
    setIsSpeaking(true);
    const userName = user?.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
    const greeting = language === 'tr' ? `${userName}, ` : language === 'en' ? `${userName}, ` : `${userName}, `;
    const fullText = `${greeting}${currentTip.title}. ${currentTip.content}. ${currentTip.exercise}`;
    const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    
    Speech.speak(fullText, {
      language: speechLang,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t.sections.tips,
            headerStyle: { backgroundColor: '#6366F1' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t.sections.tips,
          headerStyle: { backgroundColor: '#6366F1' },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentTip && (
          <>
            <View style={styles.headerCard}>
              <View style={styles.iconContainer}>
                <Lightbulb size={48} color="#6366F1" />
              </View>
              <Text style={styles.headerTitle}>{t.tips.daily}</Text>
              <Text style={styles.headerSubtitle}>
                {language === 'tr' ? 'Her gün yeni bir diksiyon ipucu ile kendinizi geliştirin' : language === 'en' ? 'Improve yourself with a new diction tip every day' : 'Verbessern Sie sich jeden Tag mit einem neuen Diktionstipp'}
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>{currentTip.title}</Text>
              <Text style={styles.tipContent}>{currentTip.content}</Text>

              <View style={styles.exerciseContainer}>
                <Text style={styles.exerciseLabel}>{language === 'tr' ? 'Mini Egzersiz' : language === 'en' ? 'Mini Exercise' : 'Mini-Übung'}</Text>
                <View style={styles.exerciseBox}>
                  <Text style={styles.exerciseText}>{currentTip.exercise}</Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={isSpeaking ? stopSpeaking : speakTip}
                >
                  <Volume2 size={24} color="#FFFFFF" />
                  <Text style={styles.speakButtonText}>
                    {isSpeaking ? t.common.stop : t.tongueTwisters.listen}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.refreshButton, isGenerating && styles.refreshButtonDisabled]} 
                  onPress={loadDailyTip}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator size="small" color="#6366F1" />
                  ) : (
                    <RefreshCw size={24} color="#6366F1" />
                  )}
                  <Text style={styles.refreshButtonText}>
                    {isGenerating ? t.common.loading : t.tips.newTip}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>{language === 'tr' ? 'Düzenli Pratik Yapmanın Faydaları' : language === 'en' ? 'Benefits of Regular Practice' : 'Vorteile regelmäßiger Übung'}</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{language === 'tr' ? 'Daha net ve anlaşılır konuşma' : language === 'en' ? 'Clearer and more understandable speech' : 'Klarere und verständlichere Sprache'}</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{language === 'tr' ? 'Artan özgüven' : language === 'en' ? 'Increased confidence' : 'Erhöhtes Selbstvertrauen'}</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{language === 'tr' ? 'Profesyonel iletişim becerileri' : language === 'en' ? 'Professional communication skills' : 'Professionelle Kommunikationsfähigkeiten'}</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{language === 'tr' ? 'Daha etkili sunum yapabilme' : language === 'en' ? 'More effective presentation skills' : 'Effektivere Präsentationsfähigkeiten'}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  tipContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 24,
  },
  exerciseContainer: {
    marginBottom: 24,
  },
  exerciseLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6366F1',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  exerciseBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  exerciseText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  speakButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  speakButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.borderLight,
    paddingVertical: 14,
    borderRadius: 12,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6366F1',
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
});
