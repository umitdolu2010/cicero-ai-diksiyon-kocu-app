import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Gift, Crown, Check } from 'lucide-react-native';
import { TextInput } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

import { useTranslation } from '@/constants/translations';
import { lightTheme, darkTheme } from '@/constants/colors';
import { haptics } from '@/utils/haptics';

type PlanType = 'trial' | 'monthly' | 'yearly' | 'lifetime';

export default function PremiumWelcomeScreen() {
  const router = useRouter();
  const { language, theme } = useApp();
  const { user } = useAuth();
  const t = useTranslation(language);
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const handleStartTrial = async () => {
    haptics.success();
    router.replace('/(tabs)/home' as any);
  };

  const handleShareLink = async () => {
    haptics.light();
    router.replace('/(tabs)/home' as any);
  };

  const handleContinueFree = async () => {
    haptics.light();
    router.replace('/(tabs)/home' as any);
  };

  const handleRestorePurchase = async () => {
    haptics.light();
    console.log('Restore purchase');
  };

  const plans = [
    {
      id: 'monthly' as PlanType,
      name: t.premium.monthly,
      price: '₺99',
      period: '/ay',
      popular: false,
    },
    {
      id: 'yearly' as PlanType,
      name: t.premium.yearly,
      price: '₺599',
      period: '/yıl',
      popular: true,
      badge: t.premium.save,
    },
    {
      id: 'lifetime' as PlanType,
      name: t.premium.lifetime,
      price: '₺1.999',
      period: '',
      popular: false,
    },
  ];

  const handleBuyProduct = () => {
    haptics.success();
    const url = 'https://www.diksiyonkalemi.com/cart-page?appSectionParams=%7B%22origin%22%3A%22wixcode%22%7D';
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handleBuyPen = () => {
    haptics.success();
    router.push('/checkout' as any);
  };

  const handleBuyAI = () => {
    haptics.success();
    router.push('/product-info' as any);
  };

  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const handleActivateCode = async () => {
    if (!activationCode.trim()) {
      return;
    }
    setIsActivating(true);
    haptics.light();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsActivating(false);
    haptics.success();
  };

  const features = [
    { icon: Check, text: t.premium.unlimitedExercises },
    { icon: Check, text: t.premium.aiCoaching },
    { icon: Check, text: t.premium.advancedAnalytics },
    { icon: Check, text: t.premium.offlineMode },
    { icon: Check, text: t.premium.prioritySupport },
    { icon: Check, text: t.premium.noAds },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <Sparkles size={48} color={colors.textInverse} strokeWidth={2} />
            <Text style={[styles.title, { color: colors.textInverse }]}>
              Hoş Geldin{user?.name ? `, ${user.name}` : ''}!
            </Text>
            <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.95)' }]}>
              Profesyonel diksiyon eğitimine başlamak için aşağıdaki seçeneklerden birini kullanın ve Cicero Diksiyon Kalemi ile daha etkili sonuçlar alın.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Gift size={24} color={colors.secondary} strokeWidth={2} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Bizi Tavsiye Edin
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Uygulamayı satın alan arkadaşlarınıza özel %15 indirim kodu paylaşın. Onlar kazansın, siz de kazanın!
            </Text>
            <TouchableOpacity
              style={[styles.minimalButton, { backgroundColor: colors.secondary }]}
              onPress={handleShareLink}
              activeOpacity={0.8}
            >
              <Text style={[styles.minimalButtonText, { color: colors.textInverse }]}>
                İndirim Linki Paylaş
              </Text>
            </TouchableOpacity>
          </View>



          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Crown size={24} color={colors.premium.gold} strokeWidth={2} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Ürün Satın Al
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Cicero Diksiyon Kalemi veya AI Koçluk hizmetini satın alın
            </Text>

            <View style={styles.productButtons}>
              <TouchableOpacity
                style={[styles.productButton, { backgroundColor: colors.primary }]}
                onPress={handleBuyPen}
                activeOpacity={0.8}
              >
                <Text style={[styles.productButtonText, { color: colors.textInverse }]}>
                  Diksiyon Kalemi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.productButton, { backgroundColor: colors.premium.gold }]}
                onPress={handleBuyAI}
                activeOpacity={0.8}
              >
                <Text style={[styles.productButtonText, { color: colors.textInverse }]}>
                  Cicero AI Koç
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Crown size={24} color={colors.premium.gold} strokeWidth={2} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Aktivasyon Kodu
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Ürün aktivasyon kodunuz varsa girin
            </Text>
            <View style={styles.activationRow}>
              <TextInput
                style={[styles.activationInput, { 
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="Aktivasyon kodu"
                placeholderTextColor={colors.textSecondary}
                value={activationCode}
                onChangeText={setActivationCode}
                autoCapitalize="characters"
                editable={!isActivating}
              />
              <TouchableOpacity
                style={[styles.activateButton, { backgroundColor: colors.primary }]}
                onPress={handleActivateCode}
                disabled={isActivating || !activationCode.trim()}
                activeOpacity={0.8}
              >
                <Text style={[styles.activateButtonText, { color: colors.textInverse }]}>
                  {isActivating ? '...' : 'Aktive Et'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Crown size={24} color={colors.premium.gold} strokeWidth={2} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {t.premium.purchase}
              </Text>
            </View>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {t.premium.purchaseDesc}
            </Text>

            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: selectedPlan === plan.id ? colors.primary : colors.border,
                      borderWidth: selectedPlan === plan.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    haptics.light();
                    setSelectedPlan(plan.id);
                  }}
                  activeOpacity={0.8}
                >
                  {plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: colors.premium.gold }]}>
                      <Text style={[styles.popularBadgeText, { color: colors.textInverse }]}>
                        {t.premium.mostPopular}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                  <View style={styles.planPriceContainer}>
                    <Text style={[styles.planPrice, { color: colors.primary }]}>
                      {plan.price}
                    </Text>
                    <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                      {plan.period}
                    </Text>
                  </View>
                  {plan.badge && (
                    <View style={[styles.saveBadge, { backgroundColor: colors.success }]}>
                      <Text style={[styles.saveBadgeText, { color: colors.textInverse }]}>
                        {plan.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.featuresContainer}>
              <Text style={[styles.featuresTitle, { color: colors.text }]}>
                {t.premium.features}
              </Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <feature.icon size={20} color={colors.success} strokeWidth={2.5} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.minimalButton, { backgroundColor: colors.premium.gold }]}
              onPress={handleBuyProduct}
              activeOpacity={0.8}
            >
              <Text style={[styles.minimalButtonText, { color: colors.textInverse }]}>
                {t.premium.purchase}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.textButton}
            onPress={handleRestorePurchase}
            activeOpacity={0.7}
          >
            <Text style={[styles.textButtonText, { color: colors.textSecondary }]}>
              {t.premium.restorePurchase}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textButton}
            onPress={handleContinueFree}
            activeOpacity={0.7}
          >
            <Text style={[styles.textButtonText, { color: colors.textLight }]}>
              {t.premium.continueFree}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  minimalButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  minimalButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  productButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  productButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  activationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  activationInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
  },
  activateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  planPeriod: {
    fontSize: 16,
  },
  saveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  saveBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
});
