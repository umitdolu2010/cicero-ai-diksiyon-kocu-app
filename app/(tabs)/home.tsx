import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Mic,
  Target,
  BookOpen,
  Headphones,
  Calendar,
  Lightbulb,
  User,
  ChevronRight,
  MessageCircle,
  GripVertical,
  Sparkles,
  Wind,
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import TrialTimer from '@/components/TrialTimer';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useTranslation } from '@/constants/translations';
import { useTrialNotifications } from '@/hooks/useTrialNotifications';

export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, dailyGoal, getTodayProgress, getWeeklyStats, isLoading: appLoading, language, theme } = useApp();
  const t = useTranslation(language);
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  useTrialNotifications();

  const styles = React.useMemo(() => createStyles(Colors), [Colors]);

  const getSections = React.useCallback(() => [
    {
      id: 'training',
      title: t.sections.training,
      subtitle: t.sections.trainingDesc,
      icon: User,
      color: '#8B5CF6',
      route: '/training-program' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'tongue-twisters',
      title: t.sections.tongueTwisters,
      subtitle: t.sections.tongueTwistersDesc,
      icon: MessageCircle,
      color: '#06B6D4',
      route: '/tongue-twisters' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'articulation',
      title: t.sections.articulation,
      subtitle: t.sections.articulationDesc,
      icon: BookOpen,
      color: '#10B981',
      route: '/(tabs)/articulation' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'exercises',
      title: t.sections.exercises,
      subtitle: t.sections.exercisesDesc,
      icon: Target,
      color: Colors.accent,
      route: '/(tabs)/exercises' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'diaphragm',
      title: t.sections.diaphragm,
      subtitle: t.sections.diaphragmDesc,
      icon: Wind,
      color: '#10B981',
      route: '/diaphragm-training' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'listening',
      title: t.sections.listening,
      subtitle: t.sections.listeningDesc,
      icon: Headphones,
      color: '#F59E0B',
      route: '/listening-training' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'tonation',
      title: t.sections.tonation,
      subtitle: t.sections.tonationDesc,
      icon: BookOpen,
      color: '#EF4444',
      route: '/tonation-training' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'journal',
      title: t.sections.journal,
      subtitle: t.sections.journalDesc,
      icon: Calendar,
      color: '#EC4899',
      route: '/(tabs)/journal' as const,
      hasAI: false,
      isActive: true,
    },
    {
      id: 'tips',
      title: t.sections.tips,
      subtitle: t.sections.tipsDesc,
      icon: Lightbulb,
      color: '#6366F1',
      route: '/daily-tips' as const,
      hasAI: true,
      isActive: true,
    },
    {
      id: 'pronunciation',
      title: t.sections.pronunciation,
      subtitle: t.sections.pronunciationDesc,
      icon: Mic,
      color: Colors.primary,
      route: '/pronunciation-assessment' as const,
      hasAI: true,
      isActive: true,
    },
  ], [t, Colors.accent, Colors.primary]);

  const [sections, setSections] = useState(getSections());

  React.useEffect(() => {
    setSections(getSections());
  }, [language, getSections]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/welcome' as any);
    }
  }, [isAuthenticated, authLoading, router]);
  
  if (authLoading || appLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
        <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>{t.common.loading}</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  
  const todayProgress = getTodayProgress();
  const weeklyStats = getWeeklyStats();

  const getLevelInfo = () => {
    switch (profile.goal) {
      case 'beginner':
        return {
          title: t.home.beginner,
          description: t.home.beginnerDesc,
          emoji: '🌱',
        };
      case 'intermediate':
        return {
          title: t.home.intermediate,
          description: t.home.intermediateDesc,
          emoji: '💪',
        };
      case 'advanced':
        return {
          title: t.home.advanced,
          description: t.home.advancedDesc,
          emoji: '🎯',
        };
    }
  };

  const levelInfo = getLevelInfo();

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections];
    const [movedItem] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, movedItem);
    setSections(newSections);
  };

  const createPanResponder = (index: number) => {
    const pan = new Animated.ValueXY();
    
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingIndex(index);
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: 0, y: gesture.dy });
        
        const cardHeight = 80;
        const currentPosition = index * cardHeight + gesture.dy;
        const newIndex = Math.round(currentPosition / cardHeight);
        
        if (newIndex !== index && newIndex >= 0 && newIndex < sections.length) {
          moveSection(index, newIndex);
        }
      },
      onPanResponderRelease: () => {
        setDraggingIndex(null);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.gradient.start, Colors.gradient.end]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{t.home.greeting}, {profile.name}!</Text>
            <Text style={styles.subtitle}>{t.home.subtitle}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
              <View style={styles.levelTextContainer}>
                <Text style={styles.levelTitle}>{levelInfo.title}</Text>
                <Text style={styles.levelDescription}>{levelInfo.description}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Text style={styles.profileInitial}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <TrialTimer />

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.mainStatCard}>
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>{t.home.dailyGoal}</Text>
                <Text style={styles.statValue}>{Math.round(todayProgress)}%</Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{Math.round(dailyGoal.completedMinutes)}/{dailyGoal.targetMinutes}</Text>
              </View>
            </View>
          </View>

          <View style={styles.miniStatsRow}>
            <View style={styles.miniStatCard}>
              <Text style={styles.miniStatLabel}>{t.home.dayStreak}</Text>
              <Text style={styles.miniStatValue}>{weeklyStats.streak}</Text>
            </View>
            <View style={styles.miniStatCard}>
              <Text style={styles.miniStatLabel}>{t.home.weeklyMin}</Text>
              <Text style={styles.miniStatValue}>{weeklyStats.total}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.home.trainingProgram}</Text>
          <View style={styles.sectionsGrid}>
            {sections.map((section, index) => {
              const panResponder = createPanResponder(index);
              
              return (
                <View
                  key={section.id}
                  style={[
                    styles.sectionCard,
                    hoveredCard === section.id && styles.sectionCardHovered,
                    draggingIndex === index && styles.sectionCardDragging,
                    !section.isActive && styles.sectionCardInactive,
                  ]}
                >
                  <View style={styles.dragHandle} {...panResponder.panHandlers}>
                    <GripVertical size={20} color={Colors.textSecondary} />
                  </View>
                  <TouchableOpacity
                    style={styles.sectionCardTouchable}
                    onPress={() => {
                      console.log('Navigating to:', section.route);
                      router.push(section.route as any);
                    }}
                    activeOpacity={0.7}
                    {...(Platform.OS === 'web' ? {
                      onMouseEnter: () => setHoveredCard(section.id),
                      onMouseLeave: () => setHoveredCard(null),
                    } : {})}
                  >
                    <View style={styles.sectionCardContent}>
                      <View
                        style={[styles.sectionIcon, { backgroundColor: section.color }]}
                      >
                        <section.icon size={24} color="#FFFFFF" />
                      </View>
                      <View style={styles.sectionTextContainer}>
                        <View style={styles.sectionTitleRow}>
                          <Text style={styles.sectionTitle2}>{section.title}</Text>
                          {section.hasAI && (
                            <View style={styles.aiIndicator}>
                              <Sparkles size={14} color={Colors.primary} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                      </View>
                      <ChevronRight size={20} color={Colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (Colors: typeof lightTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
    gap: 10,
  },
  levelEmoji: {
    fontSize: 24,
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  levelDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    marginTop: -30,
    gap: 10,
  },
  mainStatCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLeft: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  progressCircle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  sectionsGrid: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  sectionCardHovered: {
    borderColor: Colors.borderHover,
  },
  sectionCardDragging: {
    opacity: 0.7,
    elevation: 8,
    shadowOpacity: 0.2,
  },
  dragHandle: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sectionCardTouchable: {
    flex: 1,
    padding: 16,
  },
  sectionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle2: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  aiIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionCardInactive: {
    opacity: 0.5,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
