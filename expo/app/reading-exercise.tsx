import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { RefreshCw, BookOpen, CheckCircle } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';
import * as Speech from 'expo-speech';

interface ReadingText {
  text: string;
  syllables: string;
  tips: string;
}

export default function ReadingExerciseScreen() {
  const router = useRouter();
  const { theme, language } = useApp();
  const { user } = useAuth();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const styles = createStyles(Colors);
  const [isGenerating, setIsGenerating] = useState(false);
  const [readingText, setReadingText] = useState<ReadingText | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const generateReadingText = async () => {
    setIsGenerating(true);
    
    try {
      const schema = z.object({
        text: z.string().describe('Kullanıcının okuyacağı metin (2-3 cümle, diksiyon için uygun)'),
        syllables: z.string().describe('Metnin hece hece ayrılmış hali'),
        tips: z.string().describe('Bu metni okurken dikkat edilmesi gerekenler'),
      });

      const userName = user?.name || 'Değerli kullanıcı';
      const prompt = `${userName} için Türkçe diksiyon egzersizi için okuma metni oluştur. Kullanıcının adını kullanarak samimi ve motive edici bir dil kullan.
      
Metin özellikleri:
- 2-3 cümle uzunluğunda
- Diksiyon gelişimi için uygun (zor sesler, hece yapıları içermeli)
- Anlamlı ve akıcı olmalı
- Heceleri yutmaya müsait kelimeler içermeli

Örnek:
{
  "text": "Şehrin merkezindeki müzede, müdür müzisyenlere müzikal bir sunum hazırladı.",
  "syllables": "Şeh-rin mer-ke-zin-de-ki mü-ze-de, mü-dür mü-zis-yen-le-re mü-zi-kal bir su-num ha-zır-la-dı.",
  "tips": "${userName}, Ş ve z seslerine dikkat edin. Heceleri atlamamaya özen gösterin."
}`;

      const result = await generateObject({
        messages: [{ role: 'user', content: prompt }],
        schema,
      });
      
      console.log('Generated reading text:', result);
      setReadingText(result);
    } catch (error) {
      console.error('Error generating reading text:', error);
      alert('Metin oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateReadingText();
  }, []);

  const handleRefresh = () => {
    setShowInstructions(true);
    setHasStarted(false);
    generateReadingText();
  };

  const handleStartReading = () => {
    setShowInstructions(false);
    setHasStarted(true);
    if (readingText) {
      const userName = user?.name || 'Değerli kullanıcı';
      const fullInstructions = `${userName}, şimdi metni okuyabilirsiniz. Hecelere dikkat edin. ${readingText.tips}`;
      Speech.speak(fullInstructions, {
        language: 'tr-TR',
        rate: 0.85,
      });
    }
  };

  const handleComplete = () => {
    const userName = user?.name || 'Değerli kullanıcı';
    Speech.speak(`Harika ${userName}! Egzersizi tamamladınız.`, {
      language: 'tr-TR',
      rate: 0.85,
    });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/exercises' as any);
    }
  };

  if (isGenerating || !readingText) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Okuma Egzersizi',
            headerStyle: { backgroundColor: Colors.accent },
            headerTintColor: '#FFFFFF',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Okuma metni hazırlanıyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Okuma Egzersizi',
          headerStyle: { backgroundColor: Colors.accent },
          headerTintColor: '#FFFFFF',
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showInstructions && !hasStarted && (
          <View style={styles.instructionsCard}>
            <View style={styles.instructionsHeader}>
              <BookOpen size={28} color={Colors.primary} />
              <Text style={styles.instructionsTitle}>Başlamadan Önce</Text>
            </View>
            
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Lütfen metni diksiyon kalemi ile bir kez sesli olarak okumaya çalışın.
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Her heceyi net bir şekilde telaffuz ederek okuyun.
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Bu çalışmayı birkaç kez tekrar edin. Her tekrarda daha akıcı olacaksınız.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleStartReading}>
              <Text style={styles.startButtonText}>Okumaya Başla</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasStarted && (
          <>
            <View style={styles.textCard}>
              <View style={styles.textHeader}>
                <Text style={styles.textLabel}>Okuyacağınız Metin</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                  <RefreshCw size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.mainText}>{readingText.text}</Text>
            </View>

            <View style={styles.syllablesCard}>
              <Text style={styles.syllablesLabel}>Hece Hece</Text>
              <Text style={styles.syllablesText}>{readingText.syllables}</Text>
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsLabel}>💡 Dikkat Edilmesi Gerekenler</Text>
              <Text style={styles.tipsText}>{readingText.tips}</Text>
            </View>

            <View style={styles.practiceCard}>
              <Text style={styles.practiceTitle}>Tekrar Edelim</Text>
              <Text style={styles.practiceText}>
                Bu metni birkaç kez tekrar edin. Her seferinde daha akıcı ve net olacaksınız. 
                Heceleri yutmamaya özen gösterin.
              </Text>
            </View>

            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <CheckCircle size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Egzersizi Tamamla</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.newTextButton} onPress={handleRefresh}>
              <RefreshCw size={20} color={Colors.primary} />
              <Text style={styles.newTextButtonText}>Yeni Metin Oluştur</Text>
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
  instructionsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
  },
  instructionsList: {
    gap: 20,
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 32,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  textCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 8,
  },
  mainText: {
    fontSize: 20,
    lineHeight: 32,
    color: colors.text,
    fontWeight: '500' as const,
  },
  syllablesCard: {
    backgroundColor: colors.borderLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  syllablesLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  syllablesText: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
    fontFamily: 'monospace',
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  tipsLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  practiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  completeButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  newTextButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  newTextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
