# Android Optimizasyonları

Bu dokümanda, Cicero uygulamasına eklenen Android-specific optimizasyonlar ve kullanım örnekleri bulunmaktadır.

## 🎯 Eklenen Özellikler

### 1. Haptic Feedback (Titreşim Geri Bildirimi)
**Dosya:** `utils/haptics.ts`

Android cihazlarda kullanıcı etkileşimlerine titreşim geri bildirimi sağlar.

```typescript
import { haptics } from '@/utils/haptics';

// Kullanım örnekleri
haptics.light();      // Hafif titreşim (buton tıklamaları için)
haptics.medium();     // Orta titreşim (önemli aksiyonlar için)
haptics.heavy();      // Güçlü titreşim (kritik aksiyonlar için)
haptics.success();    // Başarı paterni
haptics.error();      // Hata paterni
haptics.selection();  // Seçim değişimi için
```

### 2. PressableButton Bileşeni
**Dosya:** `components/PressableButton.tsx`

Haptic feedback ve tema desteği ile gelişmiş buton bileşeni.

```typescript
import { PressableButton } from '@/components/PressableButton';

<PressableButton
  title="Kaydet"
  variant="primary"        // primary | secondary | outline | ghost
  size="medium"            // small | medium | large
  hapticFeedback="medium"  // light | medium | heavy | selection
  onPress={() => console.log('Pressed')}
/>
```

### 3. PressableCard Bileşeni
**Dosya:** `components/PressableCard.tsx`

Tıklanabilir kart bileşeni, press animasyonları ve haptic feedback ile.

```typescript
import { PressableCard } from '@/components/PressableCard';

<PressableCard
  onPress={() => navigate('/details')}
  hapticFeedback="selection"
  elevation={2}
>
  <Text>Kart İçeriği</Text>
</PressableCard>
```

### 4. Toast Bildirimleri
**Dosya:** `components/Toast.tsx`, `hooks/useToast.ts`

Android-friendly toast bildirimleri.

```typescript
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/Toast';

function MyComponent() {
  const { toast, success, error, warning, info, hideToast } = useToast();

  const handleSave = () => {
    success('Başarıyla kaydedildi!');
  };

  return (
    <>
      <Button onPress={handleSave} />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </>
  );
}
```

### 5. BottomSheet
**Dosya:** `components/BottomSheet.tsx`

Swipe-to-dismiss özellikli alt panel.

```typescript
import { BottomSheet } from '@/components/BottomSheet';

<BottomSheet
  visible={isVisible}
  onClose={() => setIsVisible(false)}
  height={400}
>
  <Text>Bottom Sheet İçeriği</Text>
</BottomSheet>
```

### 6. SwipeableCard
**Dosya:** `components/SwipeableCard.tsx`

Sola/sağa kaydırılabilir kart (silme/arşivleme için).

```typescript
import { SwipeableCard } from '@/components/SwipeableCard';

<SwipeableCard
  onDelete={() => handleDelete(item.id)}
  onArchive={() => handleArchive(item.id)}
>
  <View>
    <Text>{item.title}</Text>
  </View>
</SwipeableCard>
```

### 7. Loading Overlay
**Dosya:** `components/LoadingOverlay.tsx`

Tam ekran yükleme göstergesi.

```typescript
import { LoadingOverlay } from '@/components/LoadingOverlay';

<LoadingOverlay
  visible={isLoading}
  message="Yükleniyor..."
/>
```

### 8. Skeleton Loader
**Dosya:** `components/SkeletonLoader.tsx`

İçerik yüklenirken gösterilecek placeholder animasyonları.

```typescript
import { SkeletonLoader, SkeletonCard, SkeletonList } from '@/components/SkeletonLoader';

// Tek skeleton
<SkeletonLoader width="100%" height={20} />

// Kart skeleton
<SkeletonCard />

// Liste skeleton
<SkeletonList count={5} />
```

### 9. Android Back Handler
**Dosya:** `hooks/useAndroidBackHandler.ts`

Android geri tuşu yönetimi.

```typescript
import { useAndroidBackHandler, useAndroidBackExit } from '@/hooks/useAndroidBackHandler';

// Özel geri tuşu davranışı
useAndroidBackHandler(() => {
  if (hasUnsavedChanges) {
    showConfirmDialog();
    return true; // Geri tuşunu engelle
  }
  return false; // Normal davranış
});

// Ana sayfada çift tıklama ile çıkış
useAndroidBackExit();
```

### 10. Android Status Bar
**Dosya:** `components/AndroidStatusBar.tsx`

Tema ile entegre durum çubuğu yönetimi.

```typescript
// Otomatik olarak _layout.tsx'de kullanılıyor
// Tema değiştiğinde durum çubuğu renkleri otomatik güncellenir
```

### 11. Platform Utilities
**Dosya:** `utils/androidOptimizations.ts`

Platform-specific optimizasyonlar.

```typescript
import { androidOptimizations, isAndroid, platformSelect } from '@/utils/androidOptimizations';

// Etkileşimlerden sonra çalıştır
androidOptimizations.runAfterInteractions(() => {
  // Ağır işlemler
});

// Platform kontrolü
if (isAndroid) {
  // Android-specific kod
}

// Platform-specific değerler
const padding = platformSelect({
  android: 16,
  ios: 20,
  default: 16,
});
```

## 📱 app.json Optimizasyonları

```json
{
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#7C3AED"  // Tema rengi
    },
    "permissions": [
      "RECORD_AUDIO",
      "VIBRATE"  // Haptic feedback için
    ],
    "softwareKeyboardLayoutMode": "pan",  // Klavye açıldığında layout kaydırma
    "userInterfaceStyle": "automatic",     // Sistem teması takibi
    "navigationBar": {
      "visible": "sticky-immersive",       // Tam ekran deneyim
      "backgroundColor": "#00000000"       // Transparan navigation bar
    }
  }
}
```

## 🎨 Tema Entegrasyonu

Tüm bileşenler otomatik olarak light/dark tema desteği ile gelir:

```typescript
import { useApp } from '@/contexts/AppContext';
import { lightTheme, darkTheme } from '@/constants/colors';

function MyComponent() {
  const { theme } = useApp();
  const Colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={{ backgroundColor: Colors.background }}>
      <Text style={{ color: Colors.text }}>Merhaba</Text>
    </View>
  );
}
```

## 🚀 Performans İpuçları

1. **Haptic Feedback**: Sadece önemli etkileşimlerde kullanın
2. **Animations**: Native driver kullanımına dikkat edin
3. **Lists**: FlatList ile windowSize ve maxToRenderPerBatch optimize edin
4. **Images**: expo-image kullanın, placeholder ekleyin
5. **Heavy Operations**: InteractionManager ile erteleyin

## 📦 Yüklü Paketler

- `expo-navigation-bar`: Navigation bar kontrolü
- `@react-native-async-storage/async-storage`: Veri saklama
- `lucide-react-native`: İkonlar

## 🔧 Geliştirme Notları

- Tüm bileşenler TypeScript ile yazılmıştır
- Strict type checking aktif
- ESLint kurallarına uygun
- React hooks best practices takip edilmiştir
- Web compatibility göz önünde bulundurulmuştur
