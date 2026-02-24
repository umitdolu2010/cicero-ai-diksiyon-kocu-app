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
import { Wind, Volume2, RefreshCw, CheckCircle } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import * as Speech from 'expo-speech';
import { useTranslation } from '@/constants/translations';

interface DiaphragmExercise {
  title: string;
  description: string;
  steps: string[];
  duration: string;
  benefits: string[];
}

export default function DiaphragmTrainingScreen() {
  const { theme, language } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const t = useTranslation(language);
  const styles = createStyles(Colors);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exercises, setExercises] = useState<DiaphragmExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadExercises();
  }, [language]);

  const loadExercises = async () => {
    setIsGenerating(true);
    
    try {
      const exercisesData = await generateDiaphragmExercises(language);
      setExercises(exercisesData);
      setCurrentExerciseIndex(0);
    } catch (error) {
      console.error('Error generating exercises:', error);
      setExercises(getFallbackExercises(language));
    } finally {
      setIsGenerating(false);
    }
  };

  const speakExercise = (exercise: DiaphragmExercise) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    const speechLanguage = language === 'tr' ? 'tr-TR' : language === 'en' ? 'en-US' : 'de-DE';
    
    const howToLabel = language === 'tr' ? 'Nasıl Çalışır' : language === 'en' ? 'How it Works' : 'Wie es funktioniert';
    const stepsLabel = language === 'tr' ? 'Adımlar' : language === 'en' ? 'Steps' : 'Schritte';
    const benefitsLabel = language === 'tr' ? 'Faydaları' : language === 'en' ? 'Benefits' : 'Vorteile';
    
    const fullText = `${exercise.title}. ${howToLabel}. ${exercise.description}. ${stepsLabel}. ${exercise.steps.join('. ')}. ${benefitsLabel}. ${exercise.benefits.join('. ')}`;
    
    Speech.speak(fullText, {
      language: speechLanguage,
      rate: 0.85,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const markAsCompleted = (index: number) => {
    setCompletedExercises(prev => new Set(prev).add(index));
    if (index < exercises.length - 1) {
      setCurrentExerciseIndex(index + 1);
    } else {
      setCurrentExerciseIndex(0);
    }
  };

  const resetProgress = () => {
    setCompletedExercises(new Set());
    setCurrentExerciseIndex(0);
  };

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: language === 'tr' ? 'Diyafram Çalışması' : language === 'en' ? 'Diaphragm Training' : 'Zwerchfelltraining',
            headerStyle: { backgroundColor: '#10B981' },
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

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: language === 'tr' ? 'Diyafram Çalışması' : language === 'en' ? 'Diaphragm Training' : 'Zwerchfelltraining',
          headerStyle: { backgroundColor: '#10B981' },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.iconContainer}>
            <Wind size={48} color="#10B981" />
          </View>
          <Text style={styles.headerTitle}>
            {language === 'tr' ? 'Diyafram Çalışması' : language === 'en' ? 'Diaphragm Training' : 'Zwerchfelltraining'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'tr' 
              ? 'Diyafram nefesi ile sesinizi güçlendirin ve konuşma kalitenizi artırın' 
              : language === 'en' 
              ? 'Strengthen your voice and improve speech quality with diaphragmatic breathing' 
              : 'Stärken Sie Ihre Stimme und verbessern Sie die Sprachqualität mit Zwerchfellatmung'}
          </Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {language === 'tr' ? 'İlerleme' : language === 'en' ? 'Progress' : 'Fortschritt'}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${(completedExercises.size / exercises.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedExercises.size} / {exercises.length} {language === 'tr' ? 'egzersiz tamamlandı' : language === 'en' ? 'exercises completed' : 'Übungen abgeschlossen'}
          </Text>
        </View>

        {currentExercise && (
          <View style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseNumber}>
                {language === 'tr' ? 'Egzersiz' : language === 'en' ? 'Exercise' : 'Übung'} {currentExerciseIndex + 1}
              </Text>
              {completedExercises.has(currentExerciseIndex) && (
                <CheckCircle size={24} color="#10B981" />
              )}
            </View>
            
            <Text style={styles.exerciseTitle}>{currentExercise.title}</Text>
            <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>

            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>⏱️ {currentExercise.duration}</Text>
            </View>

            <View style={styles.stepsContainer}>
              <Text style={styles.stepsLabel}>
                {language === 'tr' ? 'Adımlar' : language === 'en' ? 'Steps' : 'Schritte'}
              </Text>
              {currentExercise.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsLabel}>
                {language === 'tr' ? 'Faydaları' : language === 'en' ? 'Benefits' : 'Vorteile'}
              </Text>
              {currentExercise.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitDot} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakExercise(currentExercise)}
              >
                <Volume2 size={24} color="#FFFFFF" />
                <Text style={styles.speakButtonText}>
                  {isSpeaking ? t.common.stop : t.tongueTwisters.listen}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.completeButton,
                  completedExercises.has(currentExerciseIndex) && styles.completedButton
                ]}
                onPress={() => markAsCompleted(currentExerciseIndex)}
              >
                <CheckCircle size={24} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>
                  {completedExercises.has(currentExerciseIndex) 
                    ? (language === 'tr' ? 'Tamamlandı' : language === 'en' ? 'Completed' : 'Abgeschlossen')
                    : (language === 'tr' ? 'Tamamla' : language === 'en' ? 'Complete' : 'Abschließen')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
            onPress={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0}
          >
            <Text style={styles.navButtonText}>
              {language === 'tr' ? '← Önceki' : language === 'en' ? '← Previous' : '← Zurück'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === exercises.length - 1 && styles.navButtonDisabled]}
            onPress={() => setCurrentExerciseIndex(Math.min(exercises.length - 1, currentExerciseIndex + 1))}
            disabled={currentExerciseIndex === exercises.length - 1}
          >
            <Text style={styles.navButtonText}>
              {language === 'tr' ? 'Sonraki →' : language === 'en' ? 'Next →' : 'Weiter →'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={loadExercises}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <RefreshCw size={24} color="#10B981" />
            )}
            <Text style={styles.refreshButtonText}>
              {language === 'tr' ? 'Yeni Egzersizler' : language === 'en' ? 'New Exercises' : 'Neue Übungen'}
            </Text>
          </TouchableOpacity>

          {completedExercises.size > 0 && (
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetProgress}
            >
              <Text style={styles.resetButtonText}>
                {language === 'tr' ? 'İlerlemeyi Sıfırla' : language === 'en' ? 'Reset Progress' : 'Fortschritt zurücksetzen'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

async function generateDiaphragmExercises(language: 'tr' | 'en' | 'de'): Promise<DiaphragmExercise[]> {
  console.log('Generating diaphragm exercises for language:', language);
  
  try {
    const prompts = {
      tr: `Bir diksiyon ve ses koçu olarak, diyafram nefes egzersizleri oluştur. 5 adet egzersiz üret. Her egzersiz başlangıçtan ileri seviyeye doğru ilerlemeli.

Her egzersiz için:
- title: Egzersiz adı
- description: Kısa açıklama (1-2 cümle)
- steps: Adım adım talimatlar (4-6 adım)
- duration: Tahmini süre
- benefits: Faydaları (3-4 madde)`,
      en: `As a diction and voice coach, create diaphragm breathing exercises. Generate 5 exercises. Each exercise should progress from beginner to advanced level.

For each exercise:
- title: Exercise name
- description: Short description (1-2 sentences)
- steps: Step-by-step instructions (4-6 steps)
- duration: Estimated duration
- benefits: Benefits (3-4 items)`,
      de: `Als Diktions- und Stimmcoach erstellen Sie Zwerchfell-Atemübungen. Generieren Sie 5 Übungen. Jede Übung sollte vom Anfänger- zum Fortgeschrittenenniveau fortschreiten.

Für jede Übung:
- title: Übungsname
- description: Kurze Beschreibung (1-2 Sätze)
- steps: Schritt-für-Schritt-Anleitung (4-6 Schritte)
- duration: Geschätzte Dauer
- benefits: Vorteile (3-4 Punkte)`,
    };

    const schema = z.object({
      exercises: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          steps: z.array(z.string()),
          duration: z.string(),
          benefits: z.array(z.string()),
        })
      ),
    });

    const result = await generateObject({
      messages: [{ role: 'user', content: prompts[language] }],
      schema,
    });

    console.log('AI generated diaphragm exercises:', result.exercises.length);
    return result.exercises;
  } catch (error) {
    console.error('Error generating diaphragm exercises, using fallback:', error);
    return getFallbackExercises(language);
  }
}

