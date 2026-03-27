import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import {
  Mic,
  Play,
  Square,
  Volume2,
  Home,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useTranslation } from '@/constants/translations';

type DifficultyLevel = 'easy' | 'medium' | 'hard';
type ExerciseType = 'single' | 'double' | 'triple';

interface Exercise {
  text: string;
  syllables: string[];
  targetPhoneme: string;
  difficulty: DifficultyLevel;
  category: string;
  type: ExerciseType;
}

export default function ArticulationScreen() {
  const router = useRouter();
  const { addRecording, theme, language } = useApp();
  const { user } = useAuth();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const t = useTranslation(language);

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('single');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingInstructions, setIsPlayingInstructions] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [aiVoiceFeedback, setAiVoiceFeedback] = useState<string | null>(null);
  const [isPlayingFeedback, setIsPlayingFeedback] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        if (Platform.OS !== 'web') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });
        }
        console.log('Audio mode initialized for playback');
      } catch (error) {
        console.error('Error initializing audio mode:', error);
      }
    };
    
    initAudio();
    generateExercise();
    
    return () => {
      Speech.stop();
      setIsPlayingInstructions(false);
      setIsPlayingExample(false);
      setIsPlayingFeedback(false);
    };
  }, []);

  useEffect(() => {
    if (currentExercise) {
      setIsPlayingInstructions(true);
      const instructionsText = language === 'tr' 
        ? 'Örneği dinleyin ve hecelere dikkat edin. Cicero Diksiyon Kalemi ile her heceyi yavaşça tekrarlayın. Kaydınızı yapın ve geri bildirimi inceleyin. Zorluk seviyesini değiştirerek yeni egzersizler alın.'
        : language === 'en'
        ? 'Listen to the example and pay attention to the syllables. Repeat each syllable slowly with Cicero Diction Pen. Make your recording and review the feedback. Get new exercises by changing the difficulty level.'
        : 'Hören Sie sich das Beispiel an und achten Sie auf die Silben. Wiederholen Sie jede Silbe langsam mit dem Cicero Diktionsstift. Machen Sie Ihre Aufnahme und überprüfen Sie das Feedback. Erhalten Sie neue Übungen, indem Sie den Schwierigkeitsgrad ändern.';
      const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
      Speech.speak(instructionsText, {
        language: speechLang,
        rate: 0.85,
        onDone: () => setIsPlayingInstructions(false),
        onStopped: () => setIsPlayingInstructions(false),
        onError: () => setIsPlayingInstructions(false),
      });
    }
  }, [currentExercise, language]);



  const exerciseTypes: { type: ExerciseType; label: string; description: string }[] = [
    { type: 'single', label: language === 'tr' ? 'Tek Hece' : language === 'en' ? 'Single Syllable' : 'Einzelne Silbe', description: language === 'tr' ? 'Tek sesler ve heceler' : language === 'en' ? 'Single sounds and syllables' : 'Einzelne Laute und Silben' },
    { type: 'double', label: language === 'tr' ? 'İkili Hece' : language === 'en' ? 'Double Syllable' : 'Doppelte Silbe', description: language === 'tr' ? 'me-li, ma-lı, mi-mi' : language === 'en' ? 'me-li, ma-lı, mi-mi' : 'me-li, ma-lı, mi-mi' },
    { type: 'triple', label: language === 'tr' ? 'Üçlü Hece' : language === 'en' ? 'Triple Syllable' : 'Dreifache Silbe', description: language === 'tr' ? 'me-me-li, mi-mi-li' : language === 'en' ? 'me-me-li, mi-mi-li' : 'me-me-li, mi-mi-li' },
  ];

  const generateExercise = async () => {
    Speech.stop();
    setIsPlayingInstructions(false);
    setIsPlayingExample(false);
    setIsPlayingFeedback(false);
    setIsGenerating(true);
    setAiVoiceFeedback(null);
    
    try {
      const typeMap = {
        single: language === 'tr' ? 'Tek hece veya tek ses çalışması. Örnek: "a", "ba", "ka", "ra" gibi tek heceler.' : language === 'en' ? 'Single syllable or single sound practice. Example: single syllables like "a", "ba", "ka", "ra".' : 'Einzelne Silbe oder einzelner Laut. Beispiel: einzelne Silben wie "a", "ba", "ka", "ra".',
        double: language === 'tr' ? 'İkili hece kombinasyonları. Örnek: "me-li", "ma-lı", "mi-mi", "mö-me" gibi iki heceli kombinasyonlar.' : language === 'en' ? 'Double syllable combinations. Example: two-syllable combinations like "me-li", "ma-lı", "mi-mi", "mö-me".' : 'Doppelte Silbenkombinationen. Beispiel: zweisilbige Kombinationen wie "me-li", "ma-lı", "mi-mi", "mö-me".',
        triple: language === 'tr' ? 'Üçlü hece kombinasyonları. Örnek: "me-me-li", "mi-mi-li", "mö-mö-lü" gibi üç heceli kombinasyonlar.' : language === 'en' ? 'Triple syllable combinations. Example: three-syllable combinations like "me-me-li", "mi-mi-li", "mö-mö-lü".' : 'Dreifache Silbenkombinationen. Beispiel: dreisilbige Kombinationen wie "me-me-li", "mi-mi-li", "mö-mö-lü".',
      };

      const languageMap = {
        tr: 'Türkçe',
        en: 'English',
        de: 'Deutsch',
      };

      const promptMap = {
        tr: `${languageMap[language]} diksiyon egzersizi için orta seviyede bir artikülasyon alıştırması oluştur.\n\nÇalışma tipi: ${typeMap[exerciseType]}\n\nBir hedef fonem seç (ö, ü, ş, ç, r, l gibi) ve bu fonemi içeren ${exerciseType === 'single' ? 'tek hece veya ses' : exerciseType === 'double' ? 'iki heceli kombinasyon' : 'üç heceli kombinasyon'} oluştur.\n\nYanıtını şu JSON formatında ver:\n{\n  "text": "Egzersiz metni",\n  "syllables": ["He-ce-le-re", "ay-rıl-mış"],\n  "targetPhoneme": "/ş/",\n  "difficulty": "medium",\n  "category": "Artikülasyon",\n  "type": "${exerciseType}"\n}`,
        en: `Create an articulation exercise for ${languageMap[language]} diction at medium level.\n\nExercise type: ${typeMap[exerciseType]}\n\nSelect a target phoneme (like ö, ü, ş, ç, r, l) and create ${exerciseType === 'single' ? 'a single syllable or sound' : exerciseType === 'double' ? 'a two-syllable combination' : 'a three-syllable combination'} containing this phoneme.\n\nProvide your answer in this JSON format:\n{\n  "text": "Exercise text",\n  "syllables": ["Syl-la-bles", "sep-a-rat-ed"],\n  "targetPhoneme": "/ş/",\n  "difficulty": "medium",\n  "category": "Articulation",\n  "type": "${exerciseType}"\n}`,
        de: `Erstellen Sie eine Artikulationsübung für ${languageMap[language]} Diktion auf mittlerem Niveau.\n\nÜbungstyp: ${typeMap[exerciseType]}\n\nWählen Sie ein Ziel-Phonem (wie ö, ü, ş, ç, r, l) und erstellen Sie ${exerciseType === 'single' ? 'eine einzelne Silbe oder einen Laut' : exerciseType === 'double' ? 'eine zweisilbige Kombination' : 'eine dreisilbige Kombination'}, die dieses Phonem enthält.\n\nGeben Sie Ihre Antwort in diesem JSON-Format:\n{\n  "text": "Übungstext",\n  "syllables": ["Sil-ben", "ge-trennt"],\n  "targetPhoneme": "/ş/",\n  "difficulty": "medium",\n  "category": "Artikulation",\n  "type": "${exerciseType}"\n}`,
      };

      const schema = z.object({
        text: z.string(),
        syllables: z.array(z.string()),
        targetPhoneme: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        category: z.string(),
        type: z.enum(['single', 'double', 'triple']),
      });

      const exercise = await generateObject({
        messages: [{ role: 'user', content: promptMap[language] }],
        schema,
      });
      
      console.log('Generated exercise:', exercise);
      setCurrentExercise(exercise);
      setRecordingUri(null);
    } catch (error) {
      console.error('Error generating exercise:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log('Requesting permissions...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        console.log('Permission to access microphone denied');
        return;
      }

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      console.log('Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Platform.OS === 'web'
          ? Audio.RecordingOptionsPresets.HIGH_QUALITY
          : {
              android: {
                extension: '.m4a',
                outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                audioEncoder: Audio.AndroidAudioEncoder.AAC,
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
              },
              ios: {
                extension: '.wav',
                outputFormat: Audio.IOSOutputFormat.LINEARPCM,
                audioQuality: Audio.IOSAudioQuality.HIGH,
                sampleRate: 44100,
                numberOfChannels: 1,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
              },
              web: {
                mimeType: 'audio/webm',
                bitsPerSecond: 128000,
              },
            }
      );

      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    console.log('Stopping recording...');
    setIsRecording(false);
    
    try {
      await recording.stopAndUnloadAsync();
      
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      
      if (uri && currentExercise) {
        setRecordingUri(uri);
        const duration = status.durationMillis || 0;
        setRecordingDuration(duration);

        const mockScore = Math.floor(Math.random() * 20) + 80;
        
        addRecording({
          exerciseId: Date.now().toString(),
          exerciseText: currentExercise.text,
          duration,
          score: mockScore,
          audioUri: uri,
          category: currentExercise.category,
          difficulty: currentExercise.difficulty,
        });

        console.log('Recording stopped and saved:', uri);
        
        await generateAIFeedback();
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const generateAIFeedback = async () => {
    if (!currentExercise) return;
    
    setIsGeneratingFeedback(true);
    try {
      const feedbackPromptMap = {
        tr: `Kullanıcı "${currentExercise.text}" egzersizini kaydetti. Hedef fonem: ${currentExercise.targetPhoneme}. Kısa, objektif ve motive edici bir geri bildirim ver (maksimum 2-3 cümle). Olumlu yönleri vurgula ve gerekirse bir ipucu ver.`,
        en: `User recorded the exercise "${currentExercise.text}". Target phoneme: ${currentExercise.targetPhoneme}. Provide short, objective and motivating feedback (maximum 2-3 sentences). Highlight positive aspects and give a tip if needed.`,
        de: `Der Benutzer hat die Übung "${currentExercise.text}" aufgenommen. Ziel-Phonem: ${currentExercise.targetPhoneme}. Geben Sie kurzes, objektives und motivierendes Feedback (maximal 2-3 Sätze). Heben Sie positive Aspekte hervor und geben Sie bei Bedarf einen Tipp.`,
      };

      const { generateText } = await import('@rork-ai/toolkit-sdk');
      const feedback = await generateText({
        messages: [{ role: 'user', content: feedbackPromptMap[language] }],
      });
      
      setAiVoiceFeedback(feedback);
      
      setIsPlayingFeedback(true);
      const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
      Speech.speak(feedback, {
        language: speechLang,
        rate: 0.85,
        onDone: () => setIsPlayingFeedback(false),
        onStopped: () => setIsPlayingFeedback(false),
        onError: () => setIsPlayingFeedback(false),
      });
    } catch (error) {
      console.error('Error generating AI feedback:', error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const playExample = async () => {
    if (!currentExercise) return;
    
    if (isPlayingExample) {
      Speech.stop();
      setIsPlayingExample(false);
      return;
    }
    
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error('Error setting audio mode for playback:', error);
    }
    
    console.log('Playing example with TTS:', currentExercise.text);
    setIsPlayingExample(true);
    const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    Speech.speak(currentExercise.text, {
      language: speechLang,
      rate: 0.7,
      pitch: 1.0,
      onDone: () => {
        console.log('Speech playback done');
        setIsPlayingExample(false);
      },
      onStopped: () => {
        console.log('Speech playback stopped');
        setIsPlayingExample(false);
      },
      onError: (error) => {
        console.error('Speech playback error:', error);
        setIsPlayingExample(false);
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    typeSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: Colors.surface,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    typeButtonActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    typeLabel: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: Colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    typeLabelActive: {
      color: '#FFFFFF',
    },
    typeDescription: {
      fontSize: 11,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    typeDescriptionActive: {
      color: '#FFFFFF',
      opacity: 0.9,
    },
    difficultySelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    difficultyButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: Colors.surface,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.border,

    },
    difficultyText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.textSecondary,
    },
    difficultyTextActive: {
      color: '#FFFFFF',
    },
    exerciseCard: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    exerciseLabel: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: 4,
    },
    exercisePhoneme: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: Colors.primary,
    },
    refreshButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      backgroundColor: Colors.borderLight,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    exerciseText: {
      fontSize: 28,
      fontWeight: '600' as const,
      color: Colors.text,
      textAlign: 'center',
    },
    syllablesContainer: {
      marginBottom: 20,
    },
    syllablesLabel: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: 12,
    },
    syllables: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    syllableChip: {
      backgroundColor: Colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    syllableText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#FFFFFF',
    },
    playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: Colors.primary,
    },
    playButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.primary,
    },
    recordingSection: {
      marginTop: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: Colors.text,
      marginBottom: 16,
    },
    recordButton: {
      backgroundColor: Colors.primary,
      borderRadius: 20,
      paddingVertical: 24,
      alignItems: 'center',
      gap: 12,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    recordButtonActive: {
      backgroundColor: Colors.error,
    },
    recordButtonText: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    resultCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 16,
      borderWidth: 2,
      borderColor: Colors.success,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: Colors.success,
    },
    resultDuration: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: 16,
    },
    feedbackBox: {
      backgroundColor: Colors.borderLight,
      borderRadius: 12,
      padding: 16,
    },
    feedbackTitle: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.text,
      marginBottom: 8,
    },
    feedbackText: {
      fontSize: 14,
      color: Colors.textSecondary,
      lineHeight: 20,
    },
    instructions: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    instructionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    instructionsTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.text,
    },
    instructionsPlayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: Colors.borderLight,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    instructionsPlayText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: Colors.primary,
    },
    instructionsText: {
      fontSize: 14,
      color: Colors.textSecondary,
      lineHeight: 22,
    },
    loadingContainer: {
      paddingVertical: 60,
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: Colors.textSecondary,
    },
    productPromo: {
      borderRadius: 20,
      overflow: 'hidden',
      marginTop: 24,
      marginBottom: 20,
      shadowColor: Colors.premium.gold,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    promoGradient: {
      padding: 24,
    },
    promoContent: {
      alignItems: 'center',
    },
    promoTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: Colors.textInverse,
      marginBottom: 8,
      textAlign: 'center',
    },
    promoText: {
      fontSize: 14,
      color: Colors.textInverse,
      textAlign: 'center',
      marginBottom: 16,
      opacity: 0.95,
    },
    promoButton: {
      backgroundColor: Colors.textInverse,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    promoButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.premium.goldDark,
    },
    backButton: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: 24,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.text,
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: t.sections.articulation,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: Colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isGenerating || !currentExercise ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>{t.common.loading}</Text>
            </View>
          ) : (
          <>
          <View style={styles.typeSelector}>
            {exerciseTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeButton,
                  exerciseType === item.type && styles.typeButtonActive,
                ]}
                onPress={() => {
                  setExerciseType(item.type);
                  generateExercise();
                }}
              >
                <Text
                  style={[
                    styles.typeLabel,
                    exerciseType === item.type && styles.typeLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.typeDescription,
                    exerciseType === item.type && styles.typeDescriptionActive,
                  ]}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>



          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View>
                <Text style={[styles.exerciseLabel, { color: Colors.textSecondary }]}>{language === 'tr' ? 'Hedef Fonem' : language === 'en' ? 'Target Phoneme' : 'Ziel-Phonem'}</Text>
                <Text style={[styles.exercisePhoneme, { color: Colors.primary }]}>{currentExercise.targetPhoneme}</Text>
              </View>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={generateExercise}
                disabled={isGenerating}
              >
                <Text style={{ fontSize: 20 }}>🔄</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.exerciseText}>{currentExercise.text}</Text>
            </View>

            <View style={styles.syllablesContainer}>
              <Text style={[styles.syllablesLabel, { color: Colors.textSecondary }]}>{t.tongueTwisters.syllables}:</Text>
              <View style={styles.syllables}>
                {currentExercise.syllables.map((syllable, index) => (
                  <View key={index} style={[styles.syllableChip, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.syllableText}>{syllable}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.playButton, { borderColor: Colors.primary }]}
              onPress={playExample}
            >
              <Volume2 size={20} color={Colors.primary} />
              <Text style={[styles.playButtonText, { color: Colors.primary }]}>
                {isPlayingExample ? (language === 'tr' ? 'Durdur' : language === 'en' ? 'Stop' : 'Stoppen') : t.tongueTwisters.listen}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recordingSection}>
            <Text style={styles.sectionTitle}>{language === 'tr' ? 'Senin Kaydın' : language === 'en' ? 'Your Recording' : 'Deine Aufnahme'}</Text>
            
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={() => {
                if (isRecording) {
                  stopRecording();
                } else if (isPlayingFeedback) {
                  Speech.stop();
                  setIsPlayingFeedback(false);
                  setAiVoiceFeedback(null);
                  setRecordingUri(null);
                } else {
                  startRecording();
                }
              }}
              disabled={isGeneratingFeedback}
            >
              {isRecording ? (
                <>
                  <Square size={32} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.recordButtonText}>{t.pronunciation.stopRecording}</Text>
                </>
              ) : isPlayingFeedback ? (
                <>
                  <Square size={32} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.recordButtonText}>{language === 'tr' ? 'Geri Bildirimi Durdur' : language === 'en' ? 'Stop Feedback' : 'Feedback Stoppen'}</Text>
                </>
              ) : (
                <>
                  <Mic size={32} color="#FFFFFF" />
                  <Text style={styles.recordButtonText}>{t.pronunciation.startRecording}</Text>
                </>
              )}
            </TouchableOpacity>

            {recordingUri && (
              <View style={[styles.resultCard, { borderColor: Colors.success }]}>
                <View style={styles.resultHeader}>
                  <Play size={20} color={Colors.success} />
                  <Text style={[styles.resultTitle, { color: Colors.success }]}>{language === 'tr' ? 'Kayıt Tamamlandı!' : language === 'en' ? 'Recording Complete!' : 'Aufnahme abgeschlossen!'}</Text>
                </View>
                <Text style={styles.resultDuration}>
                  {language === 'tr' ? 'Süre' : language === 'en' ? 'Duration' : 'Dauer'}: {(recordingDuration / 1000).toFixed(1)} {language === 'tr' ? 'saniye' : language === 'en' ? 'seconds' : 'Sekunden'}
                </Text>
                {isGeneratingFeedback ? (
                  <View style={styles.feedbackBox}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.feedbackTitle}>{language === 'tr' ? 'AI Geri Bildirimi Oluşturuluyor...' : language === 'en' ? 'Generating AI Feedback...' : 'AI-Feedback wird erstellt...'}</Text>
                  </View>
                ) : aiVoiceFeedback ? (
                  <View style={styles.feedbackBox}>
                    <Text style={styles.feedbackTitle}>{t.pronunciation.feedback}</Text>
                    <Text style={styles.feedbackText}>{aiVoiceFeedback}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          <View style={styles.instructions}>
            <View style={styles.instructionsHeader}>
              <Text style={styles.instructionsTitle}>💡 {language === 'tr' ? 'Nasıl Çalışılır?' : language === 'en' ? 'How to Practice?' : 'Wie übt man?'}</Text>
              <TouchableOpacity 
                style={styles.instructionsPlayButton} 
                onPress={() => {
                  if (isPlayingInstructions) {
                    Speech.stop();
                    setIsPlayingInstructions(false);
                  } else {
                    setIsPlayingInstructions(true);
                    const instructionsText = language === 'tr' 
                      ? 'Örneği dinleyin ve hecelere dikkat edin. Cicero Diksiyon Kalemi ile her heceyi yavaşça tekrarlayın. Kaydınızı yapın ve geri bildirimi inceleyin. Zorluk seviyesini değiştirerek yeni egzersizler alın.'
                      : language === 'en'
                      ? 'Listen to the example and pay attention to the syllables. Repeat each syllable slowly with Cicero Diction Pen. Make your recording and review the feedback. Get new exercises by changing the difficulty level.'
                      : 'Hören Sie sich das Beispiel an und achten Sie auf die Silben. Wiederholen Sie jede Silbe langsam mit dem Cicero Diktionsstift. Machen Sie Ihre Aufnahme und überprüfen Sie das Feedback. Erhalten Sie neue Übungen, indem Sie den Schwierigkeitsgrad ändern.';
                    const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
                    Speech.speak(instructionsText, {
                      language: speechLang,
                      rate: 0.85,
                      onDone: () => setIsPlayingInstructions(false),
                      onStopped: () => setIsPlayingInstructions(false),
                      onError: () => setIsPlayingInstructions(false),
                    });
                  }
                }}
              >
                <Play size={14} color={Colors.primary} />
                <Text style={styles.instructionsPlayText}>
                  {isPlayingInstructions ? (language === 'tr' ? 'Durdur' : language === 'en' ? 'Stop' : 'Stoppen') : (language === 'tr' ? 'AI Okusun' : language === 'en' ? 'AI Read' : 'AI Lesen')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.instructionsText}>
              {language === 'tr' ? '1. Örneği dinleyin ve hecelere dikkat edin\n2. Cicero Diksiyon Kalemi ile her heceyi yavaşça tekrarlayın\n3. Kaydınızı yapın ve geri bildirimi inceleyin\n4. Zorluk seviyesini değiştirerek yeni egzersizler alın' : language === 'en' ? '1. Listen to the example and pay attention to the syllables\n2. Repeat each syllable slowly with Cicero Diction Pen\n3. Make your recording and review the feedback\n4. Get new exercises by changing the difficulty level' : '1. Hören Sie sich das Beispiel an und achten Sie auf die Silben\n2. Wiederholen Sie jede Silbe langsam mit dem Cicero Diktionsstift\n3. Machen Sie Ihre Aufnahme und überprüfen Sie das Feedback\n4. Erhalten Sie neue Übungen, indem Sie den Schwierigkeitsgrad ändern'}
            </Text>
          </View>
          </>
          )}

          {!user?.hasProduct && (
            <TouchableOpacity
              style={[styles.productPromo, { shadowColor: Colors.premium.gold }]}
              onPress={() => router.push('/product-info' as any)}
            >
              <LinearGradient
                colors={[Colors.premium.gold, Colors.premium.goldDark]}
                style={styles.promoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.promoContent}>
                  <Text style={[styles.promoTitle, { color: Colors.textInverse }]}>🎯 Cicero {language === 'tr' ? 'Diksiyon Kalemi' : language === 'en' ? 'Diction Pen' : 'Diktionsstift'}</Text>
                  <Text style={[styles.promoText, { color: Colors.textInverse }]}>
                    {language === 'tr' ? 'Artikülasyon egzersizlerinin etkinliğini %300 artırın' : language === 'en' ? 'Increase the effectiveness of articulation exercises by 300%' : 'Erhöhen Sie die Wirksamkeit von Artikulationsübungen um 300%'}
                  </Text>
                  <View style={[styles.promoButton, { backgroundColor: Colors.textInverse }]}>
                    <Text style={[styles.promoButtonText, { color: Colors.premium.goldDark }]}>{language === 'tr' ? 'Ürünü İncele' : language === 'en' ? 'View Product' : 'Produkt ansehen'}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Home size={20} color={Colors.text} />
            <Text style={styles.backButtonText}>{language === 'tr' ? 'Anasayfaya Dön' : language === 'en' ? 'Back to Home' : 'Zurück zur Startseite'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
