# 🚀 JVS Management System - Setup Guide

## 📋 Přehled

Kompletní průvodce nastavením a spuštěním JVS Management System - moderní PWA aplikace pro správu 41 vodárenských areálů v Jihočeském kraji.

## ✅ Požadavky

- **Node.js** 16+ (pro migration script)
- **Firebase Account** (zdarma)
- **Moderní webový prohlížeč** (Chrome, Firefox, Safari, Edge)
- **HTTPS** (pro PWA funkce - lze použít localhost pro vývoj)

## 🔧 Krok 1: Firebase Setup

### 1.1 Vytvoření Firebase Projektu

1. Přejděte na [Firebase Console](https://console.firebase.google.com)
2. Klikněte na **"Add project"** / **"Přidat projekt"**
3. Zadejte název: `jvs-management`
4. Povolte Google Analytics (volitelné)
5. Klikněte na **"Create project"**

### 1.2 Aktivace Firestore Database

1. V levém menu vyberte **"Firestore Database"**
2. Klikněte na **"Create database"**
3. Vyberte **"Start in production mode"**
4. Zvolte lokaci: **"europe-west3 (Frankfurt)"**
5. Klikněte na **"Enable"**

### 1.3 Nastavení Security Rules

1. V Firestore Database přejděte na záložku **"Rules"**
2. Zkopírujte obsah souboru `firestore.rules` z repozitáře
3. Vložte do editoru a klikněte na **"Publish"**

### 1.4 Získání Firebase Configuration

1. V Project Settings (ikona ozubeného kola) přejděte na **"General"**
2. Scrollujte dolů na **"Your apps"**
3. Klikněte na **Web icon** `</>`
4. Zaregistrujte aplikaci s názvem: `JVS Management Web`
5. Zkopírujte konfigurační objekt `firebaseConfig`

### 1.5 Aktualizace Konfigurace

Otevřete soubor `firebase-config.js` a nahraďte demo hodnoty:

```javascript
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 📊 Krok 2: Migrace Dat do Firestore

### 2.1 Instalace Závislostí

```bash
cd scripts
npm install firebase
```

### 2.2 Spuštění Migration Scriptu

```bash
node migrate-to-firestore.js
```

Script automaticky:
- ✅ Připojí se k Firestore
- ✅ Vytvoří kolekci `areals`
- ✅ Nahraje všech 41 areálů
- ✅ Ověří úspěšnou migraci

### 2.3 Ověření v Firebase Console

1. Otevřete Firestore Database
2. Měli byste vidět kolekci `areals` s 41 dokumenty
3. Zkontrolujte několik dokumentů, zda obsahují správná data

## 🤖 Krok 3: AI Asistent (Volitelné)

### 3.1 Získání Gemini API Key

1. Přejděte na [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Klikněte na **"Create API Key"**
3. Zkopírujte vygenerovaný klíč

### 3.2 Aktualizace AI Konfigurace

Otevřete `src/services/ai.service.enhanced.js` a nahraďte:

```javascript
const AI_CONFIG = {
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
    // ... rest of config
};
```

**Poznámka:** AI asistent funguje i bez Gemini API - používá lokální zpracování dotazů.

## 🌐 Krok 4: Spuštění Aplikace

### 4.1 Lokální Vývoj

Pro lokální testování použijte jednoduchý HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Otevřete prohlížeč na: `http://localhost:8000/index-enhanced.html`

### 4.2 Production Deployment

#### Firebase Hosting (Doporučeno)

```bash
# Instalace Firebase CLI
npm install -g firebase-tools

# Přihlášení
firebase login

# Inicializace
firebase init hosting

# Deployment
firebase deploy --only hosting
```

#### Alternativní Hosting

- **Netlify**: Drag & drop složky do Netlify
- **Vercel**: Import GitHub repozitáře
- **GitHub Pages**: Aktivujte v Settings > Pages

## 📱 Krok 5: PWA Instalace

### 5.1 Desktop

1. Otevřete aplikaci v Chrome/Edge
2. V adresním řádku klikněte na ikonu **"Install"** / **"Nainstalovat"**
3. Potvrďte instalaci

### 5.2 Mobile (Android)

1. Otevřete aplikaci v Chrome
2. Klikněte na menu (tři tečky)
3. Vyberte **"Add to Home screen"** / **"Přidat na plochu"**

### 5.3 Mobile (iOS)

1. Otevřete aplikaci v Safari
2. Klikněte na ikonu **"Share"** / **"Sdílet"**
3. Vyberte **"Add to Home Screen"** / **"Přidat na plochu"**

## 🎨 Krok 6: Customizace (Volitelné)

### 6.1 Změna Barev

Upravte CSS proměnné v `index-enhanced.html`:

```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
}
```

### 6.2 Změna Loga

1. Nahraďte soubory v `assets/`:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
2. Aktualizujte `manifest.json`

### 6.3 Přidání Vlastních Areálů

Upravte data v migration scriptu nebo přidejte přímo v Firestore Console.

## 🔍 Krok 7: Testování

### 7.1 Funkční Testy

- ✅ Načtení mapy s markery
- ✅ Filtrace podle okresů
- ✅ Vyhledávání areálů
- ✅ Zobrazení detailu areálu (bottom sheet)
- ✅ AI asistent dotazy
- ✅ Offline funkčnost

### 7.2 Performance Test

1. Otevřete Chrome DevTools (F12)
2. Přejděte na záložku **"Lighthouse"**
3. Spusťte audit pro:
   - Performance
   - PWA
   - Accessibility
   - Best Practices

**Cílové skóre:** 90+ ve všech kategoriích

## 🐛 Troubleshooting

### Problém: Mapa se nenačítá

**Řešení:**
- Zkontrolujte konzoli prohlížeče (F12)
- Ověřte, že Leaflet skripty jsou načteny
- Zkontrolujte internetové připojení

### Problém: Data se nenačítají z Firestore

**Řešení:**
- Ověřte Firebase konfiguraci v `firebase-config.js`
- Zkontrolujte Firestore Rules
- Ověřte, že migrace proběhla úspěšně
- Zkontrolujte konzoli pro chybové hlášky

### Problém: AI asistent nefunguje

**Řešení:**
- AI funguje i bez Gemini API (lokální zpracování)
- Zkontrolujte API klíč v `ai.service.enhanced.js`
- Ověřte kvóty v Google AI Studio

### Problém: PWA se neinstaluje

**Řešení:**
- Aplikace musí běžet na HTTPS (nebo localhost)
- Zkontrolujte `manifest.json`
- Ověřte registraci Service Workeru v DevTools

## 📚 Další Zdroje

- [Firebase Documentation](https://firebase.google.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Gemini API Docs](https://ai.google.dev/docs)

## 🆘 Podpora

Pokud narazíte na problémy:

1. Zkontrolujte [Issues](https://github.com/Dominik-88/FOREST/issues)
2. Vytvořte nový Issue s detailním popisem
3. Přiložte screenshot konzole (F12)

## 🎉 Hotovo!

Vaše JVS Management System je nyní plně funkční a připravená k použití!

**Užijte si moderní správu vodárenských areálů! 🚰💧**
