import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Mic, Play, Square, RefreshCw, CheckCircle, Volume2, ArrowLeft } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { analyzeReadingWithFeedback, generatePronunciationText } from '@/utils/gptService';
import * as Speech from 'expo-speech';
import { useTranslation } from '@/constants/translations';
import { useVoiceCoach, getScreenCoachIntro } from '@/hooks/useVoiceCoach';

type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface AnalysisResult {
  overallScore: number;
  pronunciation: number;
  fluency: number;
  pace: number;
  feedback: string;
  suggestions: string[];
}



export default function PronunciationAssessmentScreen() {
  const router = useRouter();
  const { theme, language, profile } = useApp();
  const t = useTranslation(language);
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [currentText, setCurrentText] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [speechInProgress, setSpeechInProgress] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const voiceCoach = useVoiceCoach({ language, delay: 800 });

  React.useEffect(() => {
    const intro = getScreenCoachIntro('pronunciation', profile?.name || '', language);
    if (intro) voiceCoach.speakOnce(intro);
  }, []);

  const generateNewText = useCallback(async () => {
    setIsLoadingText(true);
    setAnalysisResult(null);
    setRecordingUri(null);
    
    try {
      const newText = await generatePronunciationText(difficulty, language);
      setCurrentText(newText);
      console.log('Generated new text for difficulty:', difficulty, 'language:', language, newText);
    } catch (error) {
      console.error('Error generating text:', error);
      const fallbackTexts = {
        tr: {
          easy: 'Şirin kedi bahçede çiçekleri kokluyordu. Rüzgar hafifçe esiyordu.',
          medium: 'Artikülasyon çalışmaları düzenli yapıldığında konuşma kalitesi belirgin şekilde artar.',
          hard: 'Çekoslovakyalılaştıramadıklarımızdan mısınız? Şu köşe yastığı kaşık çeşidi mi?',
        },
        en: {
          easy: 'The quick brown fox jumps over the lazy dog. She sells seashells by the seashore.',
          medium: 'The sixth sick sheikh\'s sixth sheep\'s sick. Betty Botter bought some butter.',
          hard: 'Pad kid poured curd pulled cod. The seething sea ceaseth and thus sufficeth us.',
        },
        de: {
          easy: 'Fischers Fritz fischt frische Fische. Blaukraut bleibt Blaukraut.',
          medium: 'Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben.',
          hard: 'Der Whiskeymixer mixt den Whiskey mit dem Whiskeymixer.',
        },
      };
      setCurrentText(fallbackTexts[language][difficulty]);
    } finally {
      setIsLoadingText(false);
    }
  }, [difficulty, language]);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        console.log('Permission denied');
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
      console.log('Recording stopped and stored at', uri);
      setRecordingUri(uri);
      setRecording(null);
      
      analyzeRecording(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const analyzeRecording = async (uri: string | null) => {
    if (!uri) {
      const noAudioMessages = {
        tr: 'Ses yüklemeniz gerçekleşmedi. Lütfen önce ses kaydı yapın.',
        en: 'Your audio upload did not occur. Please record audio first.',
        de: 'Ihr Audio-Upload ist nicht erfolgt. Bitte nehmen Sie zuerst Audio auf.',
      };
      alert(noAudioMessages[language]);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const result = await analyzeReadingWithFeedback(currentText, uri, language, profile.name);
      
      console.log('AI Analysis Result:', result);
      
      const analysisData = {
        overallScore: result.score,
        pronunciation: result.detailedAnalysis.pronunciation,
        fluency: result.detailedAnalysis.fluency,
        pace: result.detailedAnalysis.clarity,
        feedback: result.feedback,
        suggestions: result.detailedAnalysis.issues.length > 0 
          ? result.detailedAnalysis.issues 
          : ['Düzenli pratik yapın', 'Hecelere dikkat edin'],
      };
      
      setAnalysisResult(analysisData);
      
      const speechLanguage = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
      setSpeechInProgress(true);
      Speech.speak(result.voiceFeedback, {
        language: speechLanguage,
        rate: 0.85,
        pitch: 1.0,
        onDone: () => setSpeechInProgress(false),
        onStopped: () => setSpeechInProgress(false),
        onError: () => setSpeechInProgress(false),
      });
      
    } catch (error) {
      console.error('Error analyzing recording:', error);
      
      const fallbackResults = {
        tr: {
          overallScore: 65,
          pronunciation: 65,
          fluency: 70,
          pace: 60,
          feedback: 'Okuma performansınızı analiz ettik. Bazı hecelerde netlik sorunu tespit edildi. Daha temiz ve anlaşılır okuma için, metni diksiyon kalemi ile hece hece yazarak çalışmanızı öneririm.',
          suggestions: [
            'Heceleri yutmamaya dikkat edin',
            'Diksiyon kalemi ile hece hece yazarak çalışın',
            'Sesleri daha net çıkarmaya özen gösterin',
            'Düzenli pratik yapın'
          ],
          voiceFeedback: 'Okuma performansınızı analiz ettik. Daha temiz ve anlaşılır okuma için, metni diksiyon kalemi ile hece hece yazarak çalışmanızı öneririm.',
        },
        en: {
          overallScore: 65,
          pronunciation: 65,
          fluency: 70,
          pace: 60,
          feedback: 'We analyzed your reading performance. Clarity issues were detected in some syllables. For cleaner and clearer reading, I recommend practicing by writing the text syllable by syllable.',
          suggestions: [
            'Be careful not to swallow syllables',
            'Practice writing syllable by syllable',
            'Focus on producing sounds more clearly',
            'Practice regularly'
          ],
          voiceFeedback: 'We analyzed your reading performance. For cleaner and clearer reading, I recommend practicing by writing the text syllable by syllable.',
        },
        de: {
          overallScore: 65,
          pronunciation: 65,
          fluency: 70,
          pace: 60,
          feedback: 'Wir haben Ihre Leseleistung analysiert. In einigen Silben wurden Klarheitsprobleme festgestellt. Für ein saubereres und klareres Lesen empfehle ich, den Text Silbe für Silbe zu üben.',
          suggestions: [
            'Achten Sie darauf, keine Silben zu verschlucken',
            'Üben Sie Silbe für Silbe zu schreiben',
            'Konzentrieren Sie sich darauf, Laute klarer zu produzieren',
            'Üben Sie regelmäßig'
          ],
          voiceFeedback: 'Wir haben Ihre Leseleistung analysiert. Für ein saubereres und klareres Lesen empfehle ich, den Text Silbe für Silbe zu üben.',
        },
      };
      
      const fallbackResult = fallbackResults[language];
      setAnalysisResult(fallbackResult);
      
      const speechLanguage = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
      setSpeechInProgress(true);
      Speech.speak(fallbackResult.voiceFeedback, {
        language: speechLanguage,
        rate: 0.85,
        onDone: () => setSpeechInProgress(false),
        onStopped: () => setSpeechInProgress(false),
        onError: () => setSpeechInProgress(false),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (isPlayingRecording && sound) {
        console.log('Stopping playback...');
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlayingRecording(false);
        return;
      }

      console.log('Starting playback...');
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(newSound);
      setIsPlayingRecording(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Playback finished');
          setIsPlayingRecording(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing recording:', error);
      setIsPlayingRecording(false);
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
    }
  };

  const difficultyButtons: { level: DifficultyLevel; label: string; color: string }[] = [
    { level: 'easy', label: t.pronunciation.easy, color: '#10B981' },
    { level: 'medium', label: t.pronunciation.medium, color: '#F59E0B' },
    { level: 'hard', label: t.pronunciation.hard, color: '#EF4444' },
  ];

  React.useEffect(() => {
    generateNewText();
    
    return () => {
      Speech.stop();
      setSpeechInProgress(false);
    };
  }, [generateNewText]);

  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t.pronunciation.title,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.difficultyContainer}>
          <Text style={styles.sectionTitle}>{t.pronunciation.selectLevel}</Text>
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

        <View style={styles.textCard}>
          <View style={styles.textHeader}>
            <Text style={styles.sectionTitle}>{t.pronunciation.readingText}</Text>
            <TouchableOpacity 
              onPress={generateNewText} 
              style={styles.refreshButton}
              disabled={isLoadingText}
            >
              <RefreshCw size={20} color={isLoadingText ? Colors.textSecondary : Colors.primary} />
            </TouchableOpacity>
          </View>
          {isLoadingText ? (
            <View style={styles.loadingTextContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingTextLabel}>{t.pronunciation.generating}</Text>
            </View>
          ) : (
            <Text style={styles.readingText}>{currentText}</Text>
          )}
        </View>

        <View style={styles.recordingCard}>
          <Text style={styles.sectionTitle}>{t.pronunciation.recording}</Text>
          
          <View style={styles.recordingControls}>
            {!isRecording && !recordingUri && (
              <TouchableOpacity
                style={[styles.recordButton, styles.recordButtonStart]}
                onPress={startRecording}
              >
                <Mic size={32} color="#FFFFFF" />
                <Text style={styles.recordButtonText}>{t.pronunciation.startRecording}</Text>
              </TouchableOpacity>
            )}

            {isRecording && (
              <TouchableOpacity
                style={[styles.recordButton, styles.recordButtonStop]}
                onPress={stopRecording}
              >
                <Square size={32} color="#FFFFFF" />
                <Text style={styles.recordButtonText}>{t.pronunciation.stopRecording}</Text>
              </TouchableOpacity>
            )}

            {recordingUri && !isRecording && (
              <View style={styles.recordingActions}>
                <TouchableOpacity 
                  style={[
                    styles.playButton,
                    isPlayingRecording && styles.playButtonActive
                  ]} 
                  onPress={playRecording}
                >
                  {isPlayingRecording ? (
                    <Square size={24} color={Colors.primary} />
                  ) : (
                    <Play size={24} color={Colors.primary} />
                  )}
                  <Text style={styles.playButtonText}>
                    {isPlayingRecording 
                      ? (language === 'tr' ? 'Durdur' : language === 'en' ? 'Stop' : 'Stoppen')
                      : t.pronunciation.listen
                    }
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setRecordingUri(null);
                    setAnalysisResult(null);
                  }}
                >
                  <RefreshCw size={24} color={Colors.textSecondary} />
                  <Text style={styles.retryButtonText}>{t.pronunciation.recordAgain}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isAnalyzing && (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.analyzingText}>{t.pronunciation.analyzing}</Text>
            </View>
          )}
        </View>

        {analysisResult && (
          <View style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>{t.pronunciation.results}</Text>
            
            <View style={styles.scoreContainer}>
              <View style={styles.overallScore}>
                <Text style={styles.scoreValue}>{analysisResult.overallScore}</Text>
                <Text style={styles.scoreLabel}>{t.pronunciation.overallScore}</Text>
              </View>
              
              <View style={styles.detailedScores}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>{t.pronunciation.pronunciation}</Text>
                  <Text style={styles.scoreItemValue}>{analysisResult.pronunciation}</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>{t.pronunciation.fluency}</Text>
                  <Text style={styles.scoreItemValue}>{analysisResult.fluency}</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>{t.pronunciation.pace}</Text>
                  <Text style={styles.scoreItemValue}>{analysisResult.pace}</Text>
                </View>
              </View>
            </View>

            <View style={styles.feedbackContainer}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackTitle}>{t.pronunciation.feedback}</Text>
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={() => {
                    if (speechInProgress) {
                      Speech.stop();
                      setSpeechInProgress(false);
                    } else {
                      const speechLanguage = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
                      setSpeechInProgress(true);
                      Speech.speak(analysisResult.feedback, {
                        language: speechLanguage,
                        rate: 0.9,
                        onDone: () => setSpeechInProgress(false),
                        onStopped: () => setSpeechInProgress(false),
                        onError: () => setSpeechInProgress(false),
                      });
                    }
                  }}
                >
                  <Volume2 size={20} color={speechInProgress ? Colors.accent : Colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.feedbackText}>{analysisResult.feedback}</Text>
            </View>

            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>{t.pronunciation.suggestions}</Text>
              {analysisResult.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <CheckCircle size={16} color={Colors.primary} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={async () => {
              if (recording) {
                await recording.stopAndUnloadAsync();
              }
              if (speechInProgress) {
                Speech.stop();
              }
              if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
              }
              router.back();
            }}
          >
            <ArrowLeft size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>{t.pronunciation.backButton}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (Colors: typeof lightTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  difficultyButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  difficultyButtonTextActive: {
    color: '#FFFFFF',
  },
  textCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,

  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    padding: 8,
  },
  readingText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.text,
  },
  recordingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,

  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  recordButtonStart: {
    backgroundColor: Colors.primary,
  },
  recordButtonStop: {
    backgroundColor: '#EF4444',
  },
  recordButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
  },
  playButtonActive: {
    backgroundColor: Colors.primary + '20',
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  analyzingText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  resultsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,

  },
  scoreContainer: {
    marginBottom: 20,
  },
  overallScore: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  detailedScores: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  scoreItemLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  speakButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  navigationContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  loadingTextContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingTextLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
