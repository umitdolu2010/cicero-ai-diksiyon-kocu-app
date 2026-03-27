import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  Star,
  Package,
  Truck,
  Shield,
  Crown,
  Key,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function ProductInfoScreen() {
  const router = useRouter();
  const { activateProduct } = useAuth();
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const features = [
    'Patentli ergonomik tasarım',
    'Dil ve dudak kaslarını güçlendirir',
    'Artikülasyon hassasiyetini artırır',
    'Profesyonel eğitmenler tarafından önerilir',
    'Tıbbi silikon malzeme',
  ];

  const handleActivateProduct = async () => {
    if (!activationCode.trim()) {
      return;
    }
    setIsActivating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await activateProduct();
    setIsActivating(false);
    router.back();
  };

  const handleBuyPen = () => {
    Linking.openURL('https://www.diksiyonkalemi.com/cart-page?appSectionParams=%7B%22origin%22%3A%22wixcode%22%7D');
  };

  const handleBuyAI = () => {
    router.push('/premium-welcome' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cicero Diksiyon Kalemi',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.textInverse,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle, Colors.gradient.end]}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/mfat1y8k105az408w13r5' }}
              style={styles.productImageLarge}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Cicero Diksiyon Kalemi</Text>
            <Text style={styles.heroSubtitle}>
              Profesyonel diksiyon eğitiminin vazgeçilmez aparatı
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.ratingBox}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={20} color={Colors.accent} fill={Colors.accent} />
              ))}
            </View>
            <Text style={styles.ratingText}>5.0 - 2,500+ Memnun Kullanıcı</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Özellikler</Text>
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Check size={18} color={Colors.success} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Neden Cicero Diksiyon Kalemi?</Text>
            <Text style={styles.description}>
              Cicero Diksiyon Kalemi, artikülasyon egzersizlerinin etkinliğini %300
              artırır. Dil ve dudak kaslarınızı hedefli olarak çalıştırarak, telaffuz
              netliğinizi kısa sürede geliştirir.
            </Text>
            <Text style={styles.description}>
              Uygulama içindeki egzersizlerle birlikte kullanıldığında, sonuçlarınızı
              daha hızlı görebilirsiniz.
            </Text>
          </View>

          <View style={styles.benefitsBox}>
            <View style={styles.benefitItem}>
              <Truck size={24} color={Colors.primary} />
              <Text style={styles.benefitTitle}>Hızlı Kargo</Text>
              <Text style={styles.benefitText}>2-3 gün içinde kapınızda</Text>
            </View>
            <View style={styles.benefitItem}>
              <Shield size={24} color={Colors.primary} />
              <Text style={styles.benefitTitle}>Garanti</Text>
              <Text style={styles.benefitText}>2 yıl üretici garantisi</Text>
            </View>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Özel Fiyat</Text>
            <Text style={styles.price}>₺1.899</Text>
            <Text style={styles.priceNote}>+ KDV - Kargo Dahil</Text>
          </View>

          <View style={styles.purchaseSection}>
            <View style={styles.purchaseButtons}>
              <TouchableOpacity style={styles.purchaseButton} onPress={handleBuyPen}>
                <Package size={18} color={Colors.textInverse} />
                <Text style={styles.purchaseButtonText}>Diksiyon Kalemi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.purchaseButton, styles.aiButton]} onPress={handleBuyAI}>
                <Crown size={18} color={Colors.textInverse} />
                <Text style={styles.purchaseButtonText}>Cicero AI Koç</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activationBox}>
            <View style={styles.activationHeader}>
              <Key size={20} color={Colors.primary} />
              <Text style={styles.activationTitle}>Aktivasyon Kodu</Text>
            </View>
            <Text style={styles.activationDesc}>Ürün aktivasyon kodunuz varsa girin</Text>
            <View style={styles.activationRow}>
              <TextInput
                style={styles.activationInput}
                placeholder="Aktivasyon kodu"
                placeholderTextColor={Colors.textSecondary}
                value={activationCode}
                onChangeText={setActivationCode}
                autoCapitalize="characters"
                editable={!isActivating}
              />
              <TouchableOpacity
                style={styles.activateButton}
                onPress={handleActivateProduct}
                disabled={isActivating || !activationCode.trim()}
              >
                <Text style={styles.activateButtonText}>
                  {isActivating ? '...' : 'Aktive Et'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  productImageLarge: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textInverse,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  ratingBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  benefitsBox: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  benefitItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  priceBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  purchaseSection: {
    marginBottom: 20,
  },
  purchaseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  purchaseButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  aiButton: {
    backgroundColor: Colors.premium.gold,
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
  activationBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  activationDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  activationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  activationInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textInverse,
  },
});
