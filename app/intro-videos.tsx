import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Play, CheckCircle, ArrowRight, Pause, Square, Volume2, VolumeX } from 'lucide-react-native';
import { lightTheme, darkTheme } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

type VideoItem = {
  id: string;
  title: string;
  description: string;
  uri: string;
  duration: string;
};

const videos: VideoItem[] = [
  {
    id: '1',
    title: 'Diksiyon Kalemi Nasıl Kullanılır?',
    description: 'Cicero Diksiyon Kaleminin doğru kullanım tekniklerini öğrenin',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '3:45',
  },
  {
    id: '2',
    title: 'Isınma Hareketleri',
    description: 'Egzersizlere başlamadan önce yapmanız gereken ısınma hareketleri',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '5:20',
  },
];

export default function IntroVideosScreen() {
  const router = useRouter();
  const { theme } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, Video | null>>({});

  const handleVideoPress = (videoId: string) => {
    if (currentlyPlaying === videoId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(videoId);
      setWatchedVideos(prev => new Set([...prev, videoId]));
      setIsPlaying(prev => ({ ...prev, [videoId]: true }));
    }
  };

  const handlePlayPause = async (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    const status = await video.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await video.pauseAsync();
        setIsPlaying(prev => ({ ...prev, [videoId]: false }));
      } else {
        await video.playAsync();
        setIsPlaying(prev => ({ ...prev, [videoId]: true }));
      }
    }
  };

  const handleStop = async (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    await video.stopAsync();
    await video.setPositionAsync(0);
    setIsPlaying(prev => ({ ...prev, [videoId]: false }));
    setCurrentlyPlaying(null);
  };

  const handleMuteToggle = async (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    const newMutedState = !isMuted[videoId];
    await video.setIsMutedAsync(newMutedState);
    setIsMuted(prev => ({ ...prev, [videoId]: newMutedState }));
  };

  const handleContinue = () => {
    router.replace('/(tabs)/home' as any);
  };

  const allWatched = watchedVideos.size === videos.length;

  const styles = createStyles(Colors);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.middle]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Hoş Geldiniz! 🎉</Text>
          <Text style={styles.headerSubtitle}>
            Başlamadan önce bu kısa videoları izleyerek Cicero Diksiyon ile tanışın
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {videos.map((video, index) => (
            <View key={video.id} style={styles.videoCard}>
              <View style={styles.videoHeader}>
                <View style={styles.videoNumber}>
                  {watchedVideos.has(video.id) ? (
                    <CheckCircle size={24} color={Colors.success} />
                  ) : (
                    <Text style={styles.videoNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDescription}>{video.description}</Text>
                  <Text style={styles.videoDuration}>{video.duration}</Text>
                </View>
              </View>

              {currentlyPlaying === video.id ? (
                <View style={styles.videoContainer}>
                  <Video
                    ref={(ref) => {
                      videoRefs.current[video.id] = ref;
                    }}
                    source={{ uri: video.uri }}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                    isMuted={isMuted[video.id] || false}
                    onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                      if (status.isLoaded) {
                        setIsPlaying(prev => ({ ...prev, [video.id]: status.isPlaying }));
                        if (status.didJustFinish) {
                          setCurrentlyPlaying(null);
                          setIsPlaying(prev => ({ ...prev, [video.id]: false }));
                        }
                      }
                    }}
                  />
                  <View style={styles.videoControls}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handlePlayPause(video.id)}
                    >
                      {isPlaying[video.id] ? (
                        <Pause size={24} color={Colors.textInverse} fill={Colors.textInverse} />
                      ) : (
                        <Play size={24} color={Colors.textInverse} fill={Colors.textInverse} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handleStop(video.id)}
                    >
                      <Square size={24} color={Colors.textInverse} fill={Colors.textInverse} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={() => handleMuteToggle(video.id)}
                    >
                      {isMuted[video.id] ? (
                        <VolumeX size={24} color={Colors.textInverse} />
                      ) : (
                        <Volume2 size={24} color={Colors.textInverse} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.videoThumbnail}
                  onPress={() => handleVideoPress(video.id)}
                >
                  <LinearGradient
                    colors={[Colors.primary + '40', Colors.secondary + '40']}
                    style={styles.thumbnailGradient}
                  >
                    <View style={styles.playButton}>
                      <Play size={32} color={Colors.textInverse} fill={Colors.textInverse} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.continueButton, !allWatched && styles.continueButtonDisabled]}
              onPress={handleContinue}
            >
              <LinearGradient
                colors={
                  allWatched
                    ? [Colors.gradient.start, Colors.gradient.end]
                    : [Colors.border, Colors.border]
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueButtonText}>
                  {allWatched ? 'Başlayalım' : 'Videoları İzleyin'}
                </Text>
                {allWatched && <ArrowRight size={20} color={Colors.textInverse} />}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleContinue}
            >
              <Text style={styles.skipButtonText}>Şimdilik Atla</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (Colors: typeof lightTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.textInverse,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textInverse,
    opacity: 0.9,
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  videoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  videoHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  videoNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoNumberText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  videoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  videoDuration: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600' as const,
  },
  videoContainer: {
    width: '100%',
    height: (width - 88) * 0.5625,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnail: {
    width: '100%',
    height: (width - 88) * 0.5625,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  footer: {
    marginTop: 16,
    gap: 16,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textInverse,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
