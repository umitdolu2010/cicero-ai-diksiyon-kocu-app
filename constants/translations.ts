import { Language } from '@/contexts/AppContext';

export interface Translations {
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    next: string;
    done: string;
    start: string;
    stop: string;
    retry: string;
    minutes: string;
    seconds: string;
    day: string;
    week: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    getStarted: string;
    login: string;
  };
  onboarding: {
    selectGoal: string;
    selectGoalDescription: string;
    selectLevel: string;
    selectLevelDescription: string;
    selectLanguage: string;
    selectLanguageDescription: string;
    beginner: string;
    beginnerDesc: string;
    intermediate: string;
    intermediateDesc: string;
    advanced: string;
    advancedDesc: string;
  };
  home: {
    greeting: string;
    subtitle: string;
    dailyGoal: string;
    completed: string;
    exercise: string;
    dayStreak: string;
    weeklyMin: string;
    trainingProgram: string;
    beginner: string;
    beginnerDesc: string;
    intermediate: string;
    intermediateDesc: string;
    advanced: string;
    advancedDesc: string;
  };
  profile: {
    title: string;
    editProfile: string;
    yourGoal: string;
    dailyTarget: string;
    reminders: string;
    dailyReminder: string;
    time: string;
    premium: string;
    premiumTitle: string;
    premiumDesc: string;
    tryFree: string;
    goalChangeTitle: string;
    goalChangeMessage: string;
    recommendedDaily: string;
    focusAreas: string;
    yes: string;
    successTitle: string;
    successMessage: string;
    great: string;
    language: string;
    selectLanguage: string;
    theme: string;
    appearance: string;
    light: string;
    dark: string;
    legal: string;
    privacyPolicy: string;
  };
  sections: {
    pronunciation: string;
    pronunciationDesc: string;
    training: string;
    trainingDesc: string;
    tongueTwisters: string;
    tongueTwistersDesc: string;
    articulation: string;
    articulationDesc: string;
    exercises: string;
    exercisesDesc: string;
    diaphragm: string;
    diaphragmDesc: string;
    listening: string;
    listeningDesc: string;
    tonation: string;
    tonationDesc: string;
    journal: string;
    journalDesc: string;
    tips: string;
    tipsDesc: string;
  };
  trainingProgram: {
    title: string;
    generating: string;
    week: string;
    weeklyProgress: string;
    daysCompleted: string;
    dailyPlan: string;
    day: string;
    startExercise: string;
    backToProgram: string;
    generateNew: string;
    aiDescription: string;
  };
  pronunciation: {
    title: string;
    selectLevel: string;
    easy: string;
    medium: string;
    hard: string;
    readingText: string;
    newText: string;
    generating: string;
    recording: string;
    startRecording: string;
    stopRecording: string;
    listen: string;
    recordAgain: string;
    analyzing: string;
    results: string;
    overallScore: string;
    pronunciation: string;
    fluency: string;
    pace: string;
    clarity: string;
    feedback: string;
    suggestions: string;
    backButton: string;
  };
  exercises: {
    title: string;
    daily: string;
    selectCategory: string;
    breathing: string;
    articulation: string;
    tonation: string;
    speed: string;
    generate: string;
    start: string;
  };
  tongueTwisters: {
    title: string;
    selectDifficulty: string;
    practice: string;
    syllables: string;
    listen: string;
    record: string;
  };
  listening: {
    title: string;
    description: string;
    start: string;
  };
  tonationTraining: {
    title: string;
    description: string;
    start: string;
  };
  tips: {
    title: string;
    daily: string;
    category: string;
    exercise: string;
    newTip: string;
  };
  reading: {
    title: string;
    start: string;
    syllableMode: string;
    normalMode: string;
  };
  introVideos: {
    title: string;
    welcome: string;
    description: string;
  };
  languages: {
    turkish: string;
    english: string;
    german: string;
  };
  premium: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    thankYou: string;
    freeTrial: string;
    freeTrialDesc: string;
    startTrial: string;
    referral: string;
    referralDesc: string;
    shareLink: string;
    earnDays: string;
    purchase: string;
    purchaseDesc: string;
    monthly: string;
    yearly: string;
    lifetime: string;
    save: string;
    mostPopular: string;
    features: string;
    unlimitedExercises: string;
    aiCoaching: string;
    advancedAnalytics: string;
    offlineMode: string;
    prioritySupport: string;
    noAds: string;
    continueFree: string;
    restorePurchase: string;
  };
}

