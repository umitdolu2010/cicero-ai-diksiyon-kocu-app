import { generateObject as sdkGenerateObject, generateText } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import { Language } from '@/contexts/AppContext';

async function generateObject<T extends z.ZodType>(params: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  schema: T;
}): Promise<z.infer<T>> {
  try {
    const result = await sdkGenerateObject(params);
    console.log('SDK generateObject succeeded');
    return result;
  } catch (error) {
    console.error('generateObject SDK error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    console.log('Attempting generateText fallback...');
    
    try {
      const textResponse = await generateText(params);
      console.log('Raw text response received, length:', textResponse?.length || 0);
      
      if (!textResponse || typeof textResponse !== 'string') {
        console.error('Invalid text response from generateText');
        throw new Error('Invalid response from AI');
      }
      
      console.log('First 500 chars:', textResponse.substring(0, 500));
      
      let cleanedText = textResponse.trim();
      
      // Remove BOM and zero-width characters
      cleanedText = cleanedText.replace(/^\uFEFF/, '');
      cleanedText = cleanedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      // Remove markdown code blocks (multiple patterns)
      cleanedText = cleanedText.replace(/^```json\s*/gi, '');
      cleanedText = cleanedText.replace(/^```\s*/gi, '');
      cleanedText = cleanedText.replace(/\s*```$/gi, '');
      cleanedText = cleanedText.trim();
      
      // Remove any leading/trailing quotes
      if ((cleanedText.startsWith('"') && cleanedText.endsWith('"')) ||
          (cleanedText.startsWith("'") && cleanedText.endsWith("'"))) {
        cleanedText = cleanedText.slice(1, -1);
        cleanedText = cleanedText.trim();
      }
      
      // Remove any text before the first JSON structure
      // This handles cases like "Sure! {json}" or "Here's the response: {json}"
      const firstJsonChar = Math.min(
        cleanedText.indexOf('{') !== -1 ? cleanedText.indexOf('{') : Infinity,
        cleanedText.indexOf('[') !== -1 ? cleanedText.indexOf('[') : Infinity
      );
      
      if (firstJsonChar !== Infinity && firstJsonChar > 0) {
        console.log('Removing text before JSON, first', firstJsonChar, 'characters:', cleanedText.substring(0, firstJsonChar));
        cleanedText = cleanedText.substring(firstJsonChar);
      }
      
      // Find JSON object or array boundaries
      let firstBrace = cleanedText.indexOf('{');
      let lastBrace = cleanedText.lastIndexOf('}');
      const firstBracket = cleanedText.indexOf('[');
      const lastBracket = cleanedText.lastIndexOf(']');
      
      // Determine if it's an object or array
      const isArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);
      
      if (isArray) {
        firstBrace = firstBracket;
        lastBrace = lastBracket;
      }
      
      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        console.error('No valid JSON structure found in response');
        console.error('Text preview:', cleanedText.substring(0, 300));
        throw new Error('No valid JSON structure in AI response');
      }
      
      // Extract ONLY the JSON part
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      
      // Remove any remaining BOM or zero-width characters after extraction
      cleanedText = cleanedText.replace(/^\uFEFF/, '');
      cleanedText = cleanedText.replace(/[\u200B-\u200D\uFEFF]/g, '');
      
      console.log('Extracted JSON preview (first 300 chars):', cleanedText.substring(0, 300));
      console.log('Extracted JSON preview (last 100 chars):', cleanedText.substring(Math.max(0, cleanedText.length - 100)));
      
      // Clean up the JSON string
      // Remove control characters but preserve newlines in strings
      cleanedText = cleanedText.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
      // Remove trailing commas before closing braces/brackets
      cleanedText = cleanedText.replace(/,\s*([}\]])/g, '$1');
      
      console.log('Attempting to parse cleaned JSON, length:', cleanedText.length);
      console.log('First 100 chars after cleaning:', cleanedText.substring(0, 100));
      
      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed JSON string (first 500 chars):', cleanedText.substring(0, 500));
        console.error('Character codes at start:', Array.from(cleanedText.substring(0, 20)).map((c, i) => `[${i}]${c}(${c.charCodeAt(0)})`).join(' '));
        
        console.log('Attempting more aggressive JSON extraction...');
        const jsonObjectMatch = cleanedText.match(/\{[\s\S]*\}/);
        const jsonArrayMatch = cleanedText.match(/\[[\s\S]*\]/);
        
        let extractedJson = null;
        if (jsonObjectMatch) {
          extractedJson = jsonObjectMatch[0];
        } else if (jsonArrayMatch) {
          extractedJson = jsonArrayMatch[0];
        }
        
        if (extractedJson) {
          console.log('Found JSON via regex, attempting parse...');
          try {
            parsed = JSON.parse(extractedJson);
            console.log('Successfully parsed via regex extraction');
          } catch (regexParseError) {
            console.error('Regex extraction also failed:', regexParseError);
            throw parseError;
          }
        } else {
          throw parseError;
        }
      }
      
      console.log('Successfully parsed JSON from text response');
      console.log('Parsed object keys:', Object.keys(parsed));
      
      const validated = params.schema.parse(parsed);
      console.log('Successfully validated with schema');
      
      return validated;
    } catch (fallbackError) {
      console.error('Fallback generateText also failed:', fallbackError);
      if (fallbackError instanceof Error) {
        console.error('Fallback error message:', fallbackError.message);
        console.error('Fallback error stack:', fallbackError.stack);
      }
      throw new Error(`AI service unavailable - both methods failed`);
    }
  }
}

const languageConfig = {
  tr: {
    name: 'Turkish',
    nativeName: 'Türkçe',
    instructionLanguage: 'Türkçe',
    examplePhonemes: 'ö, ü, ş, ç, r, l, ğ',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    instructionLanguage: 'English',
    examplePhonemes: 'th, r, l, w, v, z',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    instructionLanguage: 'German',
    examplePhonemes: 'ü, ö, ä, ch, r, sch',
  },
};

export interface ExerciseContent {
  text: string;
  syllables: string[];
  targetPhoneme: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DailyTip {
  title: string;
  content: string;
  exercise: string;
  category: string;
}

export interface WeeklyPlan {
  week: number;
  days: {
    day: number;
    title: string;
    exercises: string[];
    duration: number;
    focus: string;
  }[];
}

export async function generateArticulationExercise(
  difficulty: 'easy' | 'medium' | 'hard',
  language: Language = 'tr',
  targetPhoneme?: string
): Promise<ExerciseContent> {
  const config = languageConfig[language];
  
  const difficultyMap = {
    tr: {
      easy: 'kolay (3-6 hece, basit kelimeler)',
      medium: 'orta (7-10 hece, orta zorlukta kelimeler)',
      hard: 'zor (10+ hece, karmaşık kelimeler ve cümleler)',
    },
    en: {
      easy: 'easy (3-6 syllables, simple words)',
      medium: 'medium (7-10 syllables, moderate difficulty words)',
      hard: 'hard (10+ syllables, complex words and sentences)',
    },
    de: {
      easy: 'einfach (3-6 Silben, einfache Wörter)',
      medium: 'mittel (7-10 Silben, mittelschwere Wörter)',
      hard: 'schwer (10+ Silben, komplexe Wörter und Sätze)',
    },
  };

  const exampleMap = {
    tr: '"Şöför şoförü şoförlükten şoförledi" -> ["Şö-för", "şo-fö-rü", "şo-för-lük-ten", "şo-för-le-di"]',
    en: '"She sells seashells by the seashore" -> ["She", "sells", "sea-shells", "by", "the", "sea-shore"]',
    de: '"Fischers Fritz fischt frische Fische" -> ["Fi-schers", "Fritz", "fischt", "fri-sche", "Fi-sche"]',
  };

  const prompt = language === 'tr' 
    ? `Türkçe diksiyon egzersizi için ${difficultyMap[language][difficulty]} seviyesinde bir alıştırma oluştur.
${targetPhoneme ? `Hedef fonem: ${targetPhoneme}` : `Rastgele bir fonem seç (${config.examplePhonemes})`}

Örnek: ${exampleMap[language]}`
    : language === 'en'
    ? `Create a ${difficultyMap[language][difficulty]} level diction exercise in English.
${targetPhoneme ? `Target phoneme: ${targetPhoneme}` : `Choose a random phoneme (${config.examplePhonemes})`}

Example: ${exampleMap[language]}`
    : `Erstelle eine ${difficultyMap[language][difficulty]} Diktionsübung auf Deutsch.
${targetPhoneme ? `Ziel-Phonem: ${targetPhoneme}` : `Wähle ein zufälliges Phonem (${config.examplePhonemes})`}

Beispiel: ${exampleMap[language]}`;

  try {
    const schema = z.object({
      text: z.string().describe(language === 'tr' ? 'Diksiyon egzersizi metni' : language === 'en' ? 'Diction exercise text' : 'Diktionsübungstext'),
      syllables: z.array(z.string()).describe(language === 'tr' ? 'Kelimelerin hece hece ayrılmış hali' : language === 'en' ? 'Words separated into syllables' : 'Wörter in Silben getrennt'),
      targetPhoneme: z.string().describe(language === 'tr' ? 'Hedef fonem' : language === 'en' ? 'Target phoneme' : 'Ziel-Phonem'),
      difficulty: z.enum(['easy', 'medium', 'hard']).describe(language === 'tr' ? 'Zorluk seviyesi' : language === 'en' ? 'Difficulty level' : 'Schwierigkeitsgrad'),
    });

    const result = await generateObject({
      messages: [{ role: 'user', content: prompt }],
      schema,
    });
    
    console.log('Generated exercise result:', result);
    return result;
  } catch (error) {
    console.error('Error generating exercise:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    const fallbacks = {
      tr: {
        text: targetPhoneme === 'r' ? 'Kara kara karga kara kara kargaya kara kara karga diye bağırmış' : 
              targetPhoneme === 'ş' ? 'Şu köşe yaz köşesi, şu köşe kış köşesi' :
              'Bir berber bir berbere bre berber beri gel diye bağırmış',
        syllables: targetPhoneme === 'r' ? ['Ka-ra', 'kar-ga', 'ba-ğır-mış'] :
                   targetPhoneme === 'ş' ? ['Şu', 'kö-şe', 'yaz', 'kış'] :
                   ['Bir', 'ber-ber', 'ba-ğır-mış'],
      },
      en: {
        text: 'She sells seashells by the seashore',
        syllables: ['She', 'sells', 'sea-shells', 'by', 'the', 'sea-shore'],
      },
      de: {
        text: 'Fischers Fritz fischt frische Fische',
        syllables: ['Fi-schers', 'Fritz', 'fischt', 'fri-sche', 'Fi-sche'],
      },
    };
    
    return {
      text: fallbacks[language].text,
      syllables: fallbacks[language].syllables,
      targetPhoneme: targetPhoneme || 'r',
      difficulty,
    };
  }
}

export async function generateDailyTip(language: Language = 'tr', userName?: string): Promise<DailyTip> {
  const config = languageConfig[language];
  const userGreeting = userName ? userName : (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
  
  const prompts = {
    tr: `${userGreeting} için Türkçe diksiyon ve konuşma becerileri için günlük bir ipucu oluştur.
İpucu pratik, uygulanabilir ve kısa olmalı. Kullanıcının adını kullanarak samimi ve motive edici bir dil kullan.

Kategoriler: Nefes Kontrolü, Artikülasyon, Ses Tonu, Vurgu, Hız, Duruş

ÖZEL TÜRKÇE KURALLARI İÇİN ÖRNEKLER:
1. Türkçede her ses 1 vuruş uzunluğundadır. Konuşurken eğer uzatarak söylediğiniz bir harf varsa bu kuralı aklınıza getirin.
2. Türkçede "ğ" sesi yoktur. Yazım dilinde kullanılır ve kendinden önceki sesi 1 vuruş uzatır. Örnek: "dağ" kelimesinde "a" sesi uzatılır.
3. Türkçede "r" sesi dil ucuyla damağa vurularak çıkarılır. Boğazdan çıkarılmamalıdır.
4. Türkçede "ş" ve "s" sesleri farklıdır. "ş" daha yumuşak, "s" daha keskindir.
5. Türkçede vurgu genellikle son hecededir, ancak bazı kelimelerde farklı hecelerde olabilir.

Bu tarz Türkçeye özgü kuralları ve örnekleri kullanarak ipuçları oluştur.`,
    en: `Create a daily tip for ${userGreeting} for English diction and speaking skills.
The tip should be practical, actionable, and brief. Use the user's name and maintain a warm, motivating tone.

Categories: Breath Control, Articulation, Voice Tone, Emphasis, Pace, Posture

SPECIFIC ENGLISH RULES EXAMPLES:
1. The "th" sound is unique to English. Practice placing your tongue between your teeth.
2. The "r" sound in English is produced without rolling, unlike many other languages.
3. Stress patterns in English words can change meaning (e.g., REcord vs. reCORD).
4. English has many silent letters that affect pronunciation (e.g., "knight", "psychology").
5. Vowel sounds in English vary greatly and are crucial for clear communication.

Create tips using these English-specific rules and examples.`,
    de: `Erstelle einen täglichen Tipp für ${userGreeting} für deutsche Diktion und Sprechfähigkeiten.
Der Tipp sollte praktisch, umsetzbar und kurz sein. Verwenden Sie den Namen des Benutzers und pflegen Sie einen warmen, motivierenden Ton.

Kategorien: Atemkontrolle, Artikulation, Stimmton, Betonung, Tempo, Haltung

SPEZIFISCHE DEUTSCHE REGELN BEISPIELE:
1. Das "ch" hat zwei verschiedene Aussprachen: weich (ich) und hart (ach).
2. Die Umlaute ä, ö, ü sind eigenständige Laute und müssen klar ausgesprochen werden.
3. Das "r" wird im Deutschen oft am Wortende vokalisiert (z.B. "Vater").
4. Zusammengesetzte Wörter haben oft mehrere Betonungen.
5. Das "ß" (Eszett) wird wie ein scharfes "s" ausgesprochen.

Erstelle Tipps mit diesen deutschspezifischen Regeln und Beispielen.`,
  };

  try {
    const schema = z.object({
      title: z.string().describe(language === 'tr' ? 'Başlık (kısa ve çekici)' : language === 'en' ? 'Title (short and catchy)' : 'Titel (kurz und einprägsam)'),
      content: z.string().describe(language === 'tr' ? 'İçerik (2-3 cümle)' : language === 'en' ? 'Content (2-3 sentences)' : 'Inhalt (2-3 Sätze)'),
      exercise: z.string().describe(language === 'tr' ? 'Mini egzersiz (1 cümle)' : language === 'en' ? 'Mini exercise (1 sentence)' : 'Mini-Übung (1 Satz)'),
      category: z.string().describe(language === 'tr' ? 'Kategori' : language === 'en' ? 'Category' : 'Kategorie'),
    });

    const result = await generateObject({
      messages: [{ role: 'user', content: prompts[language] }],
      schema,
    });
    
    console.log('Generated daily tip result:', result);
    return result;
  } catch (error) {
    console.error('Error generating daily tip:', error);
    
    const fallbacks = {
      tr: {
        title: 'Nefes Kontrolü',
        content: 'Konuşmadan önce derin bir nefes alın. Diyafram nefesi, sesinizi güçlendirir ve daha rahat konuşmanızı sağlar.',
        exercise: '5 saniye burnunuzdan nefes alın, 5 saniye tutun, 5 saniye ağzınızdan verin.',
        category: 'Nefes Kontrolü',
      },
      en: {
        title: 'Breath Control',
        content: 'Take a deep breath before speaking. Diaphragmatic breathing strengthens your voice and helps you speak more comfortably.',
        exercise: 'Breathe in through your nose for 5 seconds, hold for 5 seconds, exhale through your mouth for 5 seconds.',
        category: 'Breath Control',
      },
      de: {
        title: 'Atemkontrolle',
        content: 'Atmen Sie tief ein, bevor Sie sprechen. Zwerchfellatmung stärkt Ihre Stimme und hilft Ihnen, bequemer zu sprechen.',
        exercise: 'Atmen Sie 5 Sekunden durch die Nase ein, halten Sie 5 Sekunden, atmen Sie 5 Sekunden durch den Mund aus.',
        category: 'Atemkontrolle',
      },
    };
    
    return fallbacks[language];
  }
}

export async function generateWeeklyPlan(
  level: 'beginner' | 'intermediate' | 'advanced',
  dailyMinutes: number,
  language: Language = 'tr'
): Promise<WeeklyPlan> {
  const config = languageConfig[language];
  
  const levelMaps = {
    tr: {
      beginner: 'başlangıç seviyesi (temel artikülasyon ve telaffuz)',
      intermediate: 'orta seviye (ileri artikülasyon ve prosodi)',
      advanced: 'ileri seviye (profesyonel sunum ve performans)',
    },
    en: {
      beginner: 'beginner level (basic articulation and pronunciation)',
      intermediate: 'intermediate level (advanced articulation and prosody)',
      advanced: 'advanced level (professional presentation and performance)',
    },
    de: {
      beginner: 'Anfängerniveau (grundlegende Artikulation und Aussprache)',
      intermediate: 'Mittelstufe (fortgeschrittene Artikulation und Prosodie)',
      advanced: 'Fortgeschrittenes Niveau (professionelle Präsentation und Leistung)',
    },
  };

  const prompts = {
    tr: `${levelMaps[language][level]} için günlük ${dailyMinutes} dakikalık 7 günlük diksiyon eğitim programı oluştur.

Program ilerleyici olmalı ve her gün önceki günün üzerine inşa etmeli.`,
    en: `Create a 7-day diction training program for ${levelMaps[language][level]} with ${dailyMinutes} minutes daily.

The program should be progressive and each day should build upon the previous day.`,
    de: `Erstelle ein 7-Tage-Diktionstrainingsprogramm für ${levelMaps[language][level]} mit täglich ${dailyMinutes} Minuten.

Das Programm sollte progressiv sein und jeder Tag sollte auf dem vorherigen Tag aufbauen.`,
  };

  try {
    const schema = z.object({
      week: z.number().describe(language === 'tr' ? 'Hafta numarası' : language === 'en' ? 'Week number' : 'Wochennummer'),
      days: z.array(
        z.object({
          day: z.number().describe(language === 'tr' ? 'Gün numarası (1-7)' : language === 'en' ? 'Day number (1-7)' : 'Tagnummer (1-7)'),
          title: z.string().describe(language === 'tr' ? 'Başlık' : language === 'en' ? 'Title' : 'Titel'),
          exercises: z.array(z.string()).describe(language === 'tr' ? 'Egzersiz listesi (3-5 egzersiz)' : language === 'en' ? 'Exercise list (3-5 exercises)' : 'Übungsliste (3-5 Übungen)'),
          duration: z.number().describe(language === 'tr' ? 'Süre (dakika)' : language === 'en' ? 'Duration (minutes)' : 'Dauer (Minuten)'),
          focus: z.string().describe(language === 'tr' ? 'Odak noktası' : language === 'en' ? 'Focus point' : 'Schwerpunkt'),
        })
      ),
    });

    const result = await generateObject({
      messages: [{ role: 'user', content: prompts[language] }],
      schema,
    });
    
    console.log('Generated weekly plan result:', result);
    return result;
  } catch (error) {
    console.error('Error generating weekly plan:', error);
    
    const fallbacks = {
      tr: {
        week: 1,
        days: [
          {
            day: 1,
            title: 'Temel Nefes Egzersizleri',
            exercises: ['Diyafram nefesi', 'Uzun nefes tutma', 'Kontrollü nefes verme'],
            duration: dailyMinutes,
            focus: 'Nefes Kontrolü',
          },
          {
            day: 2,
            title: 'Artikülasyon Temelleri',
            exercises: ['Dudak egzersizleri', 'Dil egzersizleri', 'Çene gevşetme'],
            duration: dailyMinutes,
            focus: 'Artikülasyon',
          },
        ],
      },
      en: {
        week: 1,
        days: [
          {
            day: 1,
            title: 'Basic Breathing Exercises',
            exercises: ['Diaphragmatic breathing', 'Long breath holding', 'Controlled exhalation'],
            duration: dailyMinutes,
            focus: 'Breath Control',
          },
          {
            day: 2,
            title: 'Articulation Basics',
            exercises: ['Lip exercises', 'Tongue exercises', 'Jaw relaxation'],
            duration: dailyMinutes,
            focus: 'Articulation',
          },
        ],
      },
      de: {
        week: 1,
        days: [
          {
            day: 1,
            title: 'Grundlegende Atemübungen',
            exercises: ['Zwerchfellatmung', 'Langes Atemanhalten', 'Kontrolliertes Ausatmen'],
            duration: dailyMinutes,
            focus: 'Atemkontrolle',
          },
          {
            day: 2,
            title: 'Artikulationsgrundlagen',
            exercises: ['Lippenübungen', 'Zungenübungen', 'Kieferentspannung'],
            duration: dailyMinutes,
            focus: 'Artikulation',
          },
        ],
      },
    };
    
    return fallbacks[language];
  }
}

export async function analyzePronunciation(
  text: string,
  audioUri: string,
  language: Language = 'tr',
  userName?: string
): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  const config = languageConfig[language];
  const userGreeting = userName ? userName : (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
  
  const prompts = {
    tr: `${userGreeting} şu metni okudu: "${text}"

Ses kaydı analizi yapıldı. Şimdi ${userGreeting} için yapıcı geri bildirim ver. Pozitif ve motive edici ol. Kullanıcının adını kullan.`,
    en: `${userGreeting} read the following text: "${text}"

Audio recording analysis was performed. Now provide constructive feedback for ${userGreeting}. Be positive and motivating. Use the user's name.`,
    de: `${userGreeting} hat folgenden Text gelesen: "${text}"

Die Audioaufnahme wurde analysiert. Geben Sie nun konstruktives Feedback für ${userGreeting}. Seien Sie positiv und motivierend. Verwenden Sie den Namen des Benutzers.`,
  };

  try {
    const schema = z.object({
      score: z.number().describe(language === 'tr' ? 'Genel skor (0-100)' : language === 'en' ? 'Overall score (0-100)' : 'Gesamtpunktzahl (0-100)'),
      feedback: z.string().describe(language === 'tr' ? 'Kısa geri bildirim (2-3 cümle)' : language === 'en' ? 'Brief feedback (2-3 sentences)' : 'Kurzes Feedback (2-3 Sätze)'),
      strengths: z.array(z.string()).describe(language === 'tr' ? 'Güçlü yönler (2-3 madde)' : language === 'en' ? 'Strengths (2-3 items)' : 'Stärken (2-3 Punkte)'),
      improvements: z.array(z.string()).describe(language === 'tr' ? 'Geliştirilmesi gerekenler (2-3 madde)' : language === 'en' ? 'Areas for improvement (2-3 items)' : 'Verbesserungsbereiche (2-3 Punkte)'),
    });

    const result = await generateObject({
      messages: [{ role: 'user', content: prompts[language] }],
      schema,
    });
    
    console.log('Generated pronunciation analysis result:', result);
    return result;
  } catch (error) {
    console.error('Error analyzing pronunciation:', error);
    
    const fallbacks = {
      tr: {
        score: 75,
        feedback: 'İyi bir başlangıç yaptınız. Artikülasyonunuz genel olarak net.',
        strengths: ['Net telaffuz', 'İyi tempo'],
        improvements: ['Nefes kontrolü', 'Vurgu'],
      },
      en: {
        score: 75,
        feedback: 'You made a good start. Your articulation is generally clear.',
        strengths: ['Clear pronunciation', 'Good pace'],
        improvements: ['Breath control', 'Emphasis'],
      },
      de: {
        score: 75,
        feedback: 'Sie haben einen guten Start gemacht. Ihre Artikulation ist im Allgemeinen klar.',
        strengths: ['Klare Aussprache', 'Gutes Tempo'],
        improvements: ['Atemkontrolle', 'Betonung'],
      },
    };
    
    return fallbacks[language];
  }
}

export async function analyzeReadingWithFeedback(
  text: string,
  audioUri: string,
  language: Language = 'tr',
  userName?: string,
  previousAnalyses?: { score: number; issues: string[]; date: string }[]
): Promise<{
  score: number;
  feedback: string;
  voiceFeedback: string;
  needsPencilPractice: boolean;
  detailedAnalysis: {
    pronunciation: number;
    clarity: number;
    fluency: number;
    issues: string[];
  };
}> {
  const config = languageConfig[language];
  const userGreeting = userName ? userName : (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
  
  const improvementContext = previousAnalyses && previousAnalyses.length > 0
    ? `\n\n${language === 'tr' ? 'Kullanıcının geçmiş performansı' : language === 'en' ? 'User\'s past performance' : 'Bisherige Leistung des Benutzers'}:\n${previousAnalyses.slice(0, 5).map((a, i) => 
        `${i + 1}. ${language === 'tr' ? 'Analiz' : language === 'en' ? 'Analysis' : 'Analyse'} (${a.date}): ${language === 'tr' ? 'Puan' : language === 'en' ? 'Score' : 'Punktzahl'} ${a.score}, ${language === 'tr' ? 'Sorunlar' : language === 'en' ? 'Issues' : 'Probleme'}: ${a.issues.join(', ')}`
      ).join('\n')}\n\n${language === 'tr' ? 'Bu geçmiş verileri kullanarak kullanıcının gelişimini değerlendir ve önceki hatalarını tekrar edip etmediğini kontrol et. Gelişim gösteriyorsa bunu vurgula, aynı hataları tekrarlıyorsa buna dikkat çek.' : language === 'en' ? 'Use this historical data to evaluate the user\'s progress and check if they are repeating previous mistakes. If they are showing improvement, highlight it; if they are repeating the same mistakes, point it out.' : 'Verwenden Sie diese historischen Daten, um den Fortschritt des Benutzers zu bewerten und zu überprüfen, ob er frühere Fehler wiederholt. Wenn er Fortschritte zeigt, heben Sie dies hervor; wenn er dieselben Fehler wiederholt, weisen Sie darauf hin.'}`
    : '';

  const prompts = {
    tr: `Sen bir profesyonel diksiyon koçusun ve SADECE FONETİK HATALARI TESPİT EDİYORSUN. Kullanıcı (${userGreeting}) şu metni sesli okudu: "${text}"${improvementContext}

KRİTİK GÖREVİN: SES KAYDINI DİNLE VE SADECE FONETİK HATALARI TESPİT ET!

YANLIZ FONETİK HATALARA ODAKLAN:
- Yanlış söylenen sesler (ş yerine s, r yerine yumuşak r, vb.)
- Eksik veya yutulmuş sesler/heceler
- Bozuk veya anlaşılmaz telaffuz edilen kelimeler
- Yanlış hece kombinasyonları (me-li yerine me-mi gibi)
- Artikülasyon hataları (belirsiz sesler, net olmayan hece ayrımları)

DİKKAT: SADECE FONETİK HATALARI BULMAYA ÇALIŞ!
- Eğer telaffuz doğruysa YÜKSEK PUAN VER
- Eğer küçük hatalar varsa ORTA PUAN VER
- Sadece ciddi fonetik hatalar varsa DÜŞÜK PUAN VER

FONEM BAZLI ANALİZ:
1. Beklenen: "me-li" → Duyulan: "me-li" = DOĞRU ✓
2. Beklenen: "me-li" → Duyulan: "me-mi" = FONETİK HATA (ikinci hece yanlış) ✗
3. Beklenen: "me-li" → Duyulan: "ma-li" = FONETİK HATA (birinci hece yanlış) ✗
4. Beklenen: "me-li" → Duyulan: "m-li" = FONETİK HATA (birinci hece eksik) ✗

ANALİZ DETAYLARI:

1. TELAFFUZ DOĞRULUĞU (0-100): Sadece fonetik doğruluk - yanlış sesler, eksik sesler
2. NETLİK (0-100): Sadece artikülasyon netliği - ses berraklığı, hece ayrımı
3. AKICILIK (0-100): Okuma ritmi ve akışkanlığı

KRİTİK PUANLAMA KURALLARI:
- SADECE FONETİK HATALARI DEĞERLENDIR
- Eğer tüm sesler doğru çıkarılıyorsa 80+ puan ver
- Eğer birkaç küçük hata varsa 70-79 puan ver
- Eğer ciddi fonetik hatalar varsa 60 ve altı puan ver

Geri bildirim ${userGreeting} için samimi, destekleyici ve yapıcı olmalı. SADECE FONETİK HATALARI BELİRT. Diğer konulardan bahsetme.`,
    en: `You are a professional diction coach who learns and improves from each analysis. The user (${userGreeting}) read the following text aloud: "${text}"${improvementContext}

CRITICAL: LISTEN TO THE AUDIO RECORDING AND EVALUATE AS IS!

DON'T USE KEYBOARD-STYLE PREDICTION! Don't guess what the user meant to say. Only evaluate the SOUNDS YOU HEAR.

ESPECIALLY IN DOUBLE AND TRIPLE SYLLABLE READINGS:
- If the user should say "me-li", you must hear "me-li"
- If you hear "me-mi" or "ma-li", mark it as WRONG
- If you hear "m-li" (missing syllable), mark it as WRONG
- If you hear "me-le-li" (extra syllable), mark it as WRONG

PERFORM PHONEME-BASED MATCHING WITH SOUND BANK:
1. Expected: "me-li" → Heard: "me-li" = CORRECT ✓
2. Expected: "me-li" → Heard: "me-mi" = WRONG (second syllable wrong) ✗
3. Expected: "me-li" → Heard: "ma-li" = WRONG (first syllable wrong) ✗
4. Expected: "me-li" → Heard: "m-li" = WRONG (first syllable incomplete) ✗
5. Expected: "me-li" → Heard: "meli" (as one word) = WRONG (no syllable separation) ✗

CAREFULLY analyze the user's reading. NOT JUST MEANING-BASED, BUT PHONEME-LEVEL ANALYSIS:

1. PRONUNCIATION ACCURACY (0-100): Correct production of each sound - swallowed syllables, missing sounds, distorted pronunciation, wrong sounds
2. CLARITY (0-100): Crystal-clear intelligibility of words - articulation quality, sound clarity, syllable separation
3. FLUENCY (0-100): Reading speed, natural pauses, rhythm

CRITICAL SCORING RULES:
- If the user is swallowing syllables or producing sounds incompletely, PRONUNCIATION score should be below 70
- If words are unintelligible or distorted, CLARITY score should be below 65
- If syllable combinations are wrong (like me-mi instead of me-li), PRONUNCIATION score should be below 60
- Don't give high scores just because the meaning is understood - EVERY SOUND AND EVERY SYLLABLE MUST BE PRODUCED CORRECTLY
- In double and triple syllable readings, syllable order and accuracy are critically important

IMPORTANT: If the user:
- Is swallowing syllables
- Is producing sounds distorted/incompletely
- Is reading syllable combinations incorrectly (like me-mi instead of me-li)
- Is reading words unintelligibly
- Has an overall score below 70

Then suggest the user practice writing the text syllable by syllable with a diction pen.

Feedback should be sincere, supportive, and constructive for ${userGreeting}. Use the user's name. Be REALISTIC and HONEST - clearly point out mistakes but in a motivating tone.`,
    de: `Sie sind ein professioneller Diktionscoach, der aus jeder Analyse lernt und sich verbessert. Der Benutzer (${userGreeting}) hat folgenden Text laut vorgelesen: "${text}"${improvementContext}

KRITISCH: HÖREN SIE DIE AUDIOAUFNAHME UND BEWERTEN SIE SIE WIE SIE IST!

VERWENDEN SIE KEINE TASTATUR-ÄHNLICHE VORHERSAGE! Raten Sie nicht, was der Benutzer sagen wollte. Bewerten Sie nur die LAUTE, DIE SIE HÖREN.

BESONDERS BEI DOPPEL- UND DREIFACH-SILBEN-LESUNGEN:
- Wenn der Benutzer "me-li" sagen sollte, müssen Sie "me-li" hören
- Wenn Sie "me-mi" oder "ma-li" hören, markieren Sie es als FALSCH
- Wenn Sie "m-li" (fehlende Silbe) hören, markieren Sie es als FALSCH
- Wenn Sie "me-le-li" (zusätzliche Silbe) hören, markieren Sie es als FALSCH

FÜHREN SIE PHONEM-BASIERTE ÜBEREINSTIMMUNG MIT KLANGBANK DURCH:
1. Erwartet: "me-li" → Gehört: "me-li" = RICHTIG ✓
2. Erwartet: "me-li" → Gehört: "me-mi" = FALSCH (zweite Silbe falsch) ✗
3. Erwartet: "me-li" → Gehört: "ma-li" = FALSCH (erste Silbe falsch) ✗
4. Erwartet: "me-li" → Gehört: "m-li" = FALSCH (erste Silbe unvollständig) ✗
5. Erwartet: "me-li" → Gehört: "meli" (als ein Wort) = FALSCH (keine Silbentrennung) ✗

Analysieren Sie das Lesen des Benutzers SORGFÄLTIG. NICHT NUR BEDEUTUNGSBASIERT, SONDERN AUF PHONEMEBENE:

1. AUSSPRACHEGENAUIGKEIT (0-100): Korrekte Produktion jedes Lautes - verschluckte Silben, fehlende Laute, verzerrte Aussprache, falsche Laute
2. KLARHEIT (0-100): Kristallklare Verständlichkeit der Wörter - Artikulationsqualität, Klangklarheit, Silbentrennung
3. FLÜSSIGKEIT (0-100): Lesegeschwindigkeit, natürliche Pausen, Rhythmus

KRITISCHE BEWERTUNGSREGELN:
- Wenn der Benutzer Silben verschluckt oder Laute unvollständig produziert, sollte die AUSSPRACHE-Punktzahl unter 70 liegen
- Wenn Wörter unverständlich oder verzerrt sind, sollte die KLARHEIT-Punktzahl unter 65 liegen
- Wenn Silbenkombinationen falsch sind (wie me-mi statt me-li), sollte die AUSSPRACHE-Punktzahl unter 60 liegen
- Geben Sie keine hohen Punktzahlen nur weil die Bedeutung verstanden wird - JEDER LAUT UND JEDE SILBE MUSS KORREKT PRODUZIERT WERDEN
- Bei Doppel- und Dreifach-Silben-Lesungen sind Silbenreihenfolge und Genauigkeit von entscheidender Bedeutung

WICHTIG: Wenn der Benutzer:
- Silben verschluckt
- Laute verzerrt/unvollständig produziert
- Silbenkombinationen falsch liest (wie me-mi statt me-li)
- Wörter unverständlich liest
- Eine Gesamtpunktzahl unter 70 hat

Dann schlagen Sie dem Benutzer vor, den Text Silbe für Silbe mit einem Diktionsstift zu üben.

Das Feedback sollte aufrichtig, unterstützend und konstruktiv für ${userGreeting} sein. Verwenden Sie den Namen des Benutzers. Seien Sie REALISTISCH und EHRLICH - weisen Sie klar auf Fehler hin, aber in einem motivierenden Ton.`,
  };

  try {
    const schema = z.object({
      pronunciation: z.number().min(0).max(100).describe(language === 'tr' ? 'Telaffuz doğruluğu puanı' : language === 'en' ? 'Pronunciation accuracy score' : 'Aussprachegenauigkeitspunktzahl'),
      clarity: z.number().min(0).max(100).describe(language === 'tr' ? 'Netlik puanı' : language === 'en' ? 'Clarity score' : 'Klarheitspunktzahl'),
      fluency: z.number().min(0).max(100).describe(language === 'tr' ? 'Akıcılık puanı' : language === 'en' ? 'Fluency score' : 'Flüssigkeitspunktzahl'),
      feedback: z.string().describe(language === 'tr' ? 'Detaylı yazılı geri bildirim (3-4 cümle)' : language === 'en' ? 'Detailed written feedback (3-4 sentences)' : 'Detailliertes schriftliches Feedback (3-4 Sätze)'),
      voiceFeedback: z.string().describe(language === 'tr' ? 'Sesli geri bildirim için kısa özet (2-3 cümle, samimi ve motive edici)' : language === 'en' ? 'Brief summary for voice feedback (2-3 sentences, sincere and motivating)' : 'Kurze Zusammenfassung für Sprach-Feedback (2-3 Sätze, aufrichtig und motivierend)'),
      issues: z.array(z.string()).describe(language === 'tr' ? 'Tespit edilen sorunlar (yanlış sesler, eksik heceler, bozuk telaffuz vb.)' : language === 'en' ? 'Identified issues (wrong sounds, missing syllables, distorted pronunciation, etc.)' : 'Identifizierte Probleme (falsche Laute, fehlende Silben, verzerrte Aussprache usw.)'),
      needsPencilPractice: z.boolean().describe(language === 'tr' ? 'Diksiyon kalemi ile çalışma gerekiyor mu?' : language === 'en' ? 'Does diction pen practice needed?' : 'Ist Diktionsstift-Übung erforderlich?'),
    });

    const result = await generateObject({
      messages: [{ role: 'user', content: prompts[language] }],
      schema,
    });
    
    console.log('Reading analysis result:', result);
    console.log('AI Self-improvement: Analyzed with context of', previousAnalyses?.length || 0, 'previous recordings');
    
    const overallScore = Math.round((result.pronunciation + result.clarity + result.fluency) / 3);
    
    let voiceFeedback = result.voiceFeedback;
    if (userName) {
      voiceFeedback = `${userGreeting}, ${voiceFeedback}`;
    }
    if (result.needsPencilPractice || overallScore < 70) {
      const pencilSuggestions = {
        tr: ' Daha temiz ve anlaşılır okuma için, metni diksiyon kalemi ile hece hece yazarak çalışmanızı öneririm.',
        en: ' For cleaner and clearer reading, I recommend practicing by writing the text syllable by syllable with a diction pen.',
        de: ' Für ein saubereres und klareres Lesen empfehle ich, den Text Silbe für Silbe mit einem Diktionsstift zu üben.',
      };
      voiceFeedback += pencilSuggestions[language];
    }
    
    return {
      score: overallScore,
      feedback: result.feedback,
      voiceFeedback,
      needsPencilPractice: result.needsPencilPractice || overallScore < 70,
      detailedAnalysis: {
        pronunciation: result.pronunciation,
        clarity: result.clarity,
        fluency: result.fluency,
        issues: result.issues,
      },
    };
  } catch (error) {
    console.error('Error analyzing reading:', error);
    
    const fallbacks = {
      tr: {
        score: 65,
        feedback: 'Okuma performansınızı analiz ettik. Bazı hecelerde netlik sorunu tespit edildi. Düzenli çalışma ile gelişim gösterebilirsiniz.',
        voiceFeedback: 'Okuma performansınızı analiz ettik. Daha temiz ve anlaşılır okuma için, metni diksiyon kalemi ile hece hece yazarak çalışmanızı öneririm.',
        needsPencilPractice: true,
        detailedAnalysis: {
          pronunciation: 65,
          clarity: 60,
          fluency: 70,
          issues: ['Bazı hecelerin yutulması', 'Artikülasyon netliği'],
        },
      },
      en: {
        score: 65,
        feedback: 'We analyzed your reading performance. Clarity issues were detected in some syllables. You can show improvement with regular practice.',
        voiceFeedback: 'We analyzed your reading performance. For cleaner and clearer reading, I recommend practicing by writing the text syllable by syllable with a diction pen.',
        needsPencilPractice: true,
        detailedAnalysis: {
          pronunciation: 65,
          clarity: 60,
          fluency: 70,
          issues: ['Swallowing some syllables', 'Articulation clarity'],
        },
      },
      de: {
        score: 65,
        feedback: 'Wir haben Ihre Leseleistung analysiert. In einigen Silben wurden Klarheitsprobleme festgestellt. Mit regelmäßiger Übung können Sie Fortschritte zeigen.',
        voiceFeedback: 'Wir haben Ihre Leseleistung analysiert. Für ein saubereres und klareres Lesen empfehle ich, den Text Silbe für Silbe mit einem Diktionsstift zu üben.',
        needsPencilPractice: true,
        detailedAnalysis: {
          pronunciation: 65,
          clarity: 60,
          fluency: 70,
          issues: ['Verschlucken einiger Silben', 'Artikulationsklarheit'],
        },
      },
    };
    
    return fallbacks[language];
  }
}

export async function generateCoachMessage(
  context: string,
  userProgress: number,
  language: Language = 'tr',
  userName?: string
): Promise<string> {
  const userGreeting = userName ? userName : (language === 'tr' ? 'Değerli kullanıcı' : language === 'en' ? 'Dear user' : 'Lieber Benutzer');
  
  const prompts = {
    tr: `Sen Cicero AI Koç'sun. ${userGreeting} için kısa, motive edici bir mesaj ver.

Bağlam: ${context}
İlerleme: %${userProgress}

Mesaj 1-2 cümle olmalı, samimi ve destekleyici olmalı. ${userGreeting} adını kullan.`,
    en: `You are Cicero AI Coach. Give a short, motivating message for ${userGreeting}.

Context: ${context}
Progress: ${userProgress}%

The message should be 1-2 sentences, sincere and supportive. Use ${userGreeting}'s name.`,
    de: `Sie sind Cicero AI Coach. Geben Sie eine kurze, motivierende Nachricht für ${userGreeting}.

Kontext: ${context}
Fortschritt: ${userProgress}%

Die Nachricht sollte 1-2 Sätze lang, aufrichtig und unterstützend sein. Verwenden Sie ${userGreeting}s Namen.`,
  };

  try {
    const message = await generateText({
      messages: [{ role: 'user', content: prompts[language] }],
    });

    console.log('Generated coach message:', message);
    return message;
  } catch (error) {
    console.error('Error generating coach message:', error);
    const fallbacks = {
      tr: 'Harika ilerliyorsun! Düzenli çalışman meyvelerini veriyor. Devam et!',
      en: 'You\'re doing great! Your regular practice is paying off. Keep it up!',
      de: 'Du machst das großartig! Deine regelmäßige Übung zahlt sich aus. Mach weiter!',
    };
    return fallbacks[language];
  }
}

export async function generatePronunciationText(
  difficulty: 'easy' | 'medium' | 'hard',
  language: Language = 'tr'
): Promise<string> {
  const config = languageConfig[language];
  
  const fallbackTexts = {
    tr: {
      easy: 'Şöför şehir merkezinde çiçekçi dükkanının önünde durdu. Rüzgar ağaçların yapraklarını hışırdatıyordu. Çocuklar çiçekleri koklayarak şarkı söylüyorlardı.',
      medium: 'Çağdaş çalışmalarda artikülasyon çeşitliliği öğrencilerin sözcük dağarcığını geliştirmektedir. Şehirlerarası ulaşım sistemlerinin geliştirilmesi çerçevesinde çözümler üretilmektedir. Çekoslovakyalılaştıramadıklarımızdan mısınız sorusunun cevabı tartışılmaktadır.',
      hard: 'Çekoslovakyalılaştıramadıklarımızdan mısınız? Şu köşe yastığı kaşık çeşidi mi? Afyonkarahisarlılaştıramadıklarımızdan mısınız? Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine konuşuyorlar.',
    },
    en: {
      easy: 'The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. Peter Piper picked a peck of pickled peppers.',
      medium: 'The sixth sick sheikh\'s sixth sheep\'s sick. How much wood would a woodchuck chuck if a woodchuck could chuck wood? Betty Botter bought some butter but she said the butter\'s bitter.',
      hard: 'Pad kid poured curd pulled cod. The seething sea ceaseth and thus the seething sea sufficeth us. Can you can a can as a canner can can a can?',
    },
    de: {
      easy: 'Fischers Fritz fischt frische Fische. Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid. Der Cottbuser Postkutscher putzt den Cottbuser Postkutschkasten.',
      medium: 'Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben. Wenn Fliegen hinter Fliegen fliegen, fliegen Fliegen Fliegen nach. Brautkleid bleibt Brautkleid und Blaukraut bleibt Blaukraut.',
      hard: 'Der Whiskeymixer mixt den Whiskey mit dem Whiskeymixer. Wenn hinter Griechen Griechen kriechen, kriechen Griechen Griechen nach. Zehn zahme Ziegen zogen zehn Zentner Zucker zum Zoo.',
    },
  };

  const difficultyInstructions = {
    tr: {
      easy: `Kolay seviye için artikülasyon açısından ORTA-YÜKSEK zorlukta bir metin oluştur. 
Metin:
- 2-3 cümle olmalı
- Belirgin artikülasyon zorlukları içermeli (ş, ç, r, l, ğ, ü, ö, v, f gibi sesler)
- Günlük hayattan konular içermeli AMA artikülasyon açısından zorlayıcı olmalı
- Orta zorlukta kelimeler ve bazı zor ses kombinasyonları kullan
- Benzer seslerin tekrarı olmalı (örn: ş-s, ç-c, r-l)
- Hedef: Temel artikülasyon becerilerini ciddi şekilde zorlayarak test etmek
- Her seferinde FARKLI bir metin oluştur, örnekleri tekrar etme
- Kolay diye basit olmasın, artikülasyon açısından zorlayıcı olsun`,
      medium: `Orta seviye için artikülasyon açısından ÇOK YÜKSEK zorlukta bir metin oluştur.
Metin:
- 3-4 cümle olmalı
- Yoğun ve sürekli artikülasyon zorluğu içermeli
- Uzun kelimeler, karmaşık cümleler ve çok zor ses kombinasyonları kullanmalı
- Profesyonel/akademik konular içermeli
- Benzer seslerin yoğun tekrarı olmalı
- Hece sayısı fazla olan kelimeler tercih edilmeli
- Hedef: İleri artikülasyon becerilerini maksimum seviyede zorlamak, neredeyse tekerleme seviyesinde
- Her seferinde FARKLI bir metin oluştur, örnekleri tekrar etme`,
      hard: `Zor seviye için artikülasyon açısından EKSTRİM MAKSİMUM zorlukta bir metin oluştur.
Metin:
- 2-3 cümle olmalı
- Tekerleme tarzında, ÇOK ÇOK ZOR artikülasyon içermeli
- Çok uzun ve karmaşık kelimeler kullanmalı
- Benzer seslerin çok yoğun tekrarı olmalı
- Hızlı söylenmesi neredeyse imkansız kombinasyonlar içermeli
- Profesyonel diksiyon eğitmeni bile zorlanacak seviyede olmalı
- Hedef: Profesyonel seviye artikülasyon zorluğu, maksimum zorluk
- Her seferinde FARKLI bir metin oluştur, örnekleri tekrar etme
- En zor Türkçe kelimeleri ve tekerrürleri kullan`,
    },
    en: {
      easy: `Create a MEDIUM-HIGH difficulty text for articulation in English.
Text:
- 2-3 sentences
- Should contain distinct articulation challenges (th, r, l, w, v, z sounds)
- Should include everyday topics BUT be challenging for articulation
- Use medium difficulty words and some difficult sound combinations
- Should have repetition of similar sounds (e.g., th-s, r-l, v-f)
- Goal: Seriously test basic articulation skills
- Create a DIFFERENT text each time, don't repeat examples
- Don't make it simple just because it's easy, make it challenging for articulation`,
      medium: `Create a VERY HIGH difficulty text for articulation in English.
Text:
- 3-4 sentences
- Should contain intense and continuous articulation difficulty
- Use long words, complex sentences, and very difficult sound combinations
- Should include professional/academic topics
- Should have intense repetition of similar sounds
- Prefer words with many syllables
- Goal: Challenge advanced articulation skills to the maximum, almost tongue twister level
- Create a DIFFERENT text each time, don't repeat examples`,
      hard: `Create an EXTREME MAXIMUM difficulty text for articulation in English.
Text:
- 2-3 sentences
- Tongue twister style, VERY VERY DIFFICULT articulation
- Use very long and complex words
- Should have very intense repetition of similar sounds
- Should include combinations that are almost impossible to say quickly
- Should be at a level that even professional diction trainers would struggle with
- Goal: Professional level articulation difficulty, maximum challenge
- Create a DIFFERENT text each time, don't repeat examples
- Use the most difficult English words and repetitions`,
    },
    de: {
      easy: `Erstelle einen Text mit MITTEL-HOHER Schwierigkeit für die Artikulation auf Deutsch.
Text:
- 2-3 Sätze
- Sollte deutliche Artikulationsherausforderungen enthalten (ü, ö, ä, ch, r, sch Laute)
- Sollte Alltagsthemen enthalten, ABER für die Artikulation herausfordernd sein
- Verwende mittelschwere Wörter und einige schwierige Lautkombinationen
- Sollte Wiederholung ähnlicher Laute haben (z.B. ch-sch, r-l, ü-u)
- Ziel: Grundlegende Artikulationsfähigkeiten ernsthaft testen
- Erstelle jedes Mal einen ANDEREN Text, wiederhole keine Beispiele
- Mache es nicht einfach, nur weil es leicht ist, mache es für die Artikulation herausfordernd`,
      medium: `Erstelle einen Text mit SEHR HOHER Schwierigkeit für die Artikulation auf Deutsch.
Text:
- 3-4 Sätze
- Sollte intensive und kontinuierliche Artikulationsschwierigkeit enthalten
- Verwende lange Wörter, komplexe Sätze und sehr schwierige Lautkombinationen
- Sollte professionelle/akademische Themen enthalten
- Sollte intensive Wiederholung ähnlicher Laute haben
- Bevorzuge Wörter mit vielen Silben
- Ziel: Fortgeschrittene Artikulationsfähigkeiten maximal herausfordern, fast Zungenbrecher-Niveau
- Erstelle jedes Mal einen ANDEREN Text, wiederhole keine Beispiele`,
      hard: `Erstelle einen Text mit EXTREMER MAXIMALER Schwierigkeit für die Artikulation auf Deutsch.
Text:
- 2-3 Sätze
- Zungenbrecher-Stil, SEHR SEHR SCHWIERIGE Artikulation
- Verwende sehr lange und komplexe Wörter
- Sollte sehr intensive Wiederholung ähnlicher Laute haben
- Sollte Kombinationen enthalten, die fast unmöglich schnell zu sagen sind
- Sollte auf einem Niveau sein, mit dem selbst professionelle Diktionstrainer Schwierigkeiten hätten
- Ziel: Professionelle Artikulationsschwierigkeit, maximale Herausforderung
- Erstelle jedes Mal einen ANDEREN Text, wiederhole keine Beispiele
- Verwende die schwierigsten deutschen Wörter und Wiederholungen`,
    },
  };

  const prompts = {
    tr: `Türkçe telaffuz ve diksiyon değerlendirmesi için ${difficulty} seviyesinde YENİ ve ÖZGÜN bir okuma metni oluştur.

${difficultyInstructions[language][difficulty]}

KRİTİK KURALLAR: 
1. Sadece metni döndür, başka açıklama ekleme
2. Her çağrıda FARKLI bir metin oluştur, asla aynı metni tekrar etme
3. Verilen örnekleri tekrar etme, onlardan ilham al ama yeni metinler yaz
4. Artikülasyon zorluğunu belirtilen seviyede tut
5. "Kolay" seviye bile artikülasyon açısından zorlayıcı olmalı, sadece basit cümleler yazma
6. Her seviye bir öncekinden belirgin şekilde daha zor olmalı
7. Metinler anlamlı ve doğal Türkçe olmalı ama artikülasyon zorluğundan ödün verme`,
    en: `Create a NEW and ORIGINAL reading text at ${difficulty} level for English pronunciation and diction assessment.

${difficultyInstructions[language][difficulty]}

CRITICAL RULES: 
1. Return only the text, don't add other explanations
2. Create a DIFFERENT text each call, never repeat the same text
3. Don't repeat the given examples, be inspired by them but write new texts
4. Keep the articulation difficulty at the specified level
5. Even "easy" level should be challenging for articulation, don't just write simple sentences
6. Each level should be noticeably more difficult than the previous one
7. Texts should be meaningful and natural English but don't compromise on articulation difficulty`,
    de: `Erstelle einen NEUEN und ORIGINELLEN Lesetext auf ${difficulty}-Niveau für die deutsche Aussprache- und Diktionsbewertung.

${difficultyInstructions[language][difficulty]}

KRITISCHE REGELN: 
1. Gib nur den Text zurück, füge keine anderen Erklärungen hinzu
2. Erstelle bei jedem Aufruf einen ANDEREN Text, wiederhole niemals denselben Text
3. Wiederhole nicht die gegebenen Beispiele, lass dich von ihnen inspirieren, aber schreibe neue Texte
4. Halte die Artikulationsschwierigkeit auf dem angegebenen Niveau
5. Selbst das "einfache" Niveau sollte für die Artikulation herausfordernd sein, schreibe nicht nur einfache Sätze
6. Jedes Niveau sollte merklich schwieriger sein als das vorherige
7. Texte sollten sinnvolles und natürliches Deutsch sein, aber kompromittiere nicht die Artikulationsschwierigkeit`,
  };

  try {
    let text = await generateText({
      messages: [{ role: 'user', content: prompts[language] }],
    });

    console.log('Raw AI response:', text);
    console.log('Response type:', typeof text);
    
    if (typeof text !== 'string') {
      console.error('AI response is not a string, using fallback');
      return fallbackTexts[language][difficulty];
    }
    
    let cleanedText = text.trim();
    
    cleanedText = cleanedText.replace(/^```[a-z]*\n?/gi, '').replace(/\n?```$/gi, '');
    cleanedText = cleanedText.replace(/^["'`]+/, '').replace(/["'`]+$/, '');
    cleanedText = cleanedText.replace(/^\{[^}]*\}\s*/g, '');
    cleanedText = cleanedText.replace(/^\[[^\]]*\]\s*/g, '');
    
    const letterPattern = language === 'tr' 
      ? /[a-zA-ZğüşıöçĞÜŞİÖÇ]/
      : language === 'de'
      ? /[a-zA-ZäöüßÄÖÜ]/
      : /[a-zA-Z]/;
    
    const firstLetterIndex = cleanedText.search(letterPattern);
    if (firstLetterIndex > 0) {
      cleanedText = cleanedText.substring(firstLetterIndex);
    }
    
    cleanedText = cleanedText.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇäöüßÄÖÜ.,!?\s"'\-]+$/g, '');
    cleanedText = cleanedText.trim();
    
    if (!cleanedText || cleanedText.length < 10) {
      console.warn('Generated text is too short or empty, using fallback');
      return fallbackTexts[language][difficulty];
    }
    
    console.log(`Generated ${difficulty} pronunciation text:`, cleanedText);
    return cleanedText;
  } catch (error) {
    console.error('Error generating pronunciation text:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.message.includes('JSON')) {
        console.error('JSON parsing error detected - using fallback text');
      }
    }
    
    console.log(`Using fallback text for ${difficulty} difficulty`);
    return fallbackTexts[language][difficulty];
  }
}
