export interface ExerciseTemplate {
  title: string;
  instruction: string;
  duration: string;
}

export type ExerciseTemplateMap = Record<string, Record<string, ExerciseTemplate[]>>;

export const exerciseTemplates: ExerciseTemplateMap = {
  tr: {
    'breathing': [
      { title: 'Derin Nefes', instruction: 'Derin nefes alın, 5 saniye tutun, yavaşça verin. 5 kez tekrarlayın.', duration: '2 dakika' },
      { title: 'Karın Nefesi', instruction: 'Elinizi karnınıza koyun. Nefes alırken karnınızın şiştiğini hissedin. 10 kez tekrarlayın.', duration: '3 dakika' },
      { title: 'Nefes Kontrolü', instruction: 'Nefes alın ve "sssss" sesi çıkararak yavaşça verin. Mümkün olduğunca uzun tutun.', duration: '2 dakika' },
    ],
    'vowels': [
      { title: 'Sesli Harf Tekrarı', instruction: 'A-E-I-İ-O-Ö-U-Ü harflerini sırayla, ağzınızı açarak ve net söyleyin. 5 kez tekrarlayın.', duration: '3 dakika' },
      { title: 'Sesli Harf Kombinasyonları', instruction: 'AE-AI-AO-AU kombinasyonlarını yavaşça söyleyin. Her birini 3 kez tekrarlayın.', duration: '2 dakika' },
    ],
    'consonants': [
      { title: 'Sessiz Harf Artikülasyonu', instruction: 'B-C-Ç-D harflerini tek tek, güçlü ve net söyleyin. Her harfi 5 kez tekrarlayın.', duration: '3 dakika' },
      { title: 'Harf Kombinasyonları', instruction: 'BA-BE-BI-BO-BU hecelerini hızlı ve net söyleyin. 3 kez tekrarlayın.', duration: '2 dakika' },
    ],
    'tongue-twisters': [
      { title: 'Dal sarkar kartal kalkar', instruction: 'Bu tekerlemeyi önce yavaş, sonra hızlanarak 5 kez söyleyin. Eğer diliniz dönmüyorsa mutlaka diksiyon kalemi ile heceleri artiküle edin.', duration: '3 dakika' },
      { title: 'Şu köşe yaz köşesi', instruction: '"Şu köşe yaz köşesi, şu köşe kış köşesi" tekrarla. Eğer diliniz dönmüyorsa mutlaka diksiyon kalemi ile heceleri artiküle edin.', duration: '2 dakika' },
    ],
    'articulation': [
      { title: 'Dudak Egzersizi', instruction: 'Dudaklarınızı öne doğru uzatın, sonra geniş bir şekilde gülümseyin. 10 kez tekrarlayın.', duration: '2 dakika' },
      { title: 'Çene Gevşetme', instruction: 'Çenenizi yavaşça açın ve kapatın. Gerginlik hissetmeden 15 kez tekrarlayın.', duration: '2 dakika' },
    ],
  },
  en: {
    'breathing': [
      { title: 'Deep Breathing', instruction: 'Take a deep breath, hold for 5 seconds, release slowly. Repeat 5 times.', duration: '2 minutes' },
      { title: 'Diaphragmatic Breathing', instruction: 'Place your hand on your belly. Feel it rise as you breathe in. Repeat 10 times.', duration: '3 minutes' },
      { title: 'Breath Control', instruction: 'Breathe in and slowly release while making an "sssss" sound. Hold as long as possible.', duration: '2 minutes' },
    ],
    'vowels': [
      { title: 'Vowel Repetition', instruction: 'Say A-E-I-O-U clearly, opening your mouth wide. Repeat 5 times.', duration: '3 minutes' },
      { title: 'Vowel Combinations', instruction: 'Say AE-AI-AO-AU combinations slowly. Repeat each 3 times.', duration: '2 minutes' },
    ],
    'consonants': [
      { title: 'Consonant Articulation', instruction: 'Say B-C-D-F letters one by one, strong and clear. Repeat each 5 times.', duration: '3 minutes' },
      { title: 'Letter Combinations', instruction: 'Say BA-BE-BI-BO-BU syllables quickly and clearly. Repeat 3 times.', duration: '2 minutes' },
    ],
    'tongue-twisters': [
      { title: 'Peter Piper', instruction: 'Say "Peter Piper picked a peck of pickled peppers" slowly, then faster. Repeat 5 times.', duration: '3 minutes' },
      { title: 'She Sells Seashells', instruction: 'Repeat "She sells seashells by the seashore" clearly. Focus on the S sounds.', duration: '2 minutes' },
    ],
    'articulation': [
      { title: 'Lip Exercise', instruction: 'Extend your lips forward, then smile widely. Repeat 10 times.', duration: '2 minutes' },
      { title: 'Jaw Relaxation', instruction: 'Slowly open and close your jaw. Repeat 15 times without tension.', duration: '2 minutes' },
    ],
  },
  de: {
    'breathing': [
      { title: 'Tiefes Atmen', instruction: 'Atmen Sie tief ein, halten Sie 5 Sekunden, lassen Sie langsam los. 5 Mal wiederholen.', duration: '2 Minuten' },
      { title: 'Zwerchfellatmung', instruction: 'Legen Sie Ihre Hand auf den Bauch. Spüren Sie, wie er sich beim Einatmen hebt. 10 Mal wiederholen.', duration: '3 Minuten' },
    ],
    'vowels': [
      { title: 'Vokalwiederholung', instruction: 'Sagen Sie A-E-I-O-U deutlich mit geöffnetem Mund. 5 Mal wiederholen.', duration: '3 Minuten' },
    ],
    'consonants': [
      { title: 'Konsonantenartikulation', instruction: 'Sagen Sie B-C-D-F einzeln, stark und klar. Jeden Buchstaben 5 Mal wiederholen.', duration: '3 Minuten' },
    ],
    'tongue-twisters': [
      { title: 'Fischers Fritze', instruction: 'Sagen Sie "Fischers Fritze fischt frische Fische" langsam, dann schneller. 5 Mal wiederholen.', duration: '3 Minuten' },
    ],
    'articulation': [
      { title: 'Lippenübung', instruction: 'Strecken Sie die Lippen nach vorne, dann lächeln Sie breit. 10 Mal wiederholen.', duration: '2 Minuten' },
    ],
  },
};