const translations: Record<Language, Translations> = {
  tr: {
    common: {
      loading: 'Yükleniyor...',
      error: 'Hata',
      save: 'Kaydet',
      cancel: 'İptal',
      continue: 'Devam Et',
      back: 'Geri',
      next: 'İleri',
      done: 'Tamam',
      start: 'Başla',
      stop: 'Durdur',
      retry: 'Tekrar Dene',
      minutes: 'dakika',
      seconds: 'saniye',
      day: 'gün',
      week: 'hafta',
    },
    welcome: {
      title: 'Cicero\'ya Hoş Geldiniz',
      subtitle: 'Diksiyon becerilerinizi geliştirin',
      getStarted: 'Başlayalım',
      login: 'Giriş Yap',
    },
    onboarding: {
      selectGoal: 'Hedefinizi Seçin',
      selectGoalDescription: 'Size özel bir program oluşturmak için hedefinizi seçin',
      selectLevel: 'Seviyenizi Seçin',
      selectLevelDescription: 'Mevcut diksiyon seviyenizi belirleyin',
      selectLanguage: 'Dil Seçin',
      selectLanguageDescription: 'Uygulama dilini seçin',
      beginner: 'Başlangıç',
      beginnerDesc: 'Temel diksiyon becerileri',
      intermediate: 'Orta',
      intermediateDesc: 'İleri artikülasyon ve tonlama',
      advanced: 'İleri',
      advancedDesc: 'Profesyonel sunum ve sahne konuşması',
    },
    home: {
      greeting: 'Merhaba',
      subtitle: 'Bugün harika görünüyorsun 🎯',
      dailyGoal: 'Günlük Hedef',
      completed: 'tamamlandı',
      exercise: 'egzersiz',
      dayStreak: 'Gün Seri',
      weeklyMin: 'Haftalık Dk',
      trainingProgram: 'Eğitim Programı',
      beginner: 'Başlangıç Seviyesi',
      beginnerDesc: 'Temel diksiyon becerilerinizi geliştiriyorsunuz',
      intermediate: 'Orta Seviye',
      intermediateDesc: 'İleri artikülasyon ve tonlama çalışmaları',
      advanced: 'İleri Seviye',
      advancedDesc: 'Profesyonel sunum ve sahne konuşması',
    },
    profile: {
      title: 'Profil & Ayarlar',
      editProfile: 'Profili Düzenle',
      yourGoal: 'Hedefiniz',
      dailyTarget: 'Günlük Hedef',
      reminders: 'Hatırlatmalar',
      dailyReminder: 'Günlük Hatırlatma',
      time: 'Saat',
      premium: 'Premium',
      premiumTitle: 'Cicero Premium',
      premiumDesc: 'Sınırsız egzersiz, ileri analitik ve kişisel koçluk ile daha hızlı gelişin!',
      tryFree: '7 Gün Ücretsiz Dene',
      goalChangeTitle: 'Hedef Değişikliği',
      goalChangeMessage: 'seviyesine geçmek istediğinize emin misiniz?',
      recommendedDaily: 'Önerilen günlük hedef',
      focusAreas: 'Odak alanları',
      yes: 'Evet, Değiştir',
      successTitle: 'Başarılı! 🎯',
      successMessage: 'Hedefiniz {level} olarak güncellendi. Günlük hedefiniz {minutes} dakika olarak ayarlandı.',
      great: 'Harika!',
      language: 'Dil',
      selectLanguage: 'Dil Seçin',
      theme: 'Tema',
      appearance: 'Görünüm',
      light: 'Açık',
      dark: 'Koyu',
      legal: 'Yasal',
      privacyPolicy: 'Gizlilik Politikası',
    },
    sections: {
      pronunciation: 'Telaffuz & Durum Tespiti',
      pronunciationDesc: 'Okuma kaydı ile analiz',
      training: 'Kişisel Eğitim Programı',
      trainingDesc: 'AI koçunla ilerle',
      tongueTwisters: 'Hece Hece Tekerleme',
      tongueTwistersDesc: 'Oku, dinle, öğren',
      articulation: 'Artikülasyonla Başla',
      articulationDesc: 'Hece-hece çalış',
      exercises: 'Günlük Egzersizler',
      exercisesDesc: 'Her konudan alıştırma',
      diaphragm: 'Diyafram Çalışması',
      diaphragmDesc: 'AI ile nefes kontrolü',
      listening: 'Kulağını Geliştir',
      listeningDesc: 'Dinleme ve ses algısı',
      tonation: 'Tonlama Çalışması',
      tonationDesc: 'Paragraf okuma ve analiz',
      journal: 'Diksiyon Günlüğü',
      journalDesc: 'İlerleme takibi',
      tips: 'Cicero\'dan İpucu',
      tipsDesc: 'Basit diksiyon tüyoları',
    },
    trainingProgram: {
      title: 'Kişisel Eğitim Programı',
      generating: 'AI koçunuz programınızı hazırlıyor...',
      week: 'Hafta',
      weeklyProgress: 'Haftalık İlerleme',
      daysCompleted: 'gün tamamlandı',
      dailyPlan: 'Günlük Plan',
      day: 'Gün',
      startExercise: 'Egzersizi Başlat',
      backToProgram: 'Programa Dön',
      generateNew: 'Yeni Program Oluştur',
      aiDescription: 'AI koçunuz sizin için özel bir program hazırladı. Her gün düzenli çalışarak ilerlemenizi takip edin.',
    },
    pronunciation: {
      title: 'Telaffuz & Durum Tespiti',
      selectLevel: 'Seviye Seç',
      easy: 'Kolay',
      medium: 'Orta',
      hard: 'Zor',
      readingText: 'Okuma Metni',
      newText: 'Yeni metin oluşturuluyor...',
      generating: 'Yeni metin oluşturuluyor...',
      recording: 'Kayıt',
      startRecording: 'Kaydı Başlat',
      stopRecording: 'Kaydı Durdur',
      listen: 'Dinle',
      recordAgain: 'Tekrar Kaydet',
      analyzing: 'AI analiz yapıyor...',
      results: 'Analiz Sonuçları',
      overallScore: 'Genel Puan',
      pronunciation: 'Telaffuz',
      fluency: 'Akıcılık',
      pace: 'Hız',
      clarity: 'Netlik',
      feedback: 'Geri Bildirim',
      suggestions: 'Öneriler',
      backButton: 'Geri Dön',
    },
    exercises: {
      title: 'Günlük Egzersizler',
      daily: 'Günlük Egzersiz',
      selectCategory: 'Kategori Seç',
      breathing: 'Nefes Kontrolü',
      articulation: 'Artikülasyon',
      tonation: 'Tonlama',
      speed: 'Hız',
      generate: 'Yeni Egzersiz Oluştur',
      start: 'Başla',
    },
    tongueTwisters: {
      title: 'Hece Hece Tekerleme',
      selectDifficulty: 'Zorluk Seç',
      practice: 'Pratik Yap',
      syllables: 'Heceler',
      listen: 'Dinle',
      record: 'Kaydet',
    },
    listening: {
      title: 'Kulağını Geliştir',
      description: 'Dinleme ve ses algısı egzersizleri',
      start: 'Başla',
    },
    tonationTraining: {
      title: 'Tonlama Çalışması',
      description: 'Paragraf okuma ve analiz',
      start: 'Başla',
    },
    tips: {
      title: 'Cicero\'dan İpucu',
      daily: 'Günlük İpucu',
      category: 'Kategori',
      exercise: 'Egzersiz',
      newTip: 'Yeni İpucu',
    },
    reading: {
      title: 'Okuma Egzersizi',
      start: 'Başla',
      syllableMode: 'Hece Hece',
      normalMode: 'Normal',
    },
    introVideos: {
      title: 'Tanıtım Videoları',
      welcome: 'Cicero Diksiyon Kalemi AI Diksiyon Koç Uygulamasına HOŞGELDİNİZ',
      description: 'Uygulamayı tanıyın ve nasıl kullanacağınızı öğrenin',
    },
    languages: {
      turkish: 'Türkçe',
      english: 'English',
      german: 'Deutsch',
    },
    premium: {
      welcomeTitle: 'Cicero\'ya Hoş Geldiniz! 🎉',
      welcomeSubtitle: 'Diksiyon yolculuğunuza başlamaya hazır mısınız?',
      thankYou: 'Teşekkür ederiz!',
      freeTrial: 'Bizi Tavsiye Edin',
      freeTrialDesc: 'Uygulamayı satın alan arkadaşlarınıza özel %15 indirim kodu paylaşın',
      startTrial: 'İndirim Linki Paylaş',
      referral: 'Arkadaşlarınla Paylaş',
      referralDesc: 'Her arkadaşın için +3 gün ücretsiz kazan',
      shareLink: 'Linki Paylaş',
      earnDays: 'Ek Gün Kazan',
      purchase: 'Premium Satın Al',
      purchaseDesc: 'Sınırsız erişim için premium üyelik',
      monthly: 'Aylık',
      yearly: 'Yıllık',
      lifetime: 'Ömür Boyu',
      save: '%50 Tasarruf',
      mostPopular: 'En Popüler',
      features: 'Premium Özellikler',
      unlimitedExercises: 'Sınırsız Egzersiz',
      aiCoaching: 'AI Kişisel Koçluk',
      advancedAnalytics: 'Gelişmiş Analitik',
      offlineMode: 'Çevrimdışı Mod',
      prioritySupport: 'Öncelikli Destek',
      noAds: 'Reklamsız Deneyim',
      continueFree: 'Ücretsiz Devam Et',
      restorePurchase: 'Satın Alımı Geri Yükle',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      continue: 'Continue',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      start: 'Start',
      stop: 'Stop',
      retry: 'Retry',
      minutes: 'minutes',
      seconds: 'seconds',
      day: 'day',
      week: 'week',
    },
    welcome: {
      title: 'Welcome to Cicero',
      subtitle: 'Improve your diction skills',
      getStarted: 'Get Started',
      login: 'Login',
    },
    onboarding: {
      selectGoal: 'Select Your Goal',
      selectGoalDescription: 'Choose your goal to create a personalized program',
      selectLevel: 'Select Your Level',
      selectLevelDescription: 'Determine your current diction level',
      selectLanguage: 'Select Language',
      selectLanguageDescription: 'Choose your app language',
      beginner: 'Beginner',
      beginnerDesc: 'Basic diction skills',
      intermediate: 'Intermediate',
      intermediateDesc: 'Advanced articulation and intonation',
      advanced: 'Advanced',
      advancedDesc: 'Professional presentation and stage speaking',
    },
    home: {
      greeting: 'Hello',
      subtitle: 'You look great today 🎯',
      dailyGoal: 'Daily Goal',
      completed: 'completed',
      exercise: 'exercise',
      dayStreak: 'Day Streak',
      weeklyMin: 'Weekly Min',
      trainingProgram: 'Training Program',
      beginner: 'Beginner Level',
      beginnerDesc: 'Developing your basic diction skills',
      intermediate: 'Intermediate Level',
      intermediateDesc: 'Advanced articulation and intonation practice',
      advanced: 'Advanced Level',
      advancedDesc: 'Professional presentation and stage speaking',
    },
    profile: {
      title: 'Profile & Settings',
      editProfile: 'Edit Profile',
      yourGoal: 'Your Goal',
      dailyTarget: 'Daily Target',
      reminders: 'Reminders',
      dailyReminder: 'Daily Reminder',
      time: 'Time',
      premium: 'Premium',
      premiumTitle: 'Cicero Premium',
      premiumDesc: 'Improve faster with unlimited exercises, advanced analytics, and personal coaching!',
      tryFree: 'Try 7 Days Free',
      goalChangeTitle: 'Goal Change',
      goalChangeMessage: 'Are you sure you want to switch to level?',
      recommendedDaily: 'Recommended daily goal',
      focusAreas: 'Focus areas',
      yes: 'Yes, Change',
      successTitle: 'Success! 🎯',
      successMessage: 'Your goal has been updated to {level}. Your daily target is set to {minutes} minutes.',
      great: 'Great!',
      language: 'Language',
      selectLanguage: 'Select Language',
      theme: 'Theme',
      appearance: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
    },
    sections: {
      pronunciation: 'Pronunciation & Assessment',
      pronunciationDesc: 'Analysis with reading recording',
      training: 'Personal Training Program',
      trainingDesc: 'Progress with AI coach',
      tongueTwisters: 'Syllable by Syllable',
      tongueTwistersDesc: 'Read, listen, learn',
      articulation: 'Start with Articulation',
      articulationDesc: 'Practice syllable by syllable',
      exercises: 'Daily Exercises',
      exercisesDesc: 'Practice from every topic',
      diaphragm: 'Diaphragm Training',
      diaphragmDesc: 'Breath control with AI',
      listening: 'Improve Your Ear',
      listeningDesc: 'Listening and sound perception',
      tonation: 'Intonation Practice',
      tonationDesc: 'Paragraph reading and analysis',
      journal: 'Diction Journal',
      journalDesc: 'Progress tracking',
      tips: 'Tips from Cicero',
      tipsDesc: 'Simple diction tips',
    },
    trainingProgram: {
      title: 'Personal Training Program',
      generating: 'Your AI coach is preparing your program...',
      week: 'Week',
      weeklyProgress: 'Weekly Progress',
      daysCompleted: 'days completed',
      dailyPlan: 'Daily Plan',
      day: 'Day',
      startExercise: 'Start Exercise',
      backToProgram: 'Back to Program',
      generateNew: 'Generate New Program',
      aiDescription: 'Your AI coach has prepared a personalized program for you. Track your progress by practicing regularly every day.',
    },
    pronunciation: {
      title: 'Pronunciation & Assessment',
      selectLevel: 'Select Level',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      readingText: 'Reading Text',
      newText: 'Generating new text...',
      generating: 'Generating new text...',
      recording: 'Recording',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      listen: 'Listen',
      recordAgain: 'Record Again',
      analyzing: 'AI is analyzing...',
      results: 'Analysis Results',
      overallScore: 'Overall Score',
      pronunciation: 'Pronunciation',
      fluency: 'Fluency',
      pace: 'Pace',
      clarity: 'Clarity',
      feedback: 'Feedback',
      suggestions: 'Suggestions',
      backButton: 'Go Back',
    },
    exercises: {
      title: 'Daily Exercises',
      daily: 'Daily Exercise',
      selectCategory: 'Select Category',
      breathing: 'Breath Control',
      articulation: 'Articulation',
      tonation: 'Intonation',
      speed: 'Speed',
      generate: 'Generate New Exercise',
      start: 'Start',
    },
    tongueTwisters: {
      title: 'Syllable by Syllable',
      selectDifficulty: 'Select Difficulty',
      practice: 'Practice',
      syllables: 'Syllables',
      listen: 'Listen',
      record: 'Record',
    },
    listening: {
      title: 'Improve Your Ear',
      description: 'Listening and sound perception exercises',
      start: 'Start',
    },
    tonationTraining: {
      title: 'Intonation Practice',
      description: 'Paragraph reading and analysis',
      start: 'Start',
    },
    tips: {
      title: 'Tips from Cicero',
      daily: 'Daily Tip',
      category: 'Category',
      exercise: 'Exercise',
      newTip: 'New Tip',
    },
    reading: {
      title: 'Reading Exercise',
      start: 'Start',
      syllableMode: 'Syllable by Syllable',
      normalMode: 'Normal',
    },
    introVideos: {
      title: 'Introduction Videos',
      welcome: 'WELCOME to Cicero Diction Pen AI Diction Coach App',
      description: 'Get to know the app and learn how to use it',
    },
    languages: {
      turkish: 'Türkçe',
      english: 'English',
      german: 'Deutsch',
    },
    premium: {
      welcomeTitle: 'Welcome to Cicero! 🎉',
      welcomeSubtitle: 'Ready to start your diction journey?',
      thankYou: 'Thank You!',
      freeTrial: '24 Hours Free Trial',
      freeTrialDesc: 'Try all premium features free for 24 hours',
      startTrial: 'Start Free Trial',
      referral: 'Share with Friends',
      referralDesc: 'Earn +3 days free for each friend',
      shareLink: 'Share Link',
      earnDays: 'Earn Extra Days',
      purchase: 'Buy Premium',
      purchaseDesc: 'Unlimited access with premium membership',
      monthly: 'Monthly',
      yearly: 'Yearly',
      lifetime: 'Lifetime',
      save: '50% Off',
      mostPopular: 'Most Popular',
      features: 'Premium Features',
      unlimitedExercises: 'Unlimited Exercises',
      aiCoaching: 'AI Personal Coaching',
      advancedAnalytics: 'Advanced Analytics',
      offlineMode: 'Offline Mode',
      prioritySupport: 'Priority Support',
      noAds: 'Ad-Free Experience',
      continueFree: 'Continue Free',
      restorePurchase: 'Restore Purchase',
    },
  },
  de: {
    common: {
      loading: 'Wird geladen...',
      error: 'Fehler',
      save: 'Speichern',
      cancel: 'Abbrechen',
      continue: 'Weiter',
      back: 'Zurück',
      next: 'Weiter',
      done: 'Fertig',
      start: 'Start',
      stop: 'Stopp',
      retry: 'Wiederholen',
      minutes: 'Minuten',
      seconds: 'Sekunden',
      day: 'Tag',
      week: 'Woche',
    },
    welcome: {
      title: 'Willkommen bei Cicero',
      subtitle: 'Verbessern Sie Ihre Diktion',
      getStarted: 'Loslegen',
      login: 'Anmelden',
    },
    onboarding: {
      selectGoal: 'Wählen Sie Ihr Ziel',
      selectGoalDescription: 'Wählen Sie Ihr Ziel für ein personalisiertes Programm',
      selectLevel: 'Wählen Sie Ihr Niveau',
      selectLevelDescription: 'Bestimmen Sie Ihr aktuelles Diktionsniveau',
      selectLanguage: 'Sprache wählen',
      selectLanguageDescription: 'Wählen Sie Ihre App-Sprache',
      beginner: 'Anfänger',
      beginnerDesc: 'Grundlegende Diktionsfähigkeiten',
      intermediate: 'Mittelstufe',
      intermediateDesc: 'Fortgeschrittene Artikulation und Intonation',
      advanced: 'Fortgeschritten',
      advancedDesc: 'Professionelle Präsentation und Bühnensprechen',
    },
    home: {
      greeting: 'Hallo',
      subtitle: 'Du siehst heute großartig aus 🎯',
      dailyGoal: 'Tagesziel',
      completed: 'abgeschlossen',
      exercise: 'Übung',
      dayStreak: 'Tage-Serie',
      weeklyMin: 'Wöchentl. Min',
      trainingProgram: 'Trainingsprogramm',
      beginner: 'Anfängerniveau',
      beginnerDesc: 'Entwicklung Ihrer grundlegenden Diktionsfähigkeiten',
      intermediate: 'Mittelstufe',
      intermediateDesc: 'Fortgeschrittene Artikulation und Intonationsübungen',
      advanced: 'Fortgeschrittenes Niveau',
      advancedDesc: 'Professionelle Präsentation und Bühnensprechen',
    },
    profile: {
      title: 'Profil & Einstellungen',
      editProfile: 'Profil bearbeiten',
      yourGoal: 'Ihr Ziel',
      dailyTarget: 'Tagesziel',
      reminders: 'Erinnerungen',
      dailyReminder: 'Tägliche Erinnerung',
      time: 'Zeit',
      premium: 'Premium',
      premiumTitle: 'Cicero Premium',
      premiumDesc: 'Verbessern Sie sich schneller mit unbegrenzten Übungen, erweiterten Analysen und persönlichem Coaching!',
      tryFree: '7 Tage kostenlos testen',
      goalChangeTitle: 'Zieländerung',
      goalChangeMessage: 'Sind Sie sicher, dass Sie zum Niveau wechseln möchten?',
      recommendedDaily: 'Empfohlenes Tagesziel',
      focusAreas: 'Schwerpunktbereiche',
      yes: 'Ja, ändern',
      successTitle: 'Erfolg! 🎯',
      successMessage: 'Ihr Ziel wurde auf {level} aktualisiert. Ihr Tagesziel ist auf {minutes} Minuten eingestellt.',
      great: 'Großartig!',
      language: 'Sprache',
      selectLanguage: 'Sprache wählen',
      theme: 'Thema',
      appearance: 'Aussehen',
      light: 'Hell',
      dark: 'Dunkel',
      legal: 'Rechtliches',
      privacyPolicy: 'Datenschutzrichtlinie',
    },
    sections: {
      pronunciation: 'Aussprache & Bewertung',
      pronunciationDesc: 'Analyse mit Leseaufnahme',
      training: 'Persönliches Trainingsprogramm',
      trainingDesc: 'Fortschritt mit KI-Coach',
      tongueTwisters: 'Silbe für Silbe',
      tongueTwistersDesc: 'Lesen, hören, lernen',
      articulation: 'Mit Artikulation beginnen',
      articulationDesc: 'Silbe für Silbe üben',
      exercises: 'Tägliche Übungen',
      exercisesDesc: 'Übungen zu jedem Thema',
      diaphragm: 'Zwerchfelltraining',
      diaphragmDesc: 'Atemkontrolle mit KI',
      listening: 'Verbessern Sie Ihr Gehör',
      listeningDesc: 'Hören und Klangwahrnehmung',
      tonation: 'Intonationsübung',
      tonationDesc: 'Absatzlesen und Analyse',
      journal: 'Diktionstagebuch',
      journalDesc: 'Fortschrittsverfolgung',
      tips: 'Tipps von Cicero',
      tipsDesc: 'Einfache Diktionstipps',
    },
    trainingProgram: {
      title: 'Persönliches Trainingsprogramm',
      generating: 'Ihr KI-Coach bereitet Ihr Programm vor...',
      week: 'Woche',
      weeklyProgress: 'Wöchentlicher Fortschritt',
      daysCompleted: 'Tage abgeschlossen',
      dailyPlan: 'Tagesplan',
      day: 'Tag',
      startExercise: 'Übung starten',
      backToProgram: 'Zurück zum Programm',
      generateNew: 'Neues Programm erstellen',
      aiDescription: 'Ihr KI-Coach hat ein personalisiertes Programm für Sie vorbereitet. Verfolgen Sie Ihren Fortschritt durch regelmäßiges tägliches Üben.',
    },
    pronunciation: {
      title: 'Aussprache & Bewertung',
      selectLevel: 'Niveau wählen',
      easy: 'Einfach',
      medium: 'Mittel',
      hard: 'Schwer',
      readingText: 'Lesetext',
      newText: 'Neuer Text wird generiert...',
      generating: 'Neuer Text wird generiert...',
      recording: 'Aufnahme',
      startRecording: 'Aufnahme starten',
      stopRecording: 'Aufnahme stoppen',
      listen: 'Anhören',
      recordAgain: 'Erneut aufnehmen',
      analyzing: 'KI analysiert...',
      results: 'Analyseergebnisse',
      overallScore: 'Gesamtpunktzahl',
      pronunciation: 'Aussprache',
      fluency: 'Flüssigkeit',
      pace: 'Tempo',
      clarity: 'Klarheit',
      feedback: 'Feedback',
      suggestions: 'Vorschläge',
      backButton: 'Zurück',
    },
    exercises: {
      title: 'Tägliche Übungen',
      daily: 'Tägliche Übung',
      selectCategory: 'Kategorie wählen',
      breathing: 'Atemkontrolle',
      articulation: 'Artikulation',
      tonation: 'Intonation',
      speed: 'Geschwindigkeit',
      generate: 'Neue Übung erstellen',
      start: 'Start',
    },
    tongueTwisters: {
      title: 'Silbe für Silbe',
      selectDifficulty: 'Schwierigkeit wählen',
      practice: 'Üben',
      syllables: 'Silben',
      listen: 'Anhören',
      record: 'Aufnehmen',
    },
    listening: {
      title: 'Verbessern Sie Ihr Gehör',
      description: 'Hör- und Klangwahrnehmungsübungen',
      start: 'Start',
    },
    tonationTraining: {
      title: 'Intonationsübung',
      description: 'Absatzlesen und Analyse',
      start: 'Start',
    },
    tips: {
      title: 'Tipps von Cicero',
      daily: 'Täglicher Tipp',
      category: 'Kategorie',
      exercise: 'Übung',
      newTip: 'Neuer Tipp',
    },
    reading: {
      title: 'Leseübung',
      start: 'Start',
      syllableMode: 'Silbe für Silbe',
      normalMode: 'Normal',
    },
    introVideos: {
      title: 'Einführungsvideos',
      welcome: 'WILLKOMMEN bei der Cicero Diktionsstift KI-Diktionscoach-App',
      description: 'Lernen Sie die App kennen und erfahren Sie, wie Sie sie verwenden',
    },
    languages: {
      turkish: 'Türkçe',
      english: 'English',
      german: 'Deutsch',
    },
    premium: {
      welcomeTitle: 'Willkommen bei Cicero! 🎉',
      welcomeSubtitle: 'Bereit, Ihre Diktionsreise zu beginnen?',
      thankYou: 'Vielen Dank!',
      freeTrial: '24 Stunden kostenlos testen',
      freeTrialDesc: 'Testen Sie alle Premium-Funktionen 24 Stunden kostenlos',
      startTrial: 'Kostenlose Testversion starten',
      referral: 'Mit Freunden teilen',
      referralDesc: 'Verdienen Sie +3 Tage kostenlos für jeden Freund',
      shareLink: 'Link teilen',
      earnDays: 'Extra Tage verdienen',
      purchase: 'Premium kaufen',
      purchaseDesc: 'Unbegrenzter Zugang mit Premium-Mitgliedschaft',
      monthly: 'Monatlich',
      yearly: 'Jährlich',
      lifetime: 'Lebenslang',
      save: '50% Rabatt',
      mostPopular: 'Am beliebtesten',
      features: 'Premium-Funktionen',
      unlimitedExercises: 'Unbegrenzte Übungen',
      aiCoaching: 'KI-Persönliches Coaching',
      advancedAnalytics: 'Erweiterte Analysen',
      offlineMode: 'Offline-Modus',
      prioritySupport: 'Prioritäts-Support',
      noAds: 'Werbefreies Erlebnis',
      continueFree: 'Kostenlos fortfahren',
      restorePurchase: 'Kauf wiederherstellen',
    },
  },
};

export function useTranslation(language: Language): Translations {
  return translations[language];
}

export default translations;
