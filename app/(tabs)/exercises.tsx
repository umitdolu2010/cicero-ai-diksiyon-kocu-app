import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Zap, Activity, Target, Clock, Play, BookOpen, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { getSessionDurations, getExerciseCategories } from '@/constants/exercises';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/constants/translations';
import { exerciseTemplates, getMotivationTips, turkishVowels, turkishConsonants } from '@/constants/exerciseTemplates';
import * as Speech from 'expo-speech';

interface Exercise {
  title: string;
  instruction: string;
  duration: string;
}

function createStyles(Colors: typeof lightTheme) {
  return StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text, marginBottom: 16 },
    durationGrid: { flexDirection: 'row', gap: 12 },
    durationCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    durationCardSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    durationLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, textAlign: 'center' },
    durationLabelSelected: { color: '#FFFFFF' },
    durationSubtext: { fontSize: 12, color: Colors.textSecondary },
    durationSubtextSelected: { color: 'rgba(255, 255, 255, 0.9)' },
    categoryList: { gap: 12 },
    categoryCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 2, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    categoryCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
    categoryContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    categoryName: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
    categoryNameSelected: { color: '#FFFFFF' },
    selectedIndicator: { position: 'absolute' as const, right: 20, top: 20, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' },
    summaryCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: Colors.border },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
    summaryTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryLabel: { fontSize: 15, color: Colors.textSecondary },
    summaryValue: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
    startButton: { backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 18, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5, marginTop: 20 },
    startButtonText: { fontSize: 18, fontWeight: '700' as const, color: '#FFFFFF' },
    tipBox: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 2, borderColor: Colors.border },
    tipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    tipTitle: { fontSize: 16, fontWeight: '600' as const, color: Colors.text },
    tipPlayButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.borderLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    tipPlayText: { fontSize: 12, fontWeight: '600' as const, color: Colors.primary },
    tipText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { fontSize: 16, color: Colors.textSecondary },
    progressContainer: { marginBottom: 24 },
    progressText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 8, textAlign: 'center' },
    progressBar: { height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%' as const, backgroundColor: Colors.accent, borderRadius: 4 },
    exerciseActiveCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24 },
    exerciseActiveTitle: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginBottom: 8, textAlign: 'center' },
    exerciseActiveDuration: { fontSize: 16, color: Colors.textSecondary, marginBottom: 24, textAlign: 'center' },
    instructionBox: { backgroundColor: Colors.borderLight, borderRadius: 16, padding: 20, marginBottom: 24 },
    instructionText: { fontSize: 16, lineHeight: 24, color: Colors.text, textAlign: 'center' },
    exerciseActions: { gap: 12 },
    repeatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.borderLight, paddingVertical: 14, borderRadius: 12 },
    repeatButtonText: { fontSize: 15, fontWeight: '600' as const, color: Colors.primary },
    nextExerciseButton: { backgroundColor: Colors.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    nextExerciseButtonText: { fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF' },
    readingExerciseCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: Colors.primary },
    readingExerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    readingExerciseTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text },
    readingExerciseText: { fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.borderLight, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 16 },
    backButtonText: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
    refreshButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, flex: 1 },
    buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    endSessionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EF4444', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, flex: 2 },
    endSessionButtonText: { fontSize: 15, fontWeight: '600' as const, color: '#FFFFFF' },
    vowelsCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: Colors.accent },
    vowelsTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 16, textAlign: 'center' },
    vowelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    vowelItem: { width: 60, height: 60, backgroundColor: Colors.accent, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    vowelText: { fontSize: 24, fontWeight: '700' as const, color: '#FFFFFF' },
    consonantsCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, borderWidth: 2, borderColor: Colors.primary },
    consonantsTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 12, textAlign: 'center' },
    consonantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    consonantItem: { width: 36, height: 36, backgroundColor: Colors.primary, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
    consonantText: { fontSize: 14, fontWeight: '700' as const, color: '#FFFFFF' },
  });
}