export const motivationTipsTr = [
  'Kısa seanslar düzenli yapıldığında uzun seanslardan daha etkilidir. Günde 7 dakika bile büyük fark yaratabilir!',
  'Her gün düzenli çalışmak, haftada bir uzun seans yapmaktan daha etkilidir.',
  'Diksiyon çalışması yaparken ayna karşısında pratik yapmak artikülasyonunuzu geliştirir.',
  'Nefes kontrolü, güçlü ve net konuşmanın temelidir. Nefes egzersizlerine önem verin.',
  'Tekerleme çalışmaları dilinizi çevikleştirir ve telaffuzunuzu netleştirir.',
  'Sesli okuma yapmak hem diksiyon hem de özgüven gelişiminize katkı sağlar.',
  'Kendinizi kaydedip dinlemek, gelişim alanlarınızı fark etmenize yardımcı olur.',
  'Sabır ve düzenlilik, diksiyon gelişiminde en önemli iki faktördür.',
];

export const motivationTipsEn = [
  'Short sessions done regularly are more effective than long sessions. Even 7 minutes a day can make a big difference!',
  'Practicing every day is more effective than one long session per week.',
  'Practicing in front of a mirror while doing diction exercises improves your articulation.',
  'Breath control is the foundation of strong and clear speech. Pay attention to breathing exercises.',
  'Tongue twister exercises make your tongue more agile and clarify your pronunciation.',
  'Reading aloud contributes to both your diction and confidence development.',
  'Recording and listening to yourself helps you identify areas for improvement.',
  'Patience and consistency are the two most important factors in diction development.',
];

export const motivationTipsDe = [
  'Kurze Sitzungen, die regelmäßig durchgeführt werden, sind effektiver als lange Sitzungen. Schon 7 Minuten pro Tag können einen großen Unterschied machen!',
  'Jeden Tag zu üben ist effektiver als eine lange Sitzung pro Woche.',
  'Das Üben vor einem Spiegel während Diktionsübungen verbessert Ihre Artikulation.',
  'Atemkontrolle ist die Grundlage für starkes und klares Sprechen. Achten Sie auf Atemübungen.',
  'Zungenbrecher-Übungen machen Ihre Zunge beweglicher und klären Ihre Aussprache.',
  'Lautes Vorlesen trägt sowohl zu Ihrer Diktion als auch zu Ihrer Selbstvertrauen bei.',
  'Sich selbst aufzunehmen und anzuhören hilft Ihnen, Verbesserungsbereiche zu identifizieren.',
  'Geduld und Beständigkeit sind die zwei wichtigsten Faktoren in der Diktionsentwicklung.',
];

export function getMotivationTips(language: string): string[] {
  if (language === 'tr') return motivationTipsTr;
  if (language === 'en') return motivationTipsEn;
  return motivationTipsDe;
}

export const turkishVowels = ['A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü'];
export const turkishConsonants = ['B', 'C', 'Ç', 'D', 'F', 'G', 'Ğ', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'Ş', 'T', 'V', 'Y', 'Z'];