function getFallbackExercises(language: 'tr' | 'en' | 'de'): DiaphragmExercise[] {
  const fallbacks = {
    tr: [
      {
        title: 'Diyafram Nefesini Tanıma',
        description: 'Diyafram nefesinin ne olduğunu öğrenin ve doğru nefes alma tekniğini keşfedin.',
        steps: [
          'Sırt üstü yatın ve bir elinizi göğsünüze, diğerini karnınıza koyun',
          'Burnunuzdan derin bir nefes alın',
          'Karnınızdaki elinizin yukarı kalktığını, göğsünüzdeki elinizin hareketsiz kaldığını hissedin',
          'Ağzınızdan yavaşça nefes verin',
          'Bu hareketi 5-10 kez tekrarlayın'
        ],
        duration: '3-5 dakika',
        benefits: [
          'Diyafram nefesini tanıma',
          'Doğru nefes alma tekniğini öğrenme',
          'Göğüs ve karın kaslarını ayırt etme',
          'Nefes farkındalığını artırma'
        ]
      },
      {
        title: 'Kontrollü Diyafram Nefesi',
        description: 'Nefes kontrolünü geliştirin ve daha uzun süre nefes tutmayı öğrenin.',
        steps: [
          'Rahat bir pozisyonda oturun',
          '4 sayarken burnunuzdan nefes alın',
          '4 sayarken nefesinizi tutun',
          '6 sayarken ağzınızdan yavaşça nefes verin',
          'Bu döngüyü 8-10 kez tekrarlayın',
          'Her hafta sayıları artırın (5-5-7, 6-6-8, vb.)'
        ],
        duration: '5-7 dakika',
        benefits: [
          'Nefes kontrolünü geliştirme',
          'Akciğer kapasitesini artırma',
          'Stres ve gerginliği azaltma',
          'Konuşma için daha fazla hava rezervi'
        ]
      },
      {
        title: 'Diyafram ile Ses Üretimi',
        description: 'Diyafram nefesi kullanarak güçlü ve net ses üretmeyi öğrenin.',
        steps: [
          'Ayakta durun, omuzlarınız gevşek',
          'Diyafram nefesi ile derin bir nefes alın',
          '"Ah" sesi çıkararak yavaşça nefes verin',
          'Sesinizin karnınızdan geldiğini hissedin',
          'Farklı tonlarda (alçak, orta, yüksek) tekrarlayın',
          'Her ton için 3-5 tekrar yapın'
        ],
        duration: '5-8 dakika',
        benefits: [
          'Ses gücünü artırma',
          'Ses kalitesini iyileştirme',
          'Boğaz yorgunluğunu azaltma',
          'Daha net artikülasyon'
        ]
      },
      {
        title: 'Uzun Cümleler için Diyafram',
        description: 'Uzun cümleleri tek nefeste rahatça söyleyebilmek için diyafram kullanımını pratik edin.',
        steps: [
          'Bir paragraf seçin',
          'Diyafram nefesi ile derin bir nefes alın',
          'Bir cümleyi tek nefeste okumaya çalışın',
          'Nefes bittiğinde durun, tekrar diyafram nefesi alın',
          'Cümle uzunluğunu kademeli olarak artırın',
          'Her gün 10-15 dakika pratik yapın'
        ],
        duration: '10-15 dakika',
        benefits: [
          'Uzun cümleleri rahatça söyleme',
          'Konuşma akıcılığını artırma',
          'Nefes kesintilerini azaltma',
          'Profesyonel sunum becerileri'
        ]
      },
      {
        title: 'İleri Seviye Diyafram Teknikleri',
        description: 'Profesyonel seviye diyafram kontrolü ve ses yönetimi teknikleri.',
        steps: [
          'Farklı hızlarda konuşma pratiği yapın (yavaş, normal, hızlı)',
          'Her hızda diyafram nefesini koruyun',
          'Ses tonunuzu değiştirirken diyafram kontrolünü sürdürün',
          'Uzun metinleri okurken nefes noktalarını planlayın',
          'Farklı duygusal tonlarda (neşeli, ciddi, heyecanlı) pratik yapın',
          'Günlük 15-20 dakika çeşitli metinlerle çalışın'
        ],
        duration: '15-20 dakika',
        benefits: [
          'Profesyonel seviye ses kontrolü',
          'Her durumda diyafram kullanımı',
          'Yorulmadan uzun süre konuşma',
          'Sahne ve sunum performansı'
        ]
      }
    ],
    en: [
      {
        title: 'Recognizing Diaphragm Breathing',
        description: 'Learn what diaphragmatic breathing is and discover the correct breathing technique.',
        steps: [
          'Lie on your back and place one hand on your chest, the other on your stomach',
          'Take a deep breath through your nose',
          'Feel the hand on your stomach rise while the hand on your chest remains still',
          'Exhale slowly through your mouth',
          'Repeat this movement 5-10 times'
        ],
        duration: '3-5 minutes',
        benefits: [
          'Recognizing diaphragmatic breathing',
          'Learning correct breathing technique',
          'Distinguishing chest and abdominal muscles',
          'Increasing breath awareness'
        ]
      },
      {
        title: 'Controlled Diaphragm Breathing',
        description: 'Improve breath control and learn to hold your breath longer.',
        steps: [
          'Sit in a comfortable position',
          'Breathe in through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly through your mouth for 6 counts',
          'Repeat this cycle 8-10 times',
          'Increase counts each week (5-5-7, 6-6-8, etc.)'
        ],
        duration: '5-7 minutes',
        benefits: [
          'Improving breath control',
          'Increasing lung capacity',
          'Reducing stress and tension',
          'More air reserve for speaking'
        ]
      },
      {
        title: 'Voice Production with Diaphragm',
        description: 'Learn to produce strong and clear voice using diaphragmatic breathing.',
        steps: [
          'Stand with relaxed shoulders',
          'Take a deep breath with diaphragmatic breathing',
          'Exhale slowly while making an "Ah" sound',
          'Feel your voice coming from your stomach',
          'Repeat at different pitches (low, medium, high)',
          'Do 3-5 repetitions for each pitch'
        ],
        duration: '5-8 minutes',
        benefits: [
          'Increasing voice power',
          'Improving voice quality',
          'Reducing throat fatigue',
          'Clearer articulation'
        ]
      },
      {
        title: 'Diaphragm for Long Sentences',
        description: 'Practice using the diaphragm to comfortably say long sentences in one breath.',
        steps: [
          'Choose a paragraph',
          'Take a deep breath with diaphragmatic breathing',
          'Try to read one sentence in a single breath',
          'When breath runs out, stop and take another diaphragm breath',
          'Gradually increase sentence length',
          'Practice 10-15 minutes daily'
        ],
        duration: '10-15 minutes',
        benefits: [
          'Comfortably saying long sentences',
          'Increasing speech fluency',
          'Reducing breath interruptions',
          'Professional presentation skills'
        ]
      },
      {
        title: 'Advanced Diaphragm Techniques',
        description: 'Professional-level diaphragm control and voice management techniques.',
        steps: [
          'Practice speaking at different speeds (slow, normal, fast)',
          'Maintain diaphragmatic breathing at each speed',
          'Sustain diaphragm control while changing voice tone',
          'Plan breath points when reading long texts',
          'Practice with different emotional tones (cheerful, serious, excited)',
          'Work with various texts for 15-20 minutes daily'
        ],
        duration: '15-20 minutes',
        benefits: [
          'Professional-level voice control',
          'Using diaphragm in all situations',
          'Speaking for long periods without fatigue',
          'Stage and presentation performance'
        ]
      }
    ],
    de: [
      {
        title: 'Zwerchfellatmung erkennen',
        description: 'Lernen Sie, was Zwerchfellatmung ist und entdecken Sie die richtige Atemtechnik.',
        steps: [
          'Legen Sie sich auf den Rücken und legen Sie eine Hand auf Ihre Brust, die andere auf Ihren Bauch',
          'Atmen Sie tief durch die Nase ein',
          'Spüren Sie, wie sich die Hand auf Ihrem Bauch hebt, während die Hand auf Ihrer Brust still bleibt',
          'Atmen Sie langsam durch den Mund aus',
          'Wiederholen Sie diese Bewegung 5-10 Mal'
        ],
        duration: '3-5 Minuten',
        benefits: [
          'Zwerchfellatmung erkennen',
          'Richtige Atemtechnik lernen',
          'Brust- und Bauchmuskeln unterscheiden',
          'Atembewusstsein erhöhen'
        ]
      },
      {
        title: 'Kontrollierte Zwerchfellatmung',
        description: 'Verbessern Sie die Atemkontrolle und lernen Sie, länger den Atem anzuhalten.',
        steps: [
          'Setzen Sie sich in eine bequeme Position',
          'Atmen Sie 4 Zählzeiten durch die Nase ein',
          'Halten Sie den Atem 4 Zählzeiten an',
          'Atmen Sie 6 Zählzeiten langsam durch den Mund aus',
          'Wiederholen Sie diesen Zyklus 8-10 Mal',
          'Erhöhen Sie die Zählzeiten jede Woche (5-5-7, 6-6-8, usw.)'
        ],
        duration: '5-7 Minuten',
        benefits: [
          'Atemkontrolle verbessern',
          'Lungenkapazität erhöhen',
          'Stress und Spannung reduzieren',
          'Mehr Luftreserve zum Sprechen'
        ]
      },
      {
        title: 'Stimmproduktion mit Zwerchfell',
        description: 'Lernen Sie, mit Zwerchfellatmung eine starke und klare Stimme zu erzeugen.',
        steps: [
          'Stehen Sie mit entspannten Schultern',
          'Atmen Sie tief mit Zwerchfellatmung ein',
          'Atmen Sie langsam aus, während Sie ein "Ah" machen',
          'Spüren Sie, wie Ihre Stimme aus Ihrem Bauch kommt',
          'Wiederholen Sie in verschiedenen Tonhöhen (tief, mittel, hoch)',
          'Machen Sie 3-5 Wiederholungen für jede Tonhöhe'
        ],
        duration: '5-8 Minuten',
        benefits: [
          'Stimmkraft erhöhen',
          'Stimmqualität verbessern',
          'Halsmüdigkeit reduzieren',
          'Klarere Artikulation'
        ]
      },
      {
        title: 'Zwerchfell für lange Sätze',
        description: 'Üben Sie, das Zwerchfell zu verwenden, um lange Sätze bequem in einem Atemzug zu sagen.',
        steps: [
          'Wählen Sie einen Absatz',
          'Atmen Sie tief mit Zwerchfellatmung ein',
          'Versuchen Sie, einen Satz in einem einzigen Atemzug zu lesen',
          'Wenn der Atem ausgeht, stoppen Sie und nehmen Sie einen weiteren Zwerchfellatemzug',
          'Erhöhen Sie die Satzlänge schrittweise',
          'Üben Sie täglich 10-15 Minuten'
        ],
        duration: '10-15 Minuten',
        benefits: [
          'Lange Sätze bequem sagen',
          'Sprachflüssigkeit erhöhen',
          'Atemunterbrechungen reduzieren',
          'Professionelle Präsentationsfähigkeiten'
        ]
      },
      {
        title: 'Fortgeschrittene Zwerchfelltechniken',
        description: 'Professionelle Zwerchfellkontrolle und Stimmmanagement-Techniken.',
        steps: [
          'Üben Sie das Sprechen in verschiedenen Geschwindigkeiten (langsam, normal, schnell)',
          'Behalten Sie die Zwerchfellatmung bei jeder Geschwindigkeit bei',
          'Halten Sie die Zwerchfellkontrolle aufrecht, während Sie den Stimmton ändern',
          'Planen Sie Atempunkte beim Lesen langer Texte',
          'Üben Sie mit verschiedenen emotionalen Tönen (fröhlich, ernst, aufgeregt)',
          'Arbeiten Sie täglich 15-20 Minuten mit verschiedenen Texten'
        ],
        duration: '15-20 Minuten',
        benefits: [
          'Professionelle Stimmkontrolle',
          'Zwerchfell in allen Situationen verwenden',
          'Lange sprechen ohne Ermüdung',
          'Bühnen- und Präsentationsleistung'
        ]
      }
    ]
  };

  return fallbacks[language];
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
    backgroundColor: '#D1FAE5',
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
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  exerciseDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 16,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepsLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  benefitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
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
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  speakButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  bottomActions: {
    gap: 12,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  resetButton: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
});
