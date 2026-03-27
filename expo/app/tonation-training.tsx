import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { RefreshCw, Mic, Play, Volume2, CheckCircle, Sparkles } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { analyzeReadingWithFeedback } from '@/utils/gptService';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useTranslation } from '@/constants/translations';
import { useVoiceCoach, getScreenCoachIntro } from '@/hooks/useVoiceCoach';

interface Story {
  title: string;
  text: string;
  focusPoints: string[];
}

export default function TonationTrainingScreen() {
  const { theme, language, profile } = useApp();
  const t = useTranslation(language);
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(Colors);
  const [story, setStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isPlayingFocusPoints, setIsPlayingFocusPoints] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    feedback: string;
    needsPencilPractice: boolean;
  } | null>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const voiceCoach = useVoiceCoach({ language, delay: 800 });

  React.useEffect(() => {
    const intro = getScreenCoachIntro('tonation', profile?.name || '', language);
    if (intro) voiceCoach.speakOnce(intro);
  }, []);

  const generateStory = async () => {
    Speech.stop();
    setIsPlayingFocusPoints(false);
    setIsGenerating(true);
    setHasRecorded(false);
    setRecordingUri(null);
    
    try {
      const prompt = `Bir diksiyon koçu olarak, tonlama çalışması için bir paragraf oluştur.

Paragraf:
- 5-7 cümle uzunluğunda olmalı
- Duygusal tonlama gerektiren bir hikaye veya anlatı içermeli
- Farklı tonlama noktaları içermeli (vurgu, duraklama, hız değişimi)
- Türkçe olmalı

Ayrıca 3 tonlama odak noktası belirt.`;

      const schema = z.object({
        title: z.string().describe('Hikaye başlığı'),
        text: z.string().describe('5-7 cümlelik paragraf metni'),
        focusPoints: z.array(z.string()).describe('3 tonlama odak noktası'),
      });

      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema,
      });
      
      console.log('Generated story:', result);
      
      setStory({
        title: result.title,
        text: result.text,
        focusPoints: result.focusPoints.length > 0 ? result.focusPoints : [
          'Duygusal vurguları net yapın',
          'Noktalama işaretlerinde duraklamayı unutmayın',
          'Hız değişimleriyle anlatımı zenginleştirin'
        ]
      });
    } catch (error) {
      console.error('Error generating story:', error);
      
      setStory({
        title: 'Yaz Günü Anıları',
        text: 'Güneşin ilk ışıkları pencereden içeri süzülürken, kuşların cıvıltıları kulağıma geldi. Yavaşça kalktım ve balkona çıktım. Sabahın serinliği yüzümü okşadı. Uzaktan denizin dalgaları kıyıya vuruyordu. Bu an, hayatımın en huzurlu anıydı. Derin bir nefes aldım ve gülümsedim.',
        focusPoints: [
          'Duygusal vurguları net yapın',
          'Noktalama işaretlerinde duraklamayı unutmayın',
          'Hız değişimleriyle anlatımı zenginleştirin'
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log('Requesting permissions...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        alert('Mikrofon izni gerekli!');
        return;
      }

      console.log('Permission granted, setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Kayıt başlatılamadı. Lütfen tekrar deneyin.');
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording...');
    setIsRecording(false);
    
    try {
      if (!recordingRef.current) return;
      
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recordingRef.current.getURI();
      console.log('Recording stopped and stored at', uri);
      
      setRecordingUri(uri);
      setHasRecorded(true);
      recordingRef.current = null;
      
      if (story && uri) {
        analyzeRecording(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };
  
  const analyzeRecording = async (uri: string) => {
    if (!story) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeReadingWithFeedback(story.text, uri);
      
      console.log('Tonation Analysis Result:', result);
      
      setAnalysisResult({
        score: result.score,
        feedback: result.feedback,
        needsPencilPractice: result.needsPencilPractice,
      });
      
      Speech.speak(result.voiceFeedback, {
        language: 'tr-TR',
        rate: 0.85,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Error analyzing recording:', error);
      
      Speech.speak('Kayıt analiz edildi. Tonlama çalışmanıza devam edin.', {
        language: 'tr-TR',
        rate: 0.85,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;
    
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      
      console.log('Loading sound from', recordingUri);
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setIsPlayingRecording(true);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingRecording(false);
        }
      });
      
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing recording:', error);
      alert('Kayıt oynatılamadı.');
    }
  };

  const playExample = () => {
    if (!story) return;
    
    setIsPlayingExample(true);
    Speech.speak(story.text, {
      language: 'tr-TR',
      rate: 0.75,
      pitch: 1.0,
      onDone: () => setIsPlayingExample(false),
      onStopped: () => setIsPlayingExample(false),
      onError: () => setIsPlayingExample(false),
    });
  };

  const stopExample = () => {
    Speech.stop();
    setIsPlayingExample(false);
  };

  const playFocusPoints = () => {
    if (!story) return;
    
    setIsPlayingFocusPoints(true);
    
    const languageCode = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    
    const focusPointsText = story.focusPoints.join('. ');
    
    Speech.speak(focusPointsText, {
      language: languageCode,
      rate: 0.75,
      pitch: 1.0,
      onDone: () => setIsPlayingFocusPoints(false),
      onStopped: () => setIsPlayingFocusPoints(false),
      onError: () => setIsPlayingFocusPoints(false),
    });
  };

  const stopFocusPoints = () => {
    Speech.stop();
    setIsPlayingFocusPoints(false);
  };

  React.useEffect(() => {
    generateStory();
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      Speech.stop();
      setIsPlayingFocusPoints(false);
    };
  }, []);

  React.useEffect(() => {
    if (story && !isGenerating) {
      const languageCode = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
      
      const tipText = language === 'tr'
        ? 'Tonlama çalışması yaparken duygusal vurguları abartarak yapın. Noktalama işaretlerinde mutlaka duraklamayı unutmayın. Kaydınızı dinlerken kendinizi eleştirmek yerine, gelişim alanlarınızı tespit edin.'
        : language === 'en'
        ? 'When doing intonation exercises, exaggerate emotional emphasis. Do not forget to pause at punctuation marks. When listening to your recording, identify areas for improvement instead of criticizing yourself.'
        : 'Übertreiben Sie bei Intonationsübungen die emotionale Betonung. Vergessen Sie nicht, bei Satzzeichen zu pausieren. Identifizieren Sie beim Anhören Ihrer Aufnahme Verbesserungsbereiche, anstatt sich selbst zu kritisieren.';
      
      const focusPointsText = story.focusPoints.join('. ');
      
      const stepsText = language === 'tr' 
        ? 'Çalışma Adımları. Birinci adım: Önce profesyonel örneği dinleyin. İkinci adım: Metni yüksek sesle okuyun ve kaydedin. Üçüncü adım: Kaydınızı dinleyin ve karşılaştırın.'
        : language === 'en'
        ? 'Study Steps. First step: Listen to the professional example first. Second step: Read the text aloud and record. Third step: Listen to your recording and compare.'
        : 'Übungsschritte. Erster Schritt: Hören Sie sich zuerst das professionelle Beispiel an. Zweiter Schritt: Lesen Sie den Text laut vor und nehmen Sie auf. Dritter Schritt: Hören Sie sich Ihre Aufnahme an und vergleichen Sie.';
      
      const fullText = `${tipText}. Odak Noktaları: ${focusPointsText}. ${stepsText}`;
      
      Speech.speak(fullText, {
        language: languageCode,
        rate: 0.75,
        pitch: 1.0,
      });
    }
  }, [story, isGenerating]);

  if (isGenerating || !story) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Tonlama Çalışması',
            headerStyle: { backgroundColor: Colors.accent },
            headerTintColor: '#FFFFFF',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Tonlama metni hazırlanıyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Tonlama Çalışması',
          headerStyle: { backgroundColor: Colors.accent },
          headerTintColor: '#FFFFFF',
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{story.title}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={generateStory}>
            <RefreshCw size={20} color={Colors.primary} />
            <Text style={styles.refreshText}>Yeni Metin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.textCard}>
          <Text style={styles.storyText}>{story.text}</Text>
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusHeader}>
            <Text style={styles.focusTitle}>🎯 Odak Noktaları</Text>
            <TouchableOpacity 
              style={styles.focusPlayButton} 
              onPress={isPlayingFocusPoints ? stopFocusPoints : playFocusPoints}
            >
              <Sparkles size={18} color={Colors.accent} />
              <Text style={styles.focusPlayText}>
                {isPlayingFocusPoints ? 'Durdur' : 'AI Okusun'}
              </Text>
            </TouchableOpacity>
          </View>
          {story.focusPoints.map((point, index) => (
            <View key={index} style={styles.focusItem}>
              <Text style={styles.focusBullet}>•</Text>
              <Text style={styles.focusText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsCard}>
          <View style={styles.actionsHeader}>
            <Text style={styles.actionsTitle}>Çalışma Adımları</Text>
            <TouchableOpacity 
              style={styles.actionsPlayButton} 
              onPress={() => {
                const stepsText = language === 'tr' 
                  ? 'Çalışma Adımları. Birinci adım: Önce profesyonel örneği dinleyin. İkinci adım: Metni yüksek sesle okuyun ve kaydedin. Üçüncü adım: Kaydınızı dinleyin ve karşılaştırın.'
                  : language === 'en'
                  ? 'Study Steps. First step: Listen to the professional example first. Second step: Read the text aloud and record. Third step: Listen to your recording and compare.'
                  : 'Übungsschritte. Erster Schritt: Hören Sie sich zuerst das professionelle Beispiel an. Zweiter Schritt: Lesen Sie den Text laut vor und nehmen Sie auf. Dritter Schritt: Hören Sie sich Ihre Aufnahme an und vergleichen Sie.';
                
                const speechLang = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
                Speech.speak(stepsText, {
                  language: speechLang,
                  rate: 0.75,
                });
              }}
            >
              <Sparkles size={18} color={Colors.primary} />
              <Text style={styles.actionsPlayText}>AI Okusun</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionItem}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>1</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Önce profesyonel örneği dinleyin</Text>
              <TouchableOpacity 
                style={styles.exampleButton} 
                onPress={isPlayingExample ? stopExample : playExample}
              >
                <Volume2 size={20} color="#FFFFFF" />
                <Text style={styles.exampleButtonText}>
                  {isPlayingExample ? 'Durdur' : 'Örneği Dinle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actionItem}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>2</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionText}>Metni yüksek sesle okuyun ve kaydedin</Text>
              <TouchableOpacity 
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive
                ]} 
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Mic size={20} color="#FFFFFF" />
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Kaydı Durdur' : 'Kayda Başla'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {hasRecorded && (
            <View style={styles.actionItem}>
              <View style={[styles.actionNumber, styles.actionNumberSuccess]}>
                <CheckCircle size={16} color="#FFFFFF" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionText}>Kaydınızı dinleyin ve karşılaştırın</Text>
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={playRecording}
                  disabled={isPlayingRecording}
                >
                  <Play size={20} color="#FFFFFF" />
                  <Text style={styles.playButtonText}>
                    {isPlayingRecording ? 'Oynatılıyor...' : 'Kaydımı Dinle'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {isAnalyzing && (
          <View style={styles.analyzingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.analyzingText}>AI performansınızı analiz ediyor...</Text>
          </View>
        )}

        {analysisResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultScore}>{analysisResult.score}</Text>
              <Text style={styles.resultScoreLabel}>Puan</Text>
            </View>
            <Text style={styles.resultFeedback}>{analysisResult.feedback}</Text>
            {analysisResult.needsPencilPractice && (
              <View style={styles.pencilWarning}>
                <Text style={styles.pencilWarningIcon}>✏️</Text>
                <Text style={styles.pencilWarningText}>
                  Daha temiz ve anlaşılır okuma için, metni diksiyon kalemi ile hece hece yazarak çalışmanızı öneririz.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 İpucu</Text>
          <Text style={styles.tipText}>
            Tonlama çalışması yaparken duygusal vurguları abartarak yapın. 
            Noktalama işaretlerinde mutlaka duraklamayı unutmayın. 
            Kaydınızı dinlerken kendinizi eleştirmek yerine, gelişim alanlarınızı tespit edin.
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    flex: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  textCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storyText: {
    fontSize: 18,
    lineHeight: 32,
    color: colors.text,
    textAlign: 'left',
  },
  focusCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  focusPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  focusPlayText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  focusItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  focusBullet: {
    fontSize: 16,
    color: colors.accent,
    marginRight: 12,
    marginTop: 2,
  },
  focusText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    flex: 1,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  actionsPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionsPlayText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  actionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionNumberSuccess: {
    backgroundColor: colors.accent,
  },
  actionNumberText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  actionContent: {
    flex: 1,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    fontWeight: '600' as const,
  },
  exampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  exampleButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  recordButtonActive: {
    backgroundColor: '#EF4444',
  },
  recordButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  tipBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  analyzingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  analyzingText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  resultScoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  resultFeedback: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 16,
  },
  pencilWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.borderLight,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  pencilWarningIcon: {
    fontSize: 24,
  },
  pencilWarningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
