import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { Audio } from 'expo-av';
import { Headphones, Play, Mic, CheckCircle, XCircle, RotateCcw, Search } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import * as Speech from 'expo-speech';
import { generateText } from '@rork-ai/toolkit-sdk';
import { useVoiceCoach, getScreenCoachIntro } from '@/hooks/useVoiceCoach';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface Exercise {
  type: 'comparison' | 'phoneme';
  text: string;
  options?: string[];
  correctAnswer?: string;
}

export default function ListeningTrainingScreen() {
  const { theme, language: appLanguage, profile } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(Colors);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showWordFinder, setShowWordFinder] = useState(false);

  const voiceCoach = useVoiceCoach({ language: appLanguage, delay: 800 });

  React.useEffect(() => {
    const intro = getScreenCoachIntro('listening', profile?.name || '', appLanguage);
    if (intro) voiceCoach.speakOnce(intro);
  }, []);

  const generateExercise = React.useCallback(async () => {
    setIsGenerating(true);
    
    try {
      const difficultyMap = {
        easy: 'kolay (basit kelimeler ve cümleler)',
        medium: 'orta (orta zorlukta kelimeler)',
        hard: 'zor (karmaşık kelimeler ve benzer sesler)',
      };

      const exerciseType = Math.random() > 0.5 ? 'comparison' : 'phoneme';

      let prompt = '';
      if (exerciseType === 'comparison') {
        prompt = `Türkçe diksiyon dinleme egzersizi için ${difficultyMap[difficulty]} seviyesinde bir karşılaştırmalı dinleme metni oluştur.

Yanıtını şu JSON formatında ver:
{
  "type": "comparison",
  "text": "Kullanıcının dinleyip tekrarlayacağı metin"
}`;
      } else {
        prompt = `Türkçe diksiyon dinleme egzersizi için ${difficultyMap[difficulty]} seviyesinde bir fonem ayırt etme sorusu oluştur.

3 benzer kelime seçeneği ver ve birini doğru cevap olarak belirle.

Yanıtını şu JSON formatında ver:
{
  "type": "phoneme",
  "text": "Aşağıdaki kelimelerden hangisini duydunuz?",
  "options": ["kelime1", "kelime2", "kelime3"],
  "correctAnswer": "kelime1"
}`;
      }

      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      console.log('Raw AI Response:', response);
      
      let cleanedResponse = response.trim();
      
      cleanedResponse = cleanedResponse.replace(/^\uFEFF/, '');
      cleanedResponse = cleanedResponse.replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
      cleanedResponse = cleanedResponse.replace(/```\s*/gi, '');
      cleanedResponse = cleanedResponse.trim();
      
      if ((cleanedResponse.startsWith('"') && cleanedResponse.endsWith('"')) ||
          (cleanedResponse.startsWith("'") && cleanedResponse.endsWith("'"))) {
        cleanedResponse = cleanedResponse.slice(1, -1);
        cleanedResponse = cleanedResponse.trim();
      }
      
      const firstJsonChar = Math.min(
        cleanedResponse.indexOf('{') !== -1 ? cleanedResponse.indexOf('{') : Infinity,
        cleanedResponse.indexOf('[') !== -1 ? cleanedResponse.indexOf('[') : Infinity
      );
      
      if (firstJsonChar !== Infinity && firstJsonChar > 0) {
        console.log('Removing text before JSON, first', firstJsonChar, 'characters:', cleanedResponse.substring(0, firstJsonChar));
        cleanedResponse = cleanedResponse.substring(firstJsonChar);
      }
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*?\}/s);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        
        jsonString = jsonString.replace(/^\uFEFF/, '');
        jsonString = jsonString.replace(/[\u200B-\u200D\uFEFF]/g, '');
        jsonString = jsonString.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
        jsonString = jsonString.trim();
        
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }
        
        console.log('Extracted JSON:', jsonString);
        console.log('First 100 chars:', jsonString.substring(0, 100));
        
        try {
          const exercise = JSON.parse(jsonString);
          setCurrentExercise(exercise);
          setRecordingUri(null);
          setSelectedAnswer(null);
          setShowResult(false);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.error('Failed JSON string:', jsonString);
          console.error('Character codes at start:', Array.from(jsonString.slice(0, 20)).map((c, i) => `[${i}]${c}(${c.charCodeAt(0)})`).join(' '));
          
          setCurrentExercise({
            type: exerciseType,
            text: exerciseType === 'comparison' 
              ? 'Şu köşe yaz köşesi, şu köşe kış köşesi'
              : 'Aşağıdaki kelimelerden hangisini duydunuz?',
            options: exerciseType === 'phoneme' ? ['kal', 'kar', 'kan'] : undefined,
            correctAnswer: exerciseType === 'phoneme' ? 'kar' : undefined,
          });
        }
      } else {
        console.error('No JSON found in response');
        setCurrentExercise({
          type: exerciseType,
          text: exerciseType === 'comparison' 
            ? 'Şu köşe yaz köşesi, şu köşe kış köşesi'
            : 'Aşağıdaki kelimelerden hangisini duydunuz?',
          options: exerciseType === 'phoneme' ? ['kal', 'kar', 'kan'] : undefined,
          correctAnswer: exerciseType === 'phoneme' ? 'kar' : undefined,
        });
      }
    } catch (error) {
      console.error('Error generating exercise:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [difficulty]);

  useEffect(() => {
    generateExercise();
    
    return () => {
      Speech.stop();
      setIsPlayingExample(false);
    };
  }, [generateExercise]);

  const playExample = async () => {
    if (!currentExercise) return;
    setIsPlayingExample(true);
    
    Speech.speak(currentExercise.text, {
      language: 'tr-TR',
      rate: 0.8,
      onDone: () => setIsPlayingExample(false),
      onError: () => setIsPlayingExample(false),
    });
  };

  const playExampleWord = async (word: string) => {
    Speech.speak(word, {
      language: 'tr-TR',
      rate: 0.8,
    });
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  };

  const checkAnswer = () => {
    setShowResult(true);
  };

  const nextExercise = () => {
    generateExercise();
  };

  const searchWord = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const prompt = `"${searchQuery}" kelimesi için telaffuz açısından benzer veya karıştırılabilecek 5 Türkçe kelime öner. Sadece kelimeleri virgülle ayırarak ver, başka açıklama ekleme.`;
      
      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      const words = response.split(',').map(w => w.trim()).filter(w => w.length > 0);
      setSearchResults([searchQuery, ...words].slice(0, 6));
    } catch (error) {
      console.error('Error searching word:', error);
      setSearchResults([searchQuery]);
    } finally {
      setIsSearching(false);
    }
  };

  const playWord = (word: string) => {
    Speech.speak(word, {
      language: 'tr-TR',
      rate: 0.7,
    });
  };

  const difficultyButtons: { level: DifficultyLevel; label: string; color: string }[] = [
    { level: 'easy', label: 'Kolay', color: '#10B981' },
    { level: 'medium', label: 'Orta', color: '#F59E0B' },
    { level: 'hard', label: 'Zor', color: '#EF4444' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Kulağını Geliştir',
          headerStyle: { backgroundColor: '#F59E0B' },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.wordFinderCard}
          onPress={() => setShowWordFinder(!showWordFinder)}
        >
          <View style={styles.wordFinderHeader}>
            <Search size={24} color={Colors.primary} />
            <Text style={styles.wordFinderTitle}>Kelime Bulucu</Text>
          </View>
          <Text style={styles.wordFinderDescription}>
            Telaffuzunu bilmediğiniz kelimeleri arayın, dinleyin ve kalemle artiküle ederek pratik yapın.
          </Text>
        </TouchableOpacity>

        {showWordFinder && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Kelime ara..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchWord}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={searchWord}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Search size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Kelimeler ve Benzer Telaffuzlar</Text>
                <Text style={styles.resultsHint}>
                  Her kelimeyi dinleyin ve kalemle hece hece artiküle ederek dil ve dudak becerilerinizi geliştirin.
                </Text>
                {searchResults.map((word, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.wordCard,
                      index === 0 && styles.wordCardPrimary,
                    ]}
                    onPress={() => playWord(word)}
                  >
                    <Text style={[
                      styles.wordText,
                      index === 0 && styles.wordTextPrimary,
                    ]}>
                      {word}
                    </Text>
                    <Play size={20} color={index === 0 ? Colors.primary : Colors.textSecondary} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={styles.practiceHint}
                  onPress={() => {
                    const tipText = 'Pratik İpucu: Diksiyon kaleminizi kullanarak her kelimeyi hece hece okuyun. Bu, dil ve dudak kaslarınızı güçlendirir ve net telaffuz için gerekli kas hafızasını oluşturur.';
                    Speech.speak(tipText, {
                      language: 'tr-TR',
                      rate: 0.8,
                    });
                  }}
                >
                  <View style={styles.practiceHintHeader}>
                    <Text style={styles.practiceHintTitle}>💡 Pratik İpucu</Text>
                    <Play size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.practiceHintText}>
                    Diksiyon kaleminizi kullanarak her kelimeyi hece hece okuyun. Bu, dil ve dudak kaslarınızı güçlendirir ve net telaffuz için gerekli kas hafızasını oluşturur.
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.difficultyContainer}>
          <Text style={styles.sectionTitle}>Seviye Seç</Text>
          <View style={styles.difficultyButtons}>
            {difficultyButtons.map((btn) => (
              <TouchableOpacity
                key={btn.level}
                style={[
                  styles.difficultyButton,
                  difficulty === btn.level && { backgroundColor: btn.color },
                  difficulty !== btn.level && styles.difficultyButtonInactive,
                ]}
                onPress={() => {
                  setDifficulty(btn.level);
                  generateExercise();
                }}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    difficulty === btn.level && styles.difficultyButtonTextActive,
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {isGenerating || !currentExercise ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Egzersiz hazırlanıyor...</Text>
          </View>
        ) : currentExercise.type === 'comparison' ? (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>Karşılaştırmalı Dinleme</Text>
            <Text style={styles.exerciseDescription}>
              Önce örnek sesi dinleyin, sonra kendi sesinizi kaydedin ve karşılaştırın.
            </Text>

            <View style={styles.textCard}>
              <Text style={styles.exerciseText}>{currentExercise.text}</Text>
            </View>

            <TouchableOpacity
              style={styles.playButton}
              onPress={playExample}
              disabled={isPlayingExample}
            >
              {isPlayingExample ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
              <Text style={styles.playButtonText}>
                {isPlayingExample ? 'Oynatılıyor...' : 'Örnek Sesi Dinle'}
              </Text>
            </TouchableOpacity>

            <View style={styles.recordingSection}>
              {!isRecording && !recordingUri && (
                <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
                  <Mic size={24} color="#FFFFFF" />
                  <Text style={styles.recordButtonText}>Kendi Sesinizi Kaydedin</Text>
                </TouchableOpacity>
              )}

              {isRecording && (
                <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
                  <View style={styles.stopIcon} />
                  <Text style={styles.stopButtonText}>Kaydı Durdur</Text>
                </TouchableOpacity>
              )}

              {recordingUri && (
                <View style={styles.recordingActions}>
                  <TouchableOpacity style={styles.playRecordingButton} onPress={playRecording}>
                    <Play size={20} color={Colors.primary} />
                    <Text style={styles.playRecordingText}>Kaydınızı Dinle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setRecordingUri(null)}
                  >
                    <RotateCcw size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={nextExercise}>
              <Text style={styles.nextButtonText}>Sonraki Egzersiz</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseTitle}>Fonem Ayırt Etme</Text>
            <Text style={styles.exerciseDescription}>
              Dinlediğiniz kelimeyi seçenekler arasından bulun.
            </Text>

            <TouchableOpacity
              style={styles.playButton}
              onPress={() => playExampleWord(currentExercise.correctAnswer || '')}
            >
              <Headphones size={24} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Kelimeyi Dinle</Text>
            </TouchableOpacity>

            <View style={styles.optionsContainer}>
              <Text style={styles.questionText}>{currentExercise.text}</Text>
              {currentExercise.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === option && styles.optionButtonSelected,
                    showResult &&
                      option === currentExercise.correctAnswer &&
                      styles.optionButtonCorrect,
                    showResult &&
                      selectedAnswer === option &&
                      option !== currentExercise.correctAnswer &&
                      styles.optionButtonWrong,
                  ]}
                  onPress={() => {
                    setSelectedAnswer(option);
                    playExampleWord(option);
                  }}
                  disabled={showResult}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswer === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {showResult && option === currentExercise.correctAnswer && (
                    <CheckCircle size={20} color="#10B981" />
                  )}
                  {showResult &&
                    selectedAnswer === option &&
                    option !== currentExercise.correctAnswer && (
                      <XCircle size={20} color="#EF4444" />
                    )}
                </TouchableOpacity>
              ))}
            </View>

            {!showResult && selectedAnswer && (
              <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
                <Text style={styles.checkButtonText}>Cevabı Kontrol Et</Text>
              </TouchableOpacity>
            )}

            {showResult && (
              <TouchableOpacity style={styles.nextButton} onPress={nextExercise}>
                <Text style={styles.nextButtonText}>Sonraki Egzersiz</Text>
              </TouchableOpacity>
            )}
          </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  difficultyContainer: {
    marginBottom: 20,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',

  },
  difficultyButtonInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  difficultyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.border,

  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  textCard: {
    backgroundColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  exerciseText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  recordingSection: {
    marginBottom: 20,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
  },
  stopIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  playRecordingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.borderLight,
    paddingVertical: 14,
    borderRadius: 12,
  },
  playRecordingText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  retryButton: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: 12,
  },
  nextButton: {
    backgroundColor: colors.borderLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.borderLight,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  optionButtonWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  checkButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
  wordFinderCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,

  },
  wordFinderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  wordFinderTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  wordFinderDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  searchContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,

  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    gap: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  resultsHint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.borderLight,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  wordCardPrimary: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  wordTextPrimary: {
    color: colors.primary,
    fontSize: 20,
  },
  practiceHint: {
    backgroundColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  practiceHintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  practiceHintTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  practiceHintText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