export default function ExercisesScreen() {
  const router = useRouter();
  const { theme, language } = useApp();
  const { user } = useAuth();
  const t = useTranslation(language);
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => createStyles(Colors), [Colors]);

  const SESSION_DURATIONS = getSessionDurations(language);
  const EXERCISE_CATEGORIES = getExerciseCategories(language);

  const [selectedDuration, setSelectedDuration] = useState(SESSION_DURATIONS[1]);
  const [selectedCategory, setSelectedCategory] = useState(EXERCISE_CATEGORIES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [motivationTip, setMotivationTip] = useState('');
  const [isPlayingTip, setIsPlayingTip] = useState(false);

  const motivationTips = getMotivationTips(language);

  useEffect(() => {
    const randomTip = motivationTips[Math.floor(Math.random() * motivationTips.length)];
    setMotivationTip(randomTip);

    const userName = user?.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
    const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    Speech.speak(`${userName}, ${randomTip}`, { language: speechLang, rate: 0.85 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTip = () => {
    if (isPlayingTip) {
      Speech.stop();
      setIsPlayingTip(false);
    } else {
      setIsPlayingTip(true);
      const userName = user?.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
      const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
      Speech.speak(`${userName}, ${motivationTip}`, {
        language: speechLang,
        rate: 0.85,
        onDone: () => setIsPlayingTip(false),
        onStopped: () => setIsPlayingTip(false),
        onError: () => setIsPlayingTip(false),
      });
    }
  };

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const getLocalExercises = (categoryId: string, duration: number): Exercise[] => {
    const lang = language === 'tr' ? 'tr' : language === 'en' ? 'en' : 'de';
    const categoryExercises = exerciseTemplates[lang]?.[categoryId] || exerciseTemplates[lang]?.['breathing'] || [];
    const numExercises = Math.min(Math.ceil(duration / 2), categoryExercises.length);
    return categoryExercises.slice(0, numExercises);
  };

  const startSession = async () => {
    setIsGenerating(true);
    try {
      const generatedExercises = getLocalExercises(selectedCategory.id, selectedDuration.duration);
      console.log('Generated exercises:', generatedExercises);
      setExercises(generatedExercises);
      setCurrentExerciseIndex(0);
      setIsSessionActive(true);

      if (generatedExercises.length > 0) {
        const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
        const userName = user?.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
        const startText = language === 'tr' ? `${userName}, seans başlıyor` : language === 'en' ? `${userName}, session starting` : `${userName}, Sitzung beginnt`;
        Speech.speak(`${startText}. ${generatedExercises[0].title}. ${generatedExercises[0].instruction}`, { language: speechLang, rate: 0.85 });
      }
    } catch (error) {
      console.error('Error generating exercises:', error);
      const errorMsg = language === 'tr' ? 'Egzersizler oluşturulurken hata oluştu. Lütfen tekrar deneyin.' : language === 'en' ? 'An error occurred while generating exercises. Please try again.' : 'Beim Erstellen der Übungen ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextExercise = () => {
    Speech.stop();
    const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    const userName = user?.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');

    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      const nextEx = exercises[nextIndex];
      Speech.speak(`${nextEx.title}. ${nextEx.instruction}`, { language: speechLang, rate: 0.85 });
    } else {
      const completeText = language === 'tr' ? `Tebrikler ${userName}! Seansı tamamladınız.` : language === 'en' ? `Congratulations ${userName}! You completed the session.` : `Herzlichen Glückwunsch ${userName}! Sie haben die Sitzung abgeschlossen.`;
      Speech.speak(completeText, { language: speechLang, rate: 0.85 });
      setIsSessionActive(false);
    }
  };

  const repeatInstruction = () => {
    Speech.stop();
    const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    const currentEx = exercises[currentExerciseIndex];
    Speech.speak(`${currentEx.title}. ${currentEx.instruction}`, { language: speechLang, rate: 0.85 });
  };

  const goBackToSetup = () => {
    Speech.stop();
    setIsSessionActive(false);
    setExercises([]);
    setCurrentExerciseIndex(0);
  };

  const refreshExercises = async () => {
    Speech.stop();
    setIsSessionActive(false);
    setExercises([]);
    setCurrentExerciseIndex(0);
    await startSession();
  };

  if (isGenerating) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <Stack.Screen options={{ title: t.exercises.title, headerStyle: { backgroundColor: Colors.accent }, headerTintColor: '#FFFFFF' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      </View>
    );
  }

  if (isSessionActive && exercises.length > 0) {
    const currentExercise = exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <Stack.Screen options={{ title: t.exercises.title, headerStyle: { backgroundColor: Colors.accent }, headerTintColor: '#FFFFFF' }} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={goBackToSetup}>
            <ArrowLeft size={20} color={Colors.text} />
            <Text style={styles.backButtonText}>{t.common.back}</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshExercises}>
              <RefreshCw size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.endSessionButton} onPress={goBackToSetup}>
              <Text style={styles.endSessionButtonText}>{language === 'tr' ? 'Seansı Bitir' : language === 'en' ? 'End Session' : 'Sitzung beenden'}</Text>
            </TouchableOpacity>
          </View>

          {selectedCategory.id === 'vowels' && (
            <View style={styles.vowelsCard}>
              <Text style={styles.vowelsTitle}>🗣️ {language === 'tr' ? 'Sesli Harfler' : language === 'en' ? 'Vowels' : 'Vokale'}</Text>
              <View style={styles.vowelsGrid}>
                {turkishVowels.map((vowel) => (
                  <View key={vowel} style={styles.vowelItem}>
                    <Text style={styles.vowelText}>{vowel}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedCategory.id === 'consonants' && (
            <View style={styles.consonantsCard}>
              <Text style={styles.consonantsTitle}>🔤 {language === 'tr' ? 'Sessiz Harfler' : language === 'en' ? 'Consonants' : 'Konsonanten'}</Text>
              <View style={styles.consonantsGrid}>
                {turkishConsonants.map((consonant) => (
                  <View key={consonant} style={styles.consonantItem}>
                    <Text style={styles.consonantText}>{consonant}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {language === 'tr' ? 'Egzersiz' : language === 'en' ? 'Exercise' : 'Übung'} {currentExerciseIndex + 1} / {exercises.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.exerciseActiveCard}>
            <Text style={styles.exerciseActiveTitle}>{currentExercise.title}</Text>
            <Text style={styles.exerciseActiveDuration}>{currentExercise.duration}</Text>
            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>{currentExercise.instruction}</Text>
            </View>
            <View style={styles.exerciseActions}>
              <TouchableOpacity style={styles.repeatButton} onPress={repeatInstruction}>
                <Play size={20} color={Colors.primary} />
                <Text style={styles.repeatButtonText}>{language === 'tr' ? 'Tekrar Dinle' : language === 'en' ? 'Listen Again' : 'Nochmal anhören'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextExerciseButton} onPress={nextExercise}>
                <Text style={styles.nextExerciseButtonText}>
                  {currentExerciseIndex < exercises.length - 1
                    ? (language === 'tr' ? 'Sonraki Egzersiz' : language === 'en' ? 'Next Exercise' : 'Nächste Übung')
                    : (language === 'tr' ? 'Seansı Bitir' : language === 'en' ? 'End Session' : 'Sitzung beenden')
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t.exercises.title, headerStyle: { backgroundColor: Colors.accent }, headerTintColor: '#FFFFFF' }} />
      <ScrollView style={[styles.container, { backgroundColor: Colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{language === 'tr' ? 'Süre Seç' : language === 'en' ? 'Select Duration' : 'Dauer wählen'}</Text>
            <View style={styles.durationGrid}>
              {SESSION_DURATIONS.map((duration) => {
                const Icon = duration.id === '3' ? Zap : duration.id === '7' ? Activity : Target;
                const isSelected = selectedDuration.id === duration.id;
                return (
                  <TouchableOpacity key={duration.id} style={[styles.durationCard, isSelected && styles.durationCardSelected]} onPress={() => setSelectedDuration(duration)}>
                    <Icon size={32} color={isSelected ? '#FFFFFF' : Colors.accent} />
                    <Text style={[styles.durationLabel, isSelected && styles.durationLabelSelected]}>{duration.label}</Text>
                    <Text style={[styles.durationSubtext, isSelected && styles.durationSubtextSelected]}>{duration.duration} {language === 'tr' ? 'dk' : language === 'en' ? 'min' : 'Min'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{language === 'tr' ? 'Kategori Seç' : language === 'en' ? 'Select Category' : 'Kategorie wählen'}</Text>
            <View style={styles.categoryList}>
              {EXERCISE_CATEGORIES.map((category) => {
                const isSelected = selectedCategory.id === category.id;
                return (
                  <TouchableOpacity key={category.id} style={[styles.categoryCard, isSelected && styles.categoryCardSelected]} onPress={() => setSelectedCategory(category)}>
                    <View style={styles.categoryContent}>
                      <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>{category.name}</Text>
                    </View>
                    {isSelected && <View style={styles.selectedIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Clock size={24} color={Colors.primary} />
              <Text style={styles.summaryTitle}>{language === 'tr' ? 'Seans Özeti' : language === 'en' ? 'Session Summary' : 'Sitzungsübersicht'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{language === 'tr' ? 'Süre:' : language === 'en' ? 'Duration:' : 'Dauer:'}</Text>
              <Text style={styles.summaryValue}>{selectedDuration.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{language === 'tr' ? 'Kategori:' : language === 'en' ? 'Category:' : 'Kategorie:'}</Text>
              <Text style={styles.summaryValue}>{selectedCategory.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{language === 'tr' ? 'Tahmini Egzersiz:' : language === 'en' ? 'Estimated Exercises:' : 'Geschätzte Übungen:'}</Text>
              <Text style={styles.summaryValue}>{Math.floor(selectedDuration.duration / 2)}-{selectedDuration.duration} {language === 'tr' ? 'adet' : language === 'en' ? 'items' : 'Stück'}</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipTitle}>💪 {language === 'tr' ? 'İpucu' : language === 'en' ? 'Tip' : 'Tipp'}</Text>
              <TouchableOpacity style={styles.tipPlayButton} onPress={playTip}>
                <Play size={16} color={Colors.primary} />
                <Text style={styles.tipPlayText}>{isPlayingTip ? (language === 'tr' ? 'Durdur' : language === 'en' ? 'Stop' : 'Stoppen') : (language === 'tr' ? 'AI Okusun' : language === 'en' ? 'AI Read' : 'AI Lesen')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.tipText}>{motivationTip}</Text>
          </View>

          <TouchableOpacity style={styles.readingExerciseCard} onPress={() => router.push('/reading-exercise' as any)}>
            <View style={styles.readingExerciseHeader}>
              <BookOpen size={24} color={Colors.primary} />
              <Text style={styles.readingExerciseTitle}>{t.reading.title}</Text>
            </View>
            <Text style={styles.readingExerciseText}>
              {language === 'tr' ? 'Size özel hazırlanmış metinleri okuyarak diksiyon becerilerinizi geliştirin.' : language === 'en' ? 'Improve your diction skills by reading texts specially prepared for you.' : 'Verbessern Sie Ihre Diktionsfähigkeiten, indem Sie speziell für Sie vorbereitete Texte lesen.'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <Text style={styles.startButtonText}>{language === 'tr' ? 'Seansa Başla' : language === 'en' ? 'Start Session' : 'Sitzung starten'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}
