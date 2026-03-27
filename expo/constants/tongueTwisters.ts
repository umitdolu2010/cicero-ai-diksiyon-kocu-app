export type TongueTwisterLevel = 'easy' | 'medium' | 'hard';

export interface TongueTwister {
  id: string;
  text: string;
  syllables: string[];
  level: TongueTwisterLevel;
  category: string;
}

export const tongueTwisters: TongueTwister[] = [
  {
    id: 'easy-1',
    text: 'Şu köşe yaz köşesi',
    syllables: ['Şu', 'kö-şe', 'yaz', 'kö-şe-si'],
    level: 'easy',
    category: 'Sesli Harfler',
  },
  {
    id: 'easy-2',
    text: 'Kara kedi kara kapıda',
    syllables: ['Ka-ra', 'ke-di', 'ka-ra', 'ka-pı-da'],
    level: 'easy',
    category: 'K Sesi',
  },
  {
    id: 'easy-3',
    text: 'Bir berber bir berbere',
    syllables: ['Bir', 'ber-ber', 'bir', 'ber-be-re'],
    level: 'easy',
    category: 'B ve R Sesi',
  },
  {
    id: 'easy-4',
    text: 'Sana sanane bana banane',
    syllables: ['Sa-na', 'sa-na-ne', 'ba-na', 'ba-na-ne'],
    level: 'easy',
    category: 'S ve B Sesi',
  },
  {
    id: 'easy-5',
    text: 'Dere tepe düz gider',
    syllables: ['De-re', 'te-pe', 'düz', 'gi-der'],
    level: 'easy',
    category: 'D ve T Sesi',
  },
  {
    id: 'medium-1',
    text: 'Şu köşe yaz köşesi, bu köşe kış köşesi',
    syllables: ['Şu', 'kö-şe', 'yaz', 'kö-şe-si', 'bu', 'kö-şe', 'kış', 'kö-şe-si'],
    level: 'medium',
    category: 'Sesli Harfler',
  },
  {
    id: 'medium-2',
    text: 'Kara kedi kara kapıda kara kaplumbağa bekler',
    syllables: ['Ka-ra', 'ke-di', 'ka-ra', 'ka-pı-da', 'ka-ra', 'kap-lum-ba-ğa', 'bek-ler'],
    level: 'medium',
    category: 'K Sesi',
  },
  {
    id: 'medium-3',
    text: 'Bir berber bir berbere gel beraber bir berber dükkânı açalım',
    syllables: ['Bir', 'ber-ber', 'bir', 'ber-be-re', 'gel', 'be-ra-ber', 'bir', 'ber-ber', 'dük-kâ-nı', 'a-ça-lım'],
    level: 'medium',
    category: 'B ve R Sesi',
  },
  {
    id: 'medium-4',
    text: 'Çatal dilli çatal yılan çatal dille çatal çatal',
    syllables: ['Ça-tal', 'dil-li', 'ça-tal', 'yı-lan', 'ça-tal', 'dil-le', 'ça-tal', 'ça-tal'],
    level: 'medium',
    category: 'Ç Sesi',
  },
  {
    id: 'medium-5',
    text: 'Şu tepedeki şapkacı şapka yapıp şapka satar',
    syllables: ['Şu', 'te-pe-de-ki', 'şap-ka-cı', 'şap-ka', 'ya-pıp', 'şap-ka', 'sa-tar'],
    level: 'medium',
    category: 'Ş Sesi',
  },
  {
    id: 'hard-1',
    text: 'Şu köşe yaz köşesi, bu köşe kış köşesi, ortadaki köşe ne köşe',
    syllables: ['Şu', 'kö-şe', 'yaz', 'kö-şe-si', 'bu', 'kö-şe', 'kış', 'kö-şe-si', 'or-ta-da-ki', 'kö-şe', 'ne', 'kö-şe'],
    level: 'hard',
    category: 'Sesli Harfler',
  },
  {
    id: 'hard-2',
    text: 'Kartal kalkar dal sarkar, dal sarkar kartal kalkar',
    syllables: ['Kar-tal', 'kal-kar', 'dal', 'sar-kar', 'dal', 'sar-kar', 'kar-tal', 'kal-kar'],
    level: 'hard',
    category: 'K ve R Sesi',
  },
  {
    id: 'hard-3',
    text: 'Çarşı pazar sapa sarkar, sapa sarkar çarşı pazar',
    syllables: ['Çar-şı', 'pa-zar', 'sa-pa', 'sar-kar', 'sa-pa', 'sar-kar', 'çar-şı', 'pa-zar'],
    level: 'hard',
    category: 'Ç ve S Sesi',
  },
  {
    id: 'hard-4',
    text: 'Şu tepedeki şapkacı şapka yapıp şapka satmazsa şapkacılıktan vazgeçer',
    syllables: ['Şu', 'te-pe-de-ki', 'şap-ka-cı', 'şap-ka', 'ya-pıp', 'şap-ka', 'sat-maz-sa', 'şap-ka-cı-lık-tan', 'vaz-ge-çer'],
    level: 'hard',
    category: 'Ş Sesi',
  },
  {
    id: 'hard-5',
    text: 'Postacının postası pasta mı, pastanın pastası posta mı',
    syllables: ['Pos-ta-cı-nın', 'pos-ta-sı', 'pas-ta', 'mı', 'pas-ta-nın', 'pas-ta-sı', 'pos-ta', 'mı'],
    level: 'hard',
    category: 'P ve S Sesi',
  },
];

export const getTongueTwistersByLevel = (level: TongueTwisterLevel): TongueTwister[] => {
  return tongueTwisters.filter(tt => tt.level === level);
};
