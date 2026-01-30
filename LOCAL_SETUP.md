# Local Development Setup (WSL + Netlify)

## Adım 1: Projeyi İndir

**Rork'tan indirmek için:**
1. Rork arayüzünde sağ üst köşedeki **"..." (üç nokta) menüsüne** tıkla
2. **"Download Project"** veya **"Export"** seçeneğini seç
3. ZIP dosyasını bilgisayarına indir

## Adım 2: ZIP'i Aç ve Hazırla

```bash
# ZIP dosyasını WSL'de bir klasöre aç
unzip cicero-app.zip -d cicero-app
cd cicero-app

# package.local.json dosyasını package.json olarak kullan
mv package.json package.json.backup
mv package.local.json package.json
```

## Adım 3: Environment Variables (.env dosyası oluştur)

Proje kök dizininde `.env` dosyası oluştur:

```bash
touch .env
```

`.env` dosyasına şunları ekle:

```env
EXPO_PUBLIC_RORK_DB_ENDPOINT=your_db_endpoint
EXPO_PUBLIC_RORK_DB_NAMESPACE=your_namespace
EXPO_PUBLIC_RORK_DB_TOKEN=your_token
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-url
EXPO_PUBLIC_TOOLKIT_URL=https://your-toolkit-url
EXPO_PUBLIC_PROJECT_ID=f2ck11oa9v1rhv0z15dt6
```

> Not: Bu değerleri Rork dashboard'dan alabilirsin.

## Adım 4: Bağımlılıkları Yükle

```bash
npm install
```

## Adım 5: Local'de Çalıştır

```bash
npm run dev
```

Tarayıcıda `http://localhost:8081` adresinde açılacak.

---

## Netlify Deploy (Drag & Drop - GitHub'sız)

### 1. Web Build Al:

```bash
npm run build:web
```

Bu komut `dist` klasörü oluşturur.

### 2. Netlify'a Yükle:

1. https://app.netlify.com adresine git
2. Giriş yap (ücretsiz hesap yeterli)
3. **"Add new site"** > **"Deploy manually"** seç
4. `dist` klasörünü sürükle bırak
5. Deploy tamamlandığında URL'ini al

### 3. Environment Variables (Netlify Dashboard):

Netlify'da **Site settings** > **Environment variables** bölümüne git ve şunları ekle:

| Variable | Değer |
|----------|-------|
| `EXPO_PUBLIC_RORK_DB_ENDPOINT` | Rork'tan al |
| `EXPO_PUBLIC_RORK_DB_NAMESPACE` | Rork'tan al |
| `EXPO_PUBLIC_RORK_DB_TOKEN` | Rork'tan al |
| `EXPO_PUBLIC_RORK_API_BASE_URL` | Rork'tan al |
| `EXPO_PUBLIC_TOOLKIT_URL` | Rork'tan al |
| `EXPO_PUBLIC_PROJECT_ID` | f2ck11oa9v1rhv0z15dt6 |

---

## Sorun Giderme

### "expo command not found" hatası:
```bash
npx expo start --web
```

### Port kullanımda hatası:
```bash
npm run dev -- --port 3000
```

### Node version uyumsuzluğu:
Node 18+ kullanın:
```bash
node --version
```
