import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Language } from '@/contexts/AppContext';

const LANGUAGE_MAP: Record<Language, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
};

interface VoiceCoachOptions {
  language: Language;
  autoSpeak?: boolean;
  delay?: number;
  rate?: number;
}

export function useVoiceCoach({ language, autoSpeak = false, delay = 600, rate = 0.85 }: VoiceCoachOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback((text: string) => {
    if (!text) return;

    console.log('[VoiceCoach] Speaking:', text.substring(0, 80) + '...');

    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUAGE_MAP[language];
      utterance.rate = rate;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      Speech.stop();
      setIsSpeaking(true);
      Speech.speak(text, {
        language: LANGUAGE_MAP[language],
        rate,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [language, rate]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
    } else {
      Speech.stop();
    }
    setIsSpeaking(false);
  }, []);

  const speakOnce = useCallback((text: string) => {
    if (hasSpokeRef.current) return;
    hasSpokeRef.current = true;

    timerRef.current = setTimeout(() => {
      speak(text);
    }, delay);
  }, [speak, delay]);

  const speakWithDelay = useCallback((text: string, customDelay?: number) => {
    timerRef.current = setTimeout(() => {
      speak(text);
    }, customDelay ?? delay);
  }, [speak, delay]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (Platform.OS === 'web') {
        window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
    };
  }, []);

  return {
    speak,
    speakOnce,
    speakWithDelay,
    stop,
    isSpeaking,
  };
}

export function getCoachGreeting(
  userName: string,
  language: Language,
  todayProgress: number,
  streak: number
): string {
  const name = userName || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');

  if (language === 'tr') {
    if (todayProgress >= 100) {
      return `Tebrikler ${name}! Bugünkü hedefini tamamladın. Harika iş çıkardın! İstersen ekstra çalışma yapabilirsin.`;
    }
    if (streak >= 7) {
      return `Merhaba ${name}! ${streak} günlük seri harika gidiyor! Bugün de birlikte çalışalım.`;
    }
    if (todayProgress > 0) {
      return `Tekrar hoş geldin ${name}! Bugün yüzde ${Math.round(todayProgress)} ilerleme kaydetmişsin. Harika devam edelim!`;
    }
    return `Merhaba ${name}! Bugün diksiyon çalışmalarına hazır mısın? Hadi birlikte başlayalım!`;
  }

  if (language === 'en') {
    if (todayProgress >= 100) {
      return `Congratulations ${name}! You've completed today's goal. Great job! You can do extra practice if you'd like.`;
    }
    if (streak >= 7) {
      return `Hello ${name}! Your ${streak}-day streak is amazing! Let's keep working together today.`;
    }
    if (todayProgress > 0) {
      return `Welcome back ${name}! You've made ${Math.round(todayProgress)} percent progress today. Let's keep going!`;
    }
    return `Hello ${name}! Are you ready for today's diction practice? Let's get started together!`;
  }

  if (todayProgress >= 100) {
    return `Herzlichen Glückwunsch ${name}! Du hast das heutige Ziel erreicht. Großartige Arbeit!`;
  }
  if (streak >= 7) {
    return `Hallo ${name}! Deine ${streak}-Tage-Serie ist fantastisch! Lass uns heute weiter zusammen arbeiten.`;
  }
  if (todayProgress > 0) {
    return `Willkommen zurück ${name}! Du hast heute ${Math.round(todayProgress)} Prozent Fortschritt gemacht. Weiter so!`;
  }
  return `Hallo ${name}! Bist du bereit für das heutige Diktionstraining? Lass uns zusammen anfangen!`;
}

export function getScreenCoachIntro(
  screenName: string,
  userName: string,
  language: Language
): string {
  const name = userName || (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');

  const intros: Record<string, Record<Language, string>> = {
    articulation: {
      tr: `${name}, artikülasyon çalışmasına hoş geldin! Burada seslerini netleştireceğiz. Hazır olduğunda bir egzersiz seç ve başlayalım.`,
      en: `${name}, welcome to articulation practice! We'll work on clarifying your sounds here. Choose an exercise when you're ready.`,
      de: `${name}, willkommen zur Artikulationsübung! Hier werden wir deine Laute klarer machen. Wähle eine Übung, wenn du bereit bist.`,
    },
    exercises: {
      tr: `${name}, egzersiz bölümüne hoş geldin! Süre ve kategori seçerek kişiselleştirilmiş bir çalışma başlatabilirsin.`,
      en: `${name}, welcome to the exercise section! Choose a duration and category to start a personalized session.`,
      de: `${name}, willkommen im Übungsbereich! Wähle eine Dauer und Kategorie für eine personalisierte Sitzung.`,
    },
    tongueTwisters: {
      tr: `${name}, tekerleme çalışmasına hoş geldin! Tekerlemeler artikülasyonunu güçlendirecek. Zorluk seviyeni seç ve başlayalım.`,
      en: `${name}, welcome to tongue twister practice! Tongue twisters will strengthen your articulation. Choose your difficulty and let's begin.`,
      de: `${name}, willkommen zur Zungenbrecher-Übung! Zungenbrecher stärken deine Artikulation. Wähle deinen Schwierigkeitsgrad.`,
    },
    diaphragm: {
      tr: `${name}, diyafram eğitimine hoş geldin! Doğru nefes kontrolü, güçlü bir sesin temelidir. Egzersizleri takip et.`,
      en: `${name}, welcome to diaphragm training! Proper breath control is the foundation of a strong voice. Follow the exercises.`,
      de: `${name}, willkommen zum Zwerchfelltraining! Richtige Atemkontrolle ist die Grundlage einer starken Stimme.`,
    },
    listening: {
      tr: `${name}, dinleme eğitimine hoş geldin! Burada ses ayrımı ve fonem algılama becerilerini geliştireceğiz.`,
      en: `${name}, welcome to listening training! We'll develop your sound discrimination and phoneme perception skills here.`,
      de: `${name}, willkommen zum Hörtraining! Hier entwickeln wir deine Lautunterscheidung und Phonemwahrnehmung.`,
    },
    tonation: {
      tr: `${name}, tonlama çalışmasına hoş geldin! Tonlama, konuşmanın duygusal ifadesini belirler. Hikayeyi oku ve tonlamaya dikkat et.`,
      en: `${name}, welcome to intonation practice! Intonation determines the emotional expression of speech. Read the story and pay attention to tone.`,
      de: `${name}, willkommen zur Intonationsübung! Die Intonation bestimmt den emotionalen Ausdruck der Sprache.`,
    },
    pronunciation: {
      tr: `${name}, telaffuz değerlendirmesine hoş geldin! Metni oku, seni kaydedeceğim ve analiz yapacağım. Hazır olduğunda başla.`,
      en: `${name}, welcome to pronunciation assessment! Read the text, I'll record and analyze you. Start when you're ready.`,
      de: `${name}, willkommen zur Aussprachebewertung! Lies den Text, ich nehme auf und analysiere. Starte, wenn du bereit bist.`,
    },
    dailyTips: {
      tr: `${name}, günlük ipucun hazır! Diksiyon yolculuğunda sana yardımcı olacak bilgiler burada.`,
      en: `${name}, your daily tip is ready! Here are insights to help you on your diction journey.`,
      de: `${name}, dein täglicher Tipp ist bereit! Hier sind Einblicke für deine Diktionsreise.`,
    },
  };

  return intros[screenName]?.[language] ?? '';
}
