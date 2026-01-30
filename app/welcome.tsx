import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Mail, ShoppingCart, Play, Pause, Square, Volume2, VolumeX } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const { login, activatePremium, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [activationCode, setActivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [VideoComponent, setVideoComponent] = useState<React.ComponentType<any> | null>(null);
  const [ResizeMode, setResizeMode] = useState<any>(null);
  const videoRef = React.useRef<any>(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const av = await import('expo-av');
        setVideoComponent(() => av.Video);
        setResizeMode(av.ResizeMode);
      } catch (error) {
        console.log('Video loading error:', error);
      }
    };
    loadVideo();
  }, []);

  if (authLoading) {
    return (
      <View style={[styles.backgroundWrapper, { backgroundColor: Colors.gradient.start }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const handleActivationCode = async () => {
    if (!activationCode.trim()) {
      Alert.alert('Hata', 'Lütfen aktivasyon kodunu girin');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const email = `user_${Date.now()}@cicero.app`;
      await login(email, 'activation', 'Kullanıcı');
      await activatePremium(365);
      
      Alert.alert('Başarılı', 'Aktivasyon kodu onaylandı! Premium hesabınız aktif.', [
        { text: 'Tamam', onPress: () => router.replace('/intro-videos' as any) }
      ]);
    } catch {
      Alert.alert('Hata', 'Aktivasyon kodu geçersiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsVideoPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsVideoPlaying(true);
      }
    }
  };

  const handleStop = async () => {
    if (!videoRef.current) return;
    await videoRef.current.stopAsync();
    await videoRef.current.setPositionAsync(0);
    setIsVideoPlaying(false);
  };

  const handleMuteToggle = async () => {
    if (!videoRef.current) return;
    const newMutedState = !isVideoMuted;
    await videoRef.current.setIsMutedAsync(newMutedState);
    setIsVideoMuted(newMutedState);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.backgroundWrapper, { backgroundColor: Colors.gradient.start }]}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
          showsVerticalScrollIndicator={false}
        >

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {VideoComponent && ResizeMode ? (
              <View style={styles.videoPlayerContainer}>
                <VideoComponent
                  ref={videoRef}
                  source={{ uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
                  style={styles.videoPlayer}
                  resizeMode={ResizeMode.CONTAIN}
                  isMuted={isVideoMuted}
                  onPlaybackStatusUpdate={(status: any) => {
                    if (status.isLoaded) {
                      setIsVideoPlaying(status.isPlaying);
                      if (status.didJustFinish) {
                        setIsVideoPlaying(false);
                      }
                    }
                  }}
                />
                <View style={styles.videoControlsOverlay}>
                  <TouchableOpacity
                    style={styles.videoControlButton}
                    onPress={handlePlayPause}
                  >
                    {isVideoPlaying ? (
                      <Pause size={20} color="#FFFFFF" fill="#FFFFFF" />
                    ) : (
                      <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.videoControlButton}
                    onPress={handleStop}
                  >
                    <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.videoControlButton}
                    onPress={handleMuteToggle}
                  >
                    {isVideoMuted ? (
                      <VolumeX size={20} color="#FFFFFF" />
                    ) : (
                      <Volume2 size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.videoPlayerContainer, styles.videoPlaceholder]}>
                <Play size={48} color="rgba(255,255,255,0.5)" />
              </View>
            )}
            <Text style={styles.logo}>Cicero</Text>
            <Text style={styles.tagline}>Sadece Konuşma, Etkile!</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Cicero Diksiyon Kalemi AI Diksiyon Koç uygulamasına
            </Text>
            <Text style={styles.welcomeTitle}>HOŞGELDİNİZ</Text>
          </View>

          <View style={styles.optionsContainer}>
            <View style={styles.activationSection}>
              <Text style={styles.activationLabel}>Aktivasyon Kodu ile Giriş</Text>
              <View style={styles.activationInputRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Kodu girin"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={activationCode}
                  onChangeText={setActivationCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.activateButton}
                  onPress={handleActivationCode}
                  disabled={isLoading}
                >
                  <Text style={styles.activateButtonText}>Aktive Et</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => router.push('/login' as any)}
            >
              <View style={styles.optionIcon}>
                <Mail size={22} color={Colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>E-posta ile Giriş</Text>
                <Text style={styles.optionDescription}>Hesabınız varsa giriş yapın</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.purchaseSection}>
              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={() => router.push('/checkout' as any)}
              >
                <ShoppingCart size={20} color="#FFFFFF" />
                <Text style={styles.purchaseButtonText}>Diksiyon Kalemini Satın Al</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push('/product-info' as any)}>
              <Text style={styles.footerLink}>Ürün Hakkında Bilgi Al</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 0,
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  videoPlayerContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 16,
    position: 'relative',
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoControlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  videoControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.text,
  },
  content: {
    padding: 24,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  activationSection: {
    gap: 8,
  },
  activationLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activationInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '500' as const,
  },
  activateButton: {
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 14,
    borderWidth: 0,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  purchaseSection: {
    gap: 12,
    marginTop: 8,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
