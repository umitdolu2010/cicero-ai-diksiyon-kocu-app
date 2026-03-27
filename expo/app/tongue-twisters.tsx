import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, RefreshCw, ExternalLink } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { useTranslation } from '@/constants/translations';

type TongueTwisterLevel = 'easy' | 'medium' | 'hard';

interface TongueTwister {
  text: string;
  syllables: string[];
  level: TongueTwisterLevel;
  category: string;
}

export default function TongueTwistersScreen() {
  const insets = useSafeAreaInsets();
  const { theme, language, profile } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const t = useTranslation(language);
  const styles = createStyles(Colors);
  const [selectedLevel, setSelectedLevel] = useState<TongueTwisterLevel>('easy');
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentTwister, setCurrentTwister] = useState<TongueTwister | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getLevelColor = useCallback((level: TongueTwisterLevel) => {
    switch (level) {
      case 'easy':
        return Colors.level.easy;
      case 'medium':
        return Colors.level.medium;
      case 'hard':
        return Colors.level.hard;
    }
  }, [Colors.level.easy, Colors.level.medium, Colors.level.hard]);

  const getLevelLabel = useCallback((level: TongueTwisterLevel) => {
    switch (level) {
      case 'easy':
        return t.pronunciation.easy;
      case 'medium':
        return t.pronunciation.medium;
      case 'hard':
        return t.pronunciation.hard;
    }
  }, [t.pronunciation.easy, t.pronunciation.medium, t.pronunciation.hard]);

  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) {
      if (Platform.OS === 'web') {
        window.speechSynthesis.cancel();
      } else {
        await Speech.stop();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    const languageMap = {
      tr: 'tr-TR',
      en: 'en-US',
      de: 'de-DE',
    };

    if (Platform.OS === 'web') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMap[language];
      utterance.rate = 0.7;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      try {
        await Speech.speak(text, {
          language: languageMap[language],
          rate: 0.7,
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        console.error('Speech error:', error);
        setIsSpeaking(false);
      }
    }
  }, [isSpeaking, language]);

  const generateSingleTwister = useCallback(async (level: TongueTwisterLevel) => {
    setIsGenerating(true);
    
    try {
      const levelMap = {
        easy: 'kolay (kısa ve basit tekerleme)',
        medium: 'orta (orta uzunlukta tekerleme)',
        hard: 'zor (uzun ve karmaşık tekerleme)',
      };

      const schema = z.object({
        text: z.string(),
        syllables: z.array(z.string()),
        level: z.enum(['easy', 'medium', 'hard']),
        category: z.string(),
      });

      const languageMap = {
        tr: 'Türkçe',
        en: 'English',
        de: 'Deutsch',
      };

      const prompt = `${languageMap[language]} diksiyon çalışması için ${levelMap[level]} seviyesinde 1 adet tekerleme oluştur.

Tekerleme için:
- text: Tekerleme metni
- syllables: Hecelere ayrılmış hali (array)
- level: "${level}"
- category: Kategori (örn: "Sesli Harfler", "K Sesi", "Ş Sesi", "R Sesi")

Örnek:
{
  "text": "Şu köşe yaz köşesi",
  "syllables": ["Şu", "kö-şe", "yaz", "kö-şe-si"],
  "level": "${level}",
  "category": "Sesli Harfler"
}`;

      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema,
      });
      
      console.log('Generated twister:', result);
      setCurrentTwister(result);
    } catch (error) {
      console.error('Error generating twister:', error);
      alert('Tekerleme oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  }, [language]);

  const handleRefresh = useCallback(() => {
    setCurrentSyllableIndex(0);
    generateSingleTwister(selectedLevel);
  }, [generateSingleTwister, selectedLevel]);
  useEffect(() => {
    generateSingleTwister('easy');
    
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentTwister && !isGenerating) {
      const userName = profile.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
      
      const introText = language === 'tr'
        ? `Merhaba ${userName}! Hece hece tekerleme çalışmasına hoş geldiniz.`
        : language === 'en'
        ? `Hello ${userName}! Welcome to syllable by syllable tongue twister practice.`
        : `Hallo ${userName}! Willkommen zum Silbe-für-Silbe-Zungenbrecher-Training.`;
      
      const levelText = language === 'tr'
        ? `Seviye: ${getLevelLabel(currentTwister.level)}. Kategori: ${currentTwister.category}.`
        : language === 'en'
        ? `Level: ${getLevelLabel(currentTwister.level)}. Category: ${currentTwister.category}.`
        : `Niveau: ${getLevelLabel(currentTwister.level)}. Kategorie: ${currentTwister.category}.`;
      
      const syllablesText = language === 'tr'
        ? `Heceler: ${currentTwister.syllables.join(', ')}.`
        : language === 'en'
        ? `Syllables: ${currentTwister.syllables.join(', ')}.`
        : `Silben: ${currentTwister.syllables.join(', ')}.`;
      
      const howToText = language === 'tr'
        ? 'Nasıl çalışılır: Heceleri dikkatlice inceleyin. Her heceyi vurgulayarak yüksek sesle tekrar edin. Sesli dinle butonuyla tam metni dinleyin. Kolay seviyeden başlayın, zorlaştıkça ilerleyin. Eğer diliniz dönmüyorsa mutlaka diksiyon kalemi ile artiküle ediniz ve tekrar deneyiniz, farkı göreceksiniz.'
        : language === 'en'
        ? 'How to practice: Examine the syllables carefully. Repeat each syllable aloud with emphasis. Listen to the full text with the audio button. Start from easy level, progress as it gets harder. If your tongue is not working, be sure to articulate with the diction pen and try again, you will see the difference.'
        : 'Wie übt man: Untersuchen Sie die Silben sorgfältig. Wiederholen Sie jede Silbe laut mit Betonung. Hören Sie sich den vollständigen Text mit der Audio-Taste an. Beginnen Sie mit dem einfachen Level und machen Sie Fortschritte, wenn es schwieriger wird. Wenn Ihre Zunge nicht funktioniert, artikulieren Sie unbedingt mit dem Diktionsstift und versuchen Sie es erneut, Sie werden den Unterschied sehen.';
      
      const fullText = `${introText} ${levelText} ${syllablesText} ${howToText}`;
      
      const timer = setTimeout(() => {
        speakText(fullText);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        if (Platform.OS === 'web') {
          window.speechSynthesis.cancel();
        } else {
          Speech.stop();
        }
        setIsSpeaking(false);
      };
    }
  }, [currentTwister, isGenerating, language, profile.name, getLevelLabel, speakText]);
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t.sections.tongueTwisters,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700' as const,
          },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>{language === 'tr' ? 'Hece Hece Öğren' : language === 'en' ? 'Learn Syllable by Syllable' : 'Silbe für Silbe lernen'}</Text>
          <Text style={styles.headerSubtitle}>
            {language === 'tr' ? 'Her heceyi diksiyon kalemi ile abartılı şekilde çalışın' : language === 'en' ? 'Practice each syllable exaggeratedly with the diction pen' : 'Üben Sie jede Silbe übertrieben mit dem Diktionsstift'}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : !currentTwister ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{language === 'tr' ? 'Tekerleme bulunamadı' : language === 'en' ? 'Tongue twister not found' : 'Zungenbrecher nicht gefunden'}</Text>
            </View>
          ) : (
          <>
          <View style={styles.levelSelector}>
            {(['easy', 'medium', 'hard'] as TongueTwisterLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  selectedLevel === level && {
                    backgroundColor: getLevelColor(level),
                  },
                ]}
                onPress={() => {
                  setSelectedLevel(level);
                  setCurrentSyllableIndex(0);
                  generateSingleTwister(level);
                }}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    selectedLevel === level && styles.levelButtonTextActive,
                  ]}
                >
                  {getLevelLabel(level)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.twisterCard}>
            <View style={styles.twisterHeader}>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: getLevelColor(currentTwister.level) },
                ]}
              >
                <Text style={styles.levelBadgeText}>
                  {getLevelLabel(currentTwister.level)}
                </Text>
              </View>
              <Text style={styles.categoryText}>{currentTwister.category}</Text>
            </View>

            <View style={styles.syllablesContainer}>
              {currentTwister.syllables.map((syllable, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.syllableBox,
                    index === currentSyllableIndex && styles.syllableBoxActive,
                    index === currentSyllableIndex && {
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.syllableText,
                      index === currentSyllableIndex && styles.syllableTextActive,
                    ]}
                  >
                    {syllable}
                  </Text>
                </Animated.View>
              ))}
            </View>

            <View style={styles.fullTextContainer}>
              <Text style={styles.fullTextLabel}>{language === 'tr' ? 'Tam Metin:' : language === 'en' ? 'Full Text:' : 'Volltext:'}:</Text>
              <Text style={styles.fullText}>{currentTwister.text}</Text>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakText(currentTwister.text)}
                disabled={isSpeaking}
              >
                <Volume2 size={24} color="#FFFFFF" />
                <Text style={styles.speakButtonText}>
                  {isSpeaking ? (language === 'tr' ? 'Dinleniyor...' : language === 'en' ? 'Listening...' : 'Hören...') : t.tongueTwisters.listen}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                disabled={isGenerating}
              >
                <RefreshCw size={24} color={Colors.primary} />
                <Text style={styles.refreshButtonText}>{language === 'tr' ? 'Yeni Tekerleme' : language === 'en' ? 'New Tongue Twister' : 'Neuer Zungenbrecher'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          </>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 {language === 'tr' ? 'Nasıl Çalışılır?' : language === 'en' ? 'How to Practice?' : 'Wie übt man?'}</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                • {language === 'tr' ? 'Heceleri dikkatlice incele' : language === 'en' ? 'Examine the syllables carefully' : 'Untersuchen Sie die Silben sorgfältig'}
              </Text>
              <Text style={styles.infoItem}>
                • {language === 'tr' ? 'Her heceyi vurgulayarak yüksek sesle tekrar et' : language === 'en' ? 'Repeat each syllable aloud with emphasis' : 'Wiederholen Sie jede Silbe laut mit Betonung'}
              </Text>
              <Text style={styles.infoItem}>
                • {language === 'tr' ? 'Sesli dinle butonuyla tam metni dinle' : language === 'en' ? 'Listen to the full text with the audio button' : 'Hören Sie sich den vollständigen Text mit der Audio-Taste an'}
              </Text>
              <Text style={styles.infoItem}>
                • {language === 'tr' ? 'Kolay seviyeden başla, zorlaştıkça ilerle' : language === 'en' ? 'Start from easy level, progress as it gets harder' : 'Beginnen Sie mit dem einfachen Level und machen Sie Fortschritte, wenn es schwieriger wird'}
              </Text>
              <Text style={styles.infoItem}>
                • {language === 'tr' ? 'Eğer diliniz dönmüyorsa mutlaka diksiyon kalemi ile artiküle ediniz ve tekrar deneyiniz, farkı göreceksiniz.' : language === 'en' ? 'If your tongue is not working, be sure to articulate with the diction pen and try again, you will see the difference.' : 'Wenn Ihre Zunge nicht funktioniert, artikulieren Sie unbedingt mit dem Diktionsstift und versuchen Sie es erneut, Sie werden den Unterschied sehen.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.dictionPenCard}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.open('https://www.diksiyonkalemi.com/cart-page?appSectionParams=%7B%22origin%22%3A%22wixcode%22%7D', '_blank');
              } else {
                const url = 'https://www.diksiyonkalemi.com/cart-page?appSectionParams=%7B%22origin%22%3A%22wixcode%22%7D';
                import('expo-linking').then(({ openURL }) => openURL(url));
              }
            }}
          >
            <Text style={styles.dictionPenTitle}>{language === 'tr' ? 'Diksiyon kaleminiz için tıklayın' : language === 'en' ? 'Click for your diction pen' : 'Klicken Sie für Ihren Diktionsstift'}</Text>
            <ExternalLink size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  content: {
    padding: 20,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',

  },
  levelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  levelButtonTextActive: {
    color: '#FFFFFF',
  },
  twisterCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,

  },
  twisterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  syllablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  syllableBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  syllableBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  syllableText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  syllableTextActive: {
    color: '#FFFFFF',
  },
  fullTextContainer: {
    backgroundColor: colors.surfaceSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  fullTextLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  fullText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  controls: {
    marginBottom: 24,
    gap: 12,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  speakButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },

  infoCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,

  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  dictionPenCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dictionPenTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
