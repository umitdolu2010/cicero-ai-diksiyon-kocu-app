import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface DailyGoal {
  date: string;
  targetMinutes: number;
  completedMinutes: number;
  exercisesCompleted: number;
}

export interface RecordingHistory {
  id: string;
  date: string;
  exerciseId: string;
  exerciseText: string;
  duration: number;
  score: number;
  audioUri?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type Language = 'tr' | 'en' | 'de';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  goal: 'beginner' | 'intermediate' | 'advanced';
  dailyTargetMinutes: number;
  reminderEnabled: boolean;
  reminderTime: string;
  language: Language;
  theme: Theme;
}

export interface AppState {
  profile: UserProfile;
  dailyGoal: DailyGoal;
  history: RecordingHistory[];
  weeklyProgress: number[];
  isLoading: boolean;
  language: Language;
  theme: Theme;
  
  updateProfile: (profile: Partial<UserProfile>) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  addRecording: (recording: Omit<RecordingHistory, 'id' | 'date'>) => void;
  updateDailyProgress: (minutes: number) => void;
  getTodayProgress: () => number;
  getWeeklyStats: () => { total: number; average: number; streak: number };
  getHistoryByCategory: (category: string) => RecordingHistory[];
  getCategoryProgress: (category: string) => { completed: number; averageScore: number; lastExercise?: RecordingHistory };
}

const STORAGE_KEYS = {
  PROFILE: '@cicero_profile',
  HISTORY: '@cicero_history',
  DAILY_GOAL: '@cicero_daily_goal',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Kullanıcı',
  goal: 'beginner',
  dailyTargetMinutes: 7,
  reminderEnabled: true,
  reminderTime: '09:00',
  language: 'tr',
  theme: 'light',
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export const [AppProvider, useApp] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [history, setHistory] = useState<RecordingHistory[]>([]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({
    date: getTodayString(),
    targetMinutes: 7,
    completedMinutes: 0,
    exercisesCompleted: 0,
  });
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('tr');
  const [theme, setThemeState] = useState<Theme>('light');

  const loadData = useCallback(async () => {
    try {
      const [profileData, historyData, goalData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL),
      ]);

      if (profileData) {
        const parsedProfile = JSON.parse(profileData);
        setProfile(parsedProfile);
        if (parsedProfile.language) {
          setLanguageState(parsedProfile.language);
        }
        if (parsedProfile.theme) {
          setThemeState(parsedProfile.theme);
        }
      }

      if (historyData) {
        setHistory(JSON.parse(historyData));
      }

      if (goalData) {
        const parsedGoal = JSON.parse(goalData);
        if (parsedGoal.date === getTodayString()) {
          setDailyGoal(parsedGoal);
        } else {
          setDailyGoal({
            date: getTodayString(),
            targetMinutes: profile.dailyTargetMinutes,
            completedMinutes: 0,
            exercisesCompleted: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile.dailyTargetMinutes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)),
        AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history)),
        AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(dailyGoal)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [profile, history, dailyGoal]);

  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [isLoading, saveData]);

  const calculateWeeklyProgress = useCallback(() => {
    const today = new Date();
    const weekData = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateString = date.toISOString().split('T')[0];

      const dayRecordings = history.filter((r) => r.date === dateString);
      const totalMinutes = dayRecordings.reduce((sum, r) => sum + r.duration / 60, 0);
      weekData[i] = Math.round(totalMinutes);
    }

    setWeeklyProgress(weekData);
  }, [history]);

  useEffect(() => {
    calculateWeeklyProgress();
  }, [calculateWeeklyProgress]);



  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const newProfile = { ...prev, ...updates };
      
      if (updates.dailyTargetMinutes !== undefined && updates.dailyTargetMinutes !== null) {
        setDailyGoal((prevGoal) => ({
          ...prevGoal,
          targetMinutes: updates.dailyTargetMinutes!,
        }));
      }
      
      if (updates.language) {
        setLanguageState(updates.language);
      }
      
      if (updates.theme) {
        setThemeState(updates.theme);
      }
      
      return newProfile;
    });
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    updateProfile({ language: newLanguage });
  }, [updateProfile]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    updateProfile({ theme: newTheme });
  }, [updateProfile]);

  const updateDailyProgress = useCallback((minutes: number) => {
    setDailyGoal((prev) => {
      if (prev.date !== getTodayString()) {
        return {
          date: getTodayString(),
          targetMinutes: profile.dailyTargetMinutes,
          completedMinutes: minutes,
          exercisesCompleted: 1,
        };
      }

      return {
        ...prev,
        completedMinutes: prev.completedMinutes + minutes,
        exercisesCompleted: prev.exercisesCompleted + 1,
      };
    });
  }, [profile.dailyTargetMinutes]);

  const addRecording = useCallback((recording: Omit<RecordingHistory, 'id' | 'date'>) => {
    const newRecording: RecordingHistory = {
      ...recording,
      id: Date.now().toString(),
      date: getTodayString(),
    };

    setHistory((prev) => [newRecording, ...prev]);

    const minutes = recording.duration / 60;
    updateDailyProgress(minutes);
  }, [updateDailyProgress]);

  const getTodayProgress = useCallback((): number => {
    if (dailyGoal.date !== getTodayString()) {
      return 0;
    }
    return Math.min((dailyGoal.completedMinutes / dailyGoal.targetMinutes) * 100, 100);
  }, [dailyGoal]);

  const getWeeklyStats = useCallback(() => {
    const total = weeklyProgress.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / 7);
    
    let streak = 0;
    for (let i = weeklyProgress.length - 1; i >= 0; i--) {
      if (weeklyProgress[i] > 0) {
        streak++;
      } else {
        break;
      }
    }

    return { total, average, streak };
  }, [weeklyProgress]);

  const getHistoryByCategory = useCallback((category: string) => {
    return history.filter((r) => r.category === category);
  }, [history]);

  const getCategoryProgress = useCallback((category: string) => {
    const categoryHistory = history.filter((r) => r.category === category);
    
    if (categoryHistory.length === 0) {
      return { completed: 0, averageScore: 0 };
    }

    const totalScore = categoryHistory.reduce((sum, r) => sum + r.score, 0);
    const averageScore = Math.round(totalScore / categoryHistory.length);
    const lastExercise = categoryHistory[0];

    return {
      completed: categoryHistory.length,
      averageScore,
      lastExercise,
    };
  }, [history]);

  return useMemo(() => ({
    profile,
    dailyGoal,
    history,
    weeklyProgress,
    isLoading,
    language,
    theme,
    updateProfile,
    setLanguage,
    setTheme,
    addRecording,
    updateDailyProgress,
    getTodayProgress,
    getWeeklyStats,
    getHistoryByCategory,
    getCategoryProgress,
  }), [profile, dailyGoal, history, weeklyProgress, isLoading, language, theme, updateProfile, setLanguage, setTheme, addRecording, updateDailyProgress, getTodayProgress, getWeeklyStats, getHistoryByCategory, getCategoryProgress]);
});
