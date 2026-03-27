import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TrendingUp, Calendar, Award, ChevronRight, Play } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { lightTheme, darkTheme } from '@/constants/colors';
import { EXERCISE_CATEGORIES } from '@/constants/exercises';
import { useTranslation } from '@/constants/translations';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 200;
const BAR_WIDTH = (CHART_WIDTH - 60) / 7;

export default function JournalScreen() {
  const { weeklyProgress, getWeeklyStats, history, getCategoryProgress, theme, language } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const t = useTranslation(language);
  const router = useRouter();
  const stats = getWeeklyStats();
  const [selectedTab, setSelectedTab] = useState<'recent' | 'categories'>('recent');

  const maxValue = Math.max(...weeklyProgress, 10);
  const days = language === 'tr' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] : language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const recentRecordings = history.slice(0, 10);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      gap: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    chartCard: {
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: Colors.text,
      marginBottom: 20,
    },
    chart: {
      height: CHART_HEIGHT,
    },
    chartBars: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: CHART_HEIGHT - 30,
      paddingHorizontal: 4,
    },
    barContainer: {
      alignItems: 'center',
      gap: 8,
    },
    barWrapper: {
      alignItems: 'center',
      gap: 4,
    },
    barValue: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: Colors.textSecondary,
    },
    bar: {
      backgroundColor: Colors.primary,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
    },
    barLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: '500' as const,
    },
    historySection: {
      marginBottom: 20,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: Colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: Colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.textSecondary,
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: Colors.text,
      marginBottom: 16,
    },
    emptyState: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    historyList: {
      gap: 12,
    },
    historyCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    historyTextContainer: {
      flex: 1,
      marginRight: 12,
    },
    historyText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.text,
      marginBottom: 4,
    },
    categoryBadge: {
      fontSize: 12,
      color: Colors.primary,
      fontWeight: '500' as const,
    },
    scoreBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    historyMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    historyDate: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    historyDuration: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    categoriesList: {
      gap: 12,
    },
    categoryCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 2,
      borderColor: Colors.border,

    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: Colors.text,
      marginBottom: 4,
    },
    categoryStats: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    categoryAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    categoryProgress: {
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      paddingTop: 12,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      color: Colors.textSecondary,
    },
    progressScore: {
      fontSize: 20,
      fontWeight: '700' as const,
    },
    lastExercise: {
      fontSize: 13,
      color: Colors.textSecondary,
      fontStyle: 'italic' as const,
    },
    noProgress: {
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 8,
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: t.sections.journal,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#FFFFFF',
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: Colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
              <TrendingUp size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>{t.home.dayStreak}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.accent }]}>
              <Calendar size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>{t.home.weeklyMin}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
              <Award size={24} color="#FFFFFF" />
              <Text style={styles.statValue}>{stats.average}</Text>
              <Text style={styles.statLabel}>{language === 'tr' ? 'Ortalama Dk' : language === 'en' ? 'Average Min' : 'Durchschn. Min'}</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{t.trainingProgram.weeklyProgress}</Text>
            <View style={styles.chart}>
              <View style={styles.chartBars}>
                {weeklyProgress.map((value, index) => {
                  const barHeight = (value / maxValue) * (CHART_HEIGHT - 40);
                  
                  return (
                    <View key={index} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValue}>{value}</Text>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(barHeight, 4),
                              width: BAR_WIDTH - 8,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{days[index]}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.historySection}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'recent' && styles.tabActive,
                ]}
                onPress={() => setSelectedTab('recent')}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'recent' && styles.tabTextActive,
                  ]}
                >
                  {language === 'tr' ? 'Son Çalışmalar' : language === 'en' ? 'Recent Exercises' : 'Letzte Übungen'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === 'categories' && styles.tabActive,
                ]}
                onPress={() => setSelectedTab('categories')}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'categories' && styles.tabTextActive,
                  ]}
                >
                  {language === 'tr' ? 'Kategoriler' : language === 'en' ? 'Categories' : 'Kategorien'}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedTab === 'recent' ? (
              recentRecordings.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>{language === 'tr' ? 'Henüz kayıt yok' : language === 'en' ? 'No recordings yet' : 'Noch keine Aufnahmen'}</Text>
                  <Text style={styles.emptySubtext}>
                    {language === 'tr' ? 'İlk egzersisinizi yapmak için Artikülasyon sayfasına gidin' : language === 'en' ? 'Go to Articulation page to do your first exercise' : 'Gehen Sie zur Artikulationsseite, um Ihre erste Übung zu machen'}
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {recentRecordings.map((recording) => (
                    <View key={recording.id} style={styles.historyCard}>
                      <View style={styles.historyHeader}>
                        <View style={styles.historyTextContainer}>
                          <Text style={styles.historyText}>{recording.exerciseText}</Text>
                          <Text style={styles.categoryBadge}>
                            {EXERCISE_CATEGORIES.find(c => c.id === recording.category)?.name || recording.category}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.scoreBadge,
                            {
                              backgroundColor:
                                recording.score >= 90
                                  ? Colors.success
                                  : recording.score >= 70
                                  ? Colors.accent
                                  : Colors.error,
                            },
                          ]}
                        >
                          <Text style={styles.scoreText}>{recording.score}</Text>
                        </View>
                      </View>
                      <View style={styles.historyMeta}>
                        <Text style={styles.historyDate}>
                          {new Date(recording.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </Text>
                        <Text style={styles.historyDuration}>
                          {(recording.duration / 1000).toFixed(1)}s
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
            ) : (
              <View style={styles.categoriesList}>
                {[
                  { id: 'tongue-twisters', name: t.sections.tongueTwisters, route: '/tongue-twisters' },
                  { id: 'listening', name: t.sections.listening, route: '/listening-training' },
                  { id: 'articulation', name: t.sections.articulation, route: '/(tabs)/articulation' },
                  { id: 'tonation', name: t.sections.tonation, route: '/tonation-training' },
                  { id: 'exercises', name: t.sections.exercises, route: '/(tabs)/exercises' },
                  { id: 'pronunciation', name: t.sections.pronunciation, route: '/pronunciation-assessment' },
                  { id: 'training', name: t.sections.training, route: '/training-program' },
                ].map((category) => {
                  const progress = getCategoryProgress(category.id);
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      onPress={() => {
                        router.push(category.route as any);
                      }}
                    >
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{category.name}</Text>
                          <Text style={styles.categoryStats}>
                            {progress.completed} {language === 'tr' ? 'egzersiz tamamlandı' : language === 'en' ? 'exercises completed' : 'Übungen abgeschlossen'}
                          </Text>
                        </View>
                        <View style={styles.categoryAction}>
                          <Play size={20} color={Colors.primary} />
                          <ChevronRight size={20} color={Colors.textSecondary} />
                        </View>
                      </View>
                      {progress.completed > 0 && (
                        <View style={styles.categoryProgress}>
                          <View style={styles.progressInfo}>
                            <Text style={styles.progressLabel}>{language === 'tr' ? 'Ortalama Skor' : language === 'en' ? 'Average Score' : 'Durchschnittliche Punktzahl'}</Text>
                            <Text
                              style={[
                                styles.progressScore,
                                {
                                  color:
                                    progress.averageScore >= 90
                                      ? Colors.success
                                      : progress.averageScore >= 70
                                      ? Colors.accent
                                      : Colors.error,
                                },
                              ]}
                            >
                              {progress.averageScore}
                            </Text>
                          </View>
                          {progress.lastExercise && (
                            <Text style={styles.lastExercise}>
                              {language === 'tr' ? 'Son' : language === 'en' ? 'Last' : 'Letzte'}: {progress.lastExercise.exerciseText.substring(0, 30)}
                              {progress.lastExercise.exerciseText.length > 30 ? '...' : ''}
                            </Text>
                          )}
                        </View>
                      )}
                      {progress.completed === 0 && (
                        <Text style={styles.noProgress}>{language === 'tr' ? 'Henüz egzersiz yapılmadı' : language === 'en' ? 'No exercises yet' : 'Noch keine Übungen'}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
