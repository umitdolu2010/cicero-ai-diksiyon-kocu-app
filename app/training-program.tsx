import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, CheckCircle, Circle, Play, Sparkles } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/constants/translations';
import * as Speech from 'expo-speech';

interface SubSection {
  title: string;
  description: string;
  duration: string;
}

interface DayPlan {
  day: number;
  title: string;
  duration: string;
  subSections: SubSection[];
  completed: boolean;
}

interface WeekPlan {
  week: number;
  theme: string;
  days: DayPlan[];
}

export default function TrainingProgramScreen() {
  const { profile, language, theme } = useApp();
  const t = useTranslation(language);
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(Colors);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<WeekPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    generateWeeklyPlan();
  }, [profile.goal]);

  const generateWeeklyPlan = async () => {
    setIsGenerating(true);
    
    try {
      const schema = z.object({
        week: z.number(),
        theme: z.string(),
        days: z.array(
          z.object({
            day: z.number(),
            title: z.string(),
            duration: z.string(),
            subSections: z.array(
              z.object({
                title: z.string(),
                description: z.string(),
                duration: z.string(),
              })
            ),
          })
        ),
      });

      const levelDescriptions = {
        tr: {
          beginner: {
            level: 'başlangıç',
            duration: '7 dakika',
            focus: 'Temel nefes kontrolü, basit artikülasyon egzersizleri, temel sesler ve kolay tekerlemeler',
          },
          intermediate: {
            level: 'orta',
            duration: '15 dakika',
            focus: 'İkili-üçlü hece kombinasyonları, tonlama çalışmaları, hızlı okuma, karmaşık tekerlemeler ve ses analizi',
          },
          advanced: {
            level: 'ileri',
            duration: '30 dakika',
            focus: 'Profesyonel sunum teknikleri, sahne konuşması, doğaçlama, ileri tonlama ve detaylı ses analizi',
          },
        },
        en: {
          beginner: {
            level: 'beginner',
            duration: '7 minutes',
            focus: 'Basic breath control, simple articulation exercises, basic sounds and easy tongue twisters',
          },
          intermediate: {
            level: 'intermediate',
            duration: '15 minutes',
            focus: 'Double-triple syllable combinations, intonation practice, speed reading, complex tongue twisters and sound analysis',
          },
          advanced: {
            level: 'advanced',
            duration: '30 minutes',
            focus: 'Professional presentation techniques, stage speaking, improvisation, advanced intonation and detailed sound analysis',
          },
        },
        de: {
          beginner: {
            level: 'Anfänger',
            duration: '7 Minuten',
            focus: 'Grundlegende Atemkontrolle, einfache Artikulationsübungen, Grundlaute und einfache Zungenbrecher',
          },
          intermediate: {
            level: 'Mittelstufe',
            duration: '15 Minuten',
            focus: 'Doppel-Dreifach-Silbenkombinationen, Intonationsübungen, Schnelllesen, komplexe Zungenbrecher und Klanganalyse',
          },
          advanced: {
            level: 'Fortgeschritten',
            duration: '30 Minuten',
            focus: 'Professionelle Präsentationstechniken, Bühnensprechen, Improvisation, fortgeschrittene Intonation und detaillierte Klanganalyse',
          },
        },
      };

      const currentLevel = levelDescriptions[language][profile.goal];

      const prompts = {
        tr: `Bir diksiyon koçu olarak, ${currentLevel.level} seviyesindeki bir kullanıcı için 7 günlük kişiselleştirilmiş bir eğitim programı oluştur.

Seviye: ${currentLevel.level.toUpperCase()}
Günlük süre: ${currentLevel.duration}
Odak alanları: ${currentLevel.focus}

Her gün için:
- Gün numarası (1-7)
- Günün başlığı (seviyeye uygun)
- Süre ("${currentLevel.duration}")
- Alt başlıklar (subSections): Her gün 3-5 alt başlık içermeli. Her alt başlık:
  * title: Alt başlık adı (seviyeye uygun)
  * description: Detaylı açıklama (2-3 cümle, nasıl yapılacağı, seviyeye göre zorluk)
  * duration: Süre (toplam ${currentLevel.duration} olacak şekilde dağıt)`,
        en: `As a diction coach, create a personalized 7-day training program for a user at ${currentLevel.level} level.

Level: ${currentLevel.level.toUpperCase()}
Daily duration: ${currentLevel.duration}
Focus areas: ${currentLevel.focus}

For each day:
- Day number (1-7)
- Day title (appropriate for level)
- Duration ("${currentLevel.duration}")
- Subsections (subSections): Each day should have 3-5 subsections. Each subsection:
  * title: Subsection name (appropriate for level)
  * description: Detailed explanation (2-3 sentences, how to do it, difficulty according to level)
  * duration: Duration (distribute to total ${currentLevel.duration})`,
        de: `Als Diktionscoach erstellen Sie ein personalisiertes 7-Tage-Trainingsprogramm für einen Benutzer auf ${currentLevel.level}-Niveau.

Niveau: ${currentLevel.level.toUpperCase()}
Tägliche Dauer: ${currentLevel.duration}
Schwerpunktbereiche: ${currentLevel.focus}

Für jeden Tag:
- Tagnummer (1-7)
- Tagestitel (angemessen für Niveau)
- Dauer ("${currentLevel.duration}")
- Unterabschnitte (subSections): Jeder Tag sollte 3-5 Unterabschnitte haben. Jeder Unterabschnitt:
  * title: Unterabschnittsname (angemessen für Niveau)
  * description: Detaillierte Erklärung (2-3 Sätze, wie man es macht, Schwierigkeit je nach Niveau)
  * duration: Dauer (verteilen auf insgesamt ${currentLevel.duration})`,
      };

      const prompt = prompts[language];

      const plan = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema,
      });
      
      console.log('Generated plan:', plan);
      
      const planWithCompletion = {
        ...plan,
        days: plan.days.map((day) => ({ ...day, completed: false })),
      };
      setWeeklyPlan(planWithCompletion);
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      const levelDescriptions = {
        beginner: {
          level: 'başlangıç',
          duration: '7 dakika',
          theme: 'Diksiyon Temelleri',
        },
        intermediate: {
          level: 'orta',
          duration: '15 dakika',
          theme: 'İleri Artikülasyon ve Tonlama',
        },
        advanced: {
          level: 'ileri',
          duration: '30 dakika',
          theme: 'Profesyonel Sunum ve Sahne Konuşması',
        },
      };

      const currentLevel = levelDescriptions[profile.goal];
      
      const fallbackPlan: WeekPlan = {
        week: 1,
        theme: currentLevel.theme,
        days: [
          {
            day: 1,
            title: 'Nefes Kontrolü Temelleri',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Diyafram Nefesi',
                description: 'Sırtüstü yatın, bir elinizi göğsünüze diğerini karnınıza koyun. Nefes alırken karnınızın şiştiğinden emin olun.',
                duration: '2 dakika',
              },
              {
                title: 'Uzun Nefes Tutma',
                description: '4 saniye burnunuzdan nefes alın, 4 saniye tutun, 6 saniye ağzınızdan verin. 5 kez tekrarlayın.',
                duration: '2 dakika',
              },
              {
                title: 'Kontrollü Nefes Verme',
                description: 'Derin nefes alın ve "ssss" sesi çıkararak yavaşça verin. Mümkün olduğunca uzun süre devam edin.',
                duration: '3 dakika',
              },
            ],
          },
          {
            day: 2,
            title: 'Artikülasyon Temelleri',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Dudak Egzersizleri',
                description: 'Dudaklarınızı öne doğru uzatın ve geri çekin. "O-U-İ-E-A" seslerini abartılı şekilde çıkarın.',
                duration: '2 dakika',
              },
              {
                title: 'Dil Egzersizleri',
                description: 'Dilinizi damağınıza değdirin ve çekin. Sağa sola hareket ettirin. Dışarı çıkarıp içeri alın.',
                duration: '2 dakika',
              },
              {
                title: 'Çene Gevşetme',
                description: 'Çenenizi yavaşça aşağı yukarı hareket ettirin. Dairesel hareketler yapın. Gerginliği hissedin ve bırakın.',
                duration: '3 dakika',
              },
            ],
          },
          {
            day: 3,
            title: 'Ses Tonu Çalışması',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Ses Perdesi Değiştirme',
                description: 'Aynı cümleyi farklı ses perdeleriyle söyleyin. Alçak, orta ve yüksek tonları deneyin.',
                duration: '2 dakika',
              },
              {
                title: 'Vurgu Çalışması',
                description: 'Bir cümledeki farklı kelimeleri vurgulayarak okuyun. Her kelimeyi vurguladığınızda anlamın nasıl değiştiğini gözlemleyin.',
                duration: '3 dakika',
              },
              {
                title: 'Tonlama Pratigi',
                description: 'Soru, ünlem ve düz cümleleri doğru tonlamayla okuyun. Duygusal ifadeleri yansıtın.',
                duration: '2 dakika',
              },
            ],
          },
          {
            day: 4,
            title: 'Hız ve Ritim',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Yavaş Okuma',
                description: 'Bir paragrafı çok yavaş okuyun. Her heceyi net şekilde telaffuz edin.',
                duration: '2 dakika',
              },
              {
                title: 'Hızlı Okuma',
                description: 'Aynı paragrafı hızlı okuyun ama netliği kaybetmeyin. Dengeli bir hız bulun.',
                duration: '2 dakika',
              },
              {
                title: 'Ritim Çalışması',
                description: 'Metronome eşliğinde okuyun. Düzenli bir ritim yakalayın ve koruyun.',
                duration: '3 dakika',
              },
            ],
          },
          {
            day: 5,
            title: 'Tekerleme Çalışması',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Kolay Tekerlemeler',
                description: 'Basit tekerlemeleri yavaş yavaş okuyun. "Şu köşe yaz köşesi, şu köşe kış köşesi" gibi.',
                duration: '2 dakika',
              },
              {
                title: 'Orta Zorluk',
                description: 'Daha karmaşık tekerlemeleri deneyin. Hızınızı kademeli olarak artırın.',
                duration: '3 dakika',
              },
              {
                title: 'Zor Tekerlemeler',
                description: 'En zor tekerlemeleri çalışın. Hata yaptığınızda yavaşlayın ve tekrar deneyin.',
                duration: '2 dakika',
              },
            ],
          },
          {
            day: 6,
            title: 'Metin Okuma',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Haber Metni Okuma',
                description: 'Bir haber metnini profesyonel bir spiker gibi okuyun. Net, tarafsız ve anlaşılır olun.',
                duration: '3 dakika',
              },
              {
                title: 'Hikaye Anlatımı',
                description: 'Kısa bir hikayeyi duygusal ifadelerle okuyun. Karakterlere ses verin.',
                duration: '2 dakika',
              },
              {
                title: 'Şiir Okuma',
                description: 'Bir şiiri ritim ve duygusunu koruyarak okuyun. Duraklamaları doğru yapın.',
                duration: '2 dakika',
              },
            ],
          },
          {
            day: 7,
            title: 'Genel Tekrar ve Değerlendirme',
            duration: currentLevel.duration,
            completed: false,
            subSections: [
              {
                title: 'Haftalık Özet',
                description: 'Bu hafta öğrendiğiniz tüm teknikleri gözden geçirin. Hangi alanlarda ilerlediğinizi değerlendirin.',
                duration: '2 dakika',
              },
              {
                title: 'Kayıt ve Dinleme',
                description: 'Kendinizi okurken kaydedin ve dinleyin. Güçlü ve zayıf yönlerinizi belirleyin.',
                duration: '3 dakika',
              },
              {
                title: 'Gelecek Hafta Hedefleri',
                description: 'Gelişmek istediğiniz alanları belirleyin ve gelecek hafta için hedefler koyun.',
                duration: '2 dakika',
              },
            ],
          },
        ],
      };
      
      setWeeklyPlan(fallbackPlan);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDayCompletion = (dayIndex: number) => {
    if (!weeklyPlan) return;
    
    const updatedDays = [...weeklyPlan.days];
    updatedDays[dayIndex].completed = !updatedDays[dayIndex].completed;
    
    setWeeklyPlan({
      ...weeklyPlan,
      days: updatedDays,
    });
  };

  const startDayExercise = (day: DayPlan) => {
    setSelectedDay(day);
  };

  const speakText = async (text: string) => {
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
      utterance.rate = 0.85;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      try {
        await Speech.speak(text, {
          language: languageMap[language],
          rate: 0.85,
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (error) {
        console.error('Speech error:', error);
        setIsSpeaking(false);
      }
    }
  };

  useEffect(() => {
    if (selectedDay) {
      const userName = profile.name || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
      
      const tipsText = language === 'tr' 
        ? `Merhaba ${userName}! Bugünkü egzersizimiz: ${selectedDay.title}. Süre: ${selectedDay.duration}.`
        : language === 'en'
        ? `Hello ${userName}! Today's exercise: ${selectedDay.title}. Duration: ${selectedDay.duration}.`
        : `Hallo ${userName}! Heutige Übung: ${selectedDay.title}. Dauer: ${selectedDay.duration}.`;
      
      const subsectionsText = selectedDay.subSections.map((sub, index) => {
        const prefix = language === 'tr' 
          ? `${index + 1}. ${sub.title}. ${sub.duration}. `
          : language === 'en'
          ? `${index + 1}. ${sub.title}. ${sub.duration}. `
          : `${index + 1}. ${sub.title}. ${sub.duration}. `;
        return prefix + sub.description;
      }).join(' ');
      
      const howToText = language === 'tr'
        ? ' Nasıl çalışılır: Her alt başlığı sırayla takip edin. Belirtilen sürelere uyun. Düzenli nefes alın ve kaslarınızı gevşetin.'
        : language === 'en'
        ? ' How to practice: Follow each subsection in order. Stick to the specified durations. Breathe regularly and relax your muscles.'
        : ' Wie man übt: Folgen Sie jedem Unterabschnitt der Reihe nach. Halten Sie sich an die angegebenen Dauern. Atmen Sie regelmäßig und entspannen Sie Ihre Muskeln.';
      
      const fullText = tipsText + ' ' + subsectionsText + howToText;
      
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
  }, [selectedDay]);

  if (isGenerating) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t.trainingProgram.title,
            headerStyle: { backgroundColor: '#8B5CF6' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t.trainingProgram.generating}</Text>
        </View>
      </View>
    );
  }

  if (selectedDay) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: selectedDay.title,
            headerStyle: { backgroundColor: '#8B5CF6' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.dayDetailCard}>
            <View style={styles.dayDetailHeader}>
              <Text style={styles.dayDetailTitle}>{selectedDay.title}</Text>
              <Text style={styles.dayDetailDuration}>{selectedDay.duration}</Text>
            </View>

            <View style={styles.subSectionsList}>
              {selectedDay.subSections.map((subSection, index) => (
                <View key={index} style={styles.subSectionCard}>
                  <View style={styles.subSectionHeader}>
                    <View style={styles.subSectionNumber}>
                      <Text style={styles.subSectionNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.subSectionHeaderText}>
                      <Text style={styles.subSectionTitle}>{subSection.title}</Text>
                      <Text style={styles.subSectionDuration}>{subSection.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.subSectionDescription}>{subSection.description}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => {
                console.log('Starting exercise:', selectedDay.title);
              }}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>{t.trainingProgram.startExercise}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedDay(null)}
            >
              <Text style={styles.backButtonText}>{t.trainingProgram.backToProgram}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t.trainingProgram.title,
          headerStyle: { backgroundColor: '#8B5CF6' },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {weeklyPlan && (
          <>
            <View style={styles.headerCard}>
              <View style={styles.headerIcon}>
                <Sparkles size={32} color="#8B5CF6" />
              </View>
              <Text style={styles.headerTitle}>{t.trainingProgram.week} {weeklyPlan.week}</Text>
              <Text style={styles.headerTheme}>{weeklyPlan.theme}</Text>
              <Text style={styles.headerDescription}>
                {t.trainingProgram.aiDescription}
              </Text>
            </View>

            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>{t.trainingProgram.weeklyProgress}</Text>
              <View style={styles.progressBar}>
                {weeklyPlan.days.map((day, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressSegment,
                      day.completed && styles.progressSegmentCompleted,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.progressText}>
                {weeklyPlan.days.filter((d) => d.completed).length} / {weeklyPlan.days.length} {t.trainingProgram.daysCompleted}
              </Text>
            </View>

            <View style={styles.daysContainer}>
              <Text style={styles.sectionTitle}>{t.trainingProgram.dailyPlan}</Text>
              {weeklyPlan.days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayCard, day.completed && styles.dayCardCompleted]}
                  onPress={() => startDayExercise(day)}
                >
                  <View style={styles.dayCardLeft}>
                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleDayCompletion(index);
                      }}
                    >
                      {day.completed ? (
                        <CheckCircle size={24} color="#10B981" />
                      ) : (
                        <Circle size={24} color={Colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayNumber}>{t.trainingProgram.day} {day.day}</Text>
                      <Text style={styles.dayTitle}>{day.title}</Text>
                      <Text style={styles.dayDuration}>{day.duration}</Text>
                    </View>
                  </View>
                  <Play size={20} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.regenerateButton} onPress={generateWeeklyPlan}>
              <Sparkles size={20} color="#8B5CF6" />
              <Text style={styles.regenerateButtonText}>{t.trainingProgram.generateNew}</Text>
            </TouchableOpacity>
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
    borderWidth: 2,
    borderColor: colors.border,

  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
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
  headerTheme: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#8B5CF6',
    marginBottom: 12,
  },
  headerDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,

  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
  },
  progressSegmentCompleted: {
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  daysContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.border,

  },
  dayCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dayCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkButton: {
    padding: 4,
  },
  dayInfo: {
    flex: 1,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  dayDuration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  regenerateButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#8B5CF6',
  },
  dayDetailCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.border,

  },
  dayDetailHeader: {
    marginBottom: 24,
  },
  dayDetailTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  dayDetailDuration: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  subSectionsList: {
    gap: 16,
    marginBottom: 24,
  },
  subSectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  subSectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subSectionNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  subSectionHeaderText: {
    flex: 1,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  subSectionDuration: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  subSectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
});
