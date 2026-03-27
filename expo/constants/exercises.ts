import { Language } from '@/contexts/AppContext';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Exercise {
  id: string;
  text: string;
  syllables: string[];
  targetPhoneme: string;
  difficulty: DifficultyLevel;
  category: string;
}

const CATEGORY_TRANSLATIONS = {
  tr: {
    vowels: 'Sesli Harfler',
    consonants: 'Sessiz Harfler',
    words: 'Kelimeler',
    sentences: 'Cümleler',
    'tongue-twisters': 'Tekerleme Çalışması',
    listening: 'Kulağını Geliştir',
    articulation: 'Artikülasyonla Başla',
  },
  en: {
    vowels: 'Vowels',
    consonants: 'Consonants',
    words: 'Words',
    sentences: 'Sentences',
    'tongue-twisters': 'Tongue Twisters',
    listening: 'Improve Your Ear',
    articulation: 'Start with Articulation',
  },
  de: {
    vowels: 'Vokale',
    consonants: 'Konsonanten',
    words: 'Wörter',
    sentences: 'Sätze',
    'tongue-twisters': 'Zungenbrecher',
    listening: 'Verbessern Sie Ihr Gehör',
    articulation: 'Mit Artikulation beginnen',
  },
};

export function getExerciseCategories(language: Language = 'tr') {
  const translations = CATEGORY_TRANSLATIONS[language];
  return [
    { id: 'vowels', name: translations.vowels, icon: 'volume-2' },
    { id: 'consonants', name: translations.consonants, icon: 'mic' },
    { id: 'words', name: translations.words, icon: 'type' },
    { id: 'sentences', name: translations.sentences, icon: 'message-square' },
    { id: 'tongue-twisters', name: translations['tongue-twisters'], icon: 'repeat' },
    { id: 'listening', name: translations.listening, icon: 'headphones' },
    { id: 'articulation', name: translations.articulation, icon: 'mic-2' },
  ];
}

export const EXERCISE_CATEGORIES = getExerciseCategories('tr');

export const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: '1',
    text: 'Merhaba',
    syllables: ['Mer', 'ha', 'ba'],
    targetPhoneme: '/h/',
    difficulty: 'easy',
    category: 'words',
  },
  {
    id: '2',
    text: 'Artikülasyon',
    syllables: ['Ar', 'ti', 'kü', 'las', 'yon'],
    targetPhoneme: '/r/',
    difficulty: 'medium',
    category: 'words',
  },
  {
    id: '3',
    text: 'Konuşma sanatı pratik gerektirir',
    syllables: ['Ko', 'nuş', 'ma', 'sa', 'na', 'tı', 'pra', 'tik', 'ge', 'rek', 'ti', 'rir'],
    targetPhoneme: '/k/',
    difficulty: 'hard',
    category: 'sentences',
  },
  {
    id: '4',
    text: 'Güzel',
    syllables: ['Gü', 'zel'],
    targetPhoneme: '/z/',
    difficulty: 'easy',
    category: 'words',
  },
  {
    id: '5',
    text: 'Profesyonel',
    syllables: ['Pro', 'fes', 'yo', 'nel'],
    targetPhoneme: '/f/',
    difficulty: 'medium',
    category: 'words',
  },
];

const DURATION_TRANSLATIONS = {
  tr: {
    quick: 'Hızlı',
    standard: 'Standart',
    extended: 'Uzun',
  },
  en: {
    quick: 'Quick',
    standard: 'Standard',
    extended: 'Extended',
  },
  de: {
    quick: 'Schnell',
    standard: 'Standard',
    extended: 'Erweitert',
  },
};

export function getSessionDurations(language: Language = 'tr') {
  const translations = DURATION_TRANSLATIONS[language];
  return [
    { id: '3', label: translations.quick, duration: 3, icon: 'zap' },
    { id: '7', label: translations.standard, duration: 7, icon: 'activity' },
    { id: '15', label: translations.extended, duration: 15, icon: 'target' },
  ];
}

export const SESSION_DURATIONS = getSessionDurations('tr');

export function generateExercise(difficulty: DifficultyLevel, category: string): Exercise {
  const filtered = SAMPLE_EXERCISES.filter(
    (ex) => ex.difficulty === difficulty && ex.category === category
  );
  
  if (filtered.length === 0) {
    return SAMPLE_EXERCISES[0];
  }
  
  return filtered[Math.floor(Math.random() * filtered.length)];
}
