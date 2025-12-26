# 🌲 JVS Management System

**Moderní PWA pro správu 41 vodárenských areálů Jihočeského kraje**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Dominik-88/FOREST)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-enabled-orange.svg)](manifest.json)

## 📋 Obsah

- [Přehled](#přehled)
- [Funkce](#funkce)
- [Technologie](#technologie)
- [Architektura](#architektura)
- [Instalace](#instalace)
- [Konfigurace](#konfigurace)
- [Použití](#použití)
- [Vývoj](#vývoj)
- [Deployment](#deployment)

## 🎯 Přehled

JVS Management System je pokročilá Progressive Web Application (PWA) navržená pro efektivní správu vodárenských areálů v Jihočeském kraji. Aplikace kombinuje moderní webové technologie s real-time databází a offline podporou.

### Klíčové vlastnosti

- ✅ **41 reálných areálů** s přesnými GPS souřadnicemi
- 🗺️ **Interaktivní mapa** s clustering a barevnými markery
- 📱 **PWA** - instalovatelná, offline-first
- 🔥 **Firestore** - real-time synchronizace dat
- 📍 **GPS/RTK navigace** - přesné navádění k areálům
- 🎨 **Moderní UI/UX** - mobilní-first design
- 🤖 **AI asistent** - inteligentní dotazy a predikce

## ⚡ Funkce

### 1. Interaktivní Mapa

- **Leaflet s MarkerCluster** - efektivní zobrazení velkého množství bodů
- **Barevné markery podle rizika**:
  - 🔴 Kategorie I. (vysoké riziko)
  - 🟠 Kategorie II. (střední riziko)
  - 🟢 Bez kategorie (standardní)
- **Custom popups** s detailními informacemi
- **Bottom-sheet panel** pro detail areálu
- **Zoom to bounds** při filtrování

### 2. Pokročilé Filtry

- **Textové vyhledávání** (název, okres, poznámky)
- **Kategorie rizika** (I., II., bez kategorie)
- **Okres** (CB, TA, PT, CK, PI, ST)
- **Slider rizika údržby** (0-100%)
- **Real-time statistiky** při změně filtrů
- **Kombinované filtry** s debounce

### 3. GPS/RTK Navigace

- **Real-time pozice** s přesností ±2cm (simulace RTK)
- **Směrování k areálu** s výpočtem vzdálenosti
- **Kompas heading** pomocí device orientation
- **ETA kalkulace** na základě rychlosti
- **Live tracking** na mapě

### 4. Plánovač Tras

- **Až 10 bodů** v trase
- **Optimalizace pořadí** návštěv
- **Výpočet vzdálenosti** a času
- **Vizualizace trasy** na mapě
- **Export trasy** (GPX, GeoJSON)

### 5. Offline Podpora

- **Cache-First strategie** pro assets
- **IndexedDB** pro Firestore data
- **Background sync** pro offline změny
- **Update notification** při nové verzi
- **Install prompt** pro PWA

### 6. AI Asistent (Gemini)

- **Přirozené dotazy** v češtině
- **Překlad do Firestore queries**
- **Predikce údržby** pomocí ML
- **Generování protokolů** PDF
- **Chat UI** s historií

## 🛠️ Technologie

### Frontend

- **Vanilla JavaScript** (ES6+ Modules)
- **Leaflet.js** - interaktivní mapy
- **Leaflet.markercluster** - clustering markerů
- **Tailwind CSS** - utility-first styling
- **Font Awesome** - ikony

### Backend & Database

- **Firebase** (v9 Modular SDK)
- **Firestore** - NoSQL real-time database
- **Firebase Auth** - autentizace
- **Cloud Functions** - serverless API

### PWA & Performance

- **Service Worker** - offline caching
- **IndexedDB** - lokální databáze
- **Web App Manifest** - instalace
- **Workbox** (optional) - advanced caching

### AI & ML

- **Google Gemini API** - AI asistent
- **TensorFlow.js** (optional) - predikce údržby

## 🏗️ Architektura

### Adresářová Struktura

```
FOREST/
├── src/
│   ├── core/
│   │   └── state.js              # Centralizovaný state management
│   ├── services/
│   │   ├── firestore.service.js  # Firestore real-time DB
│   │   ├── map.service.enhanced.js # Leaflet s clustering
│   │   └── ai.service.js         # Gemini AI integration
│   ├── modules/
│   │   ├── filters.module.js     # Filtrovací systém
│   │   ├── routes.module.js      # Plánovač tras
│   │   ├── gps.module.js         # GPS/RTK navigace
│   │   └── ui.module.js          # UI komponenty
│   ├── components/
│   │   ├── modal.component.js    # Modal dialogy
│   │   ├── toast.component.js    # Notifikace
│   │   └── bottomsheet.component.js # Bottom sheet
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   ├── components.css
│   │   │   ├── map-enhanced.css
│   │   │   └── animations.css
│   │   └── icons/
│   └── sw-enhanced.js            # Service Worker
├── index.html
├── manifest.json
└── README.md
```

### State Management

Aplikace používá **Proxy-based reactive state** pro centralizovanou správu stavu:

```javascript
import { stateManager, state } from './core/state.js';

// Subscribe to changes
stateManager.subscribe('areals', (newValue, oldValue) => {
  console.log('Areals updated:', newValue);
});

// Update state
stateManager.set('areals', newAreals);
```

### Modular Architecture

Každý modul je samostatný ES6 modul s jasně definovaným API:

```javascript
// Service pattern
class FirestoreService {
  async initialize() { }
  subscribeToAreals(callback, options) { }
  async addAreal(data) { }
}

export const firestoreService = new FirestoreService();
```

## 📦 Instalace

### Požadavky

- Node.js 18+ (pro development tools)
- Moderní prohlížeč (Chrome 90+, Firefox 88+, Safari 14+)
- Firebase projekt

### Krok 1: Clone Repository

```bash
git clone https://github.com/Dominik-88/FOREST.git
cd FOREST
```

### Krok 2: Firebase Setup

1. Vytvořte Firebase projekt na [console.firebase.google.com](https://console.firebase.google.com)
2. Povolte Firestore Database
3. Zkopírujte Firebase config

### Krok 3: Konfigurace

Upravte `src/services/firestore.service.js`:

```javascript
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Krok 4: Migrace Dat

Spusťte migration script pro import 41 areálů do Firestore:

```bash
node scripts/migrate-to-firestore.js
```

### Krok 5: Spuštění

```bash
# Development server
npx serve .

# Nebo použijte VS Code Live Server
```

Otevřete `http://localhost:3000`

## ⚙️ Konfigurace

### Firebase Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /areals/{arealId} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Authenticated write
    }
  }
}
```

### Service Worker

Upravte cache strategie v `src/sw-enhanced.js`:

```javascript
const CACHE_VERSION = 'jvs-v2.0.0';
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;
```

### Map Configuration

Upravte výchozí nastavení mapy v `src/core/state.js`:

```javascript
map: {
    center: [49.2, 14.4],  // South Bohemia
    zoom: 9,
    bounds: null
}
```

## 🚀 Použití

### Základní Workflow

1. **Otevřete aplikaci** - mapa se načte s 41 areály
2. **Filtrujte areály** - podle kategorie, okresu, textu
3. **Klikněte na marker** - zobrazí se detail v popupu
4. **Přidejte do trasy** - naplánujte návštěvy
5. **Navigujte** - zapněte GPS a sledujte pozici

### Klávesové Zkratky

- `Ctrl + F` - Focus na vyhledávání
- `Ctrl + M` - Toggle mapa/seznam
- `Ctrl + R` - Reset filtrů
- `Esc` - Zavřít modal/panel

### Export Dat

```javascript
// CSV export
window.dispatchEvent(new CustomEvent('exportData', {
  detail: { format: 'csv', data: filteredAreals }
}));

// GeoJSON export
window.dispatchEvent(new CustomEvent('exportData', {
  detail: { format: 'geojson', data: filteredAreals }
}));
```

## 👨‍💻 Vývoj

### Development Workflow

```bash
# 1. Vytvořte feature branch
git checkout -b feature/my-feature

# 2. Vyvíjejte a testujte
# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push a create PR
git push origin feature/my-feature
```

### Code Style

- **ES6+ syntax** - arrow functions, destructuring, async/await
- **Modular design** - jeden modul = jeden soubor
- **JSDoc comments** - dokumentace funkcí
- **Consistent naming** - camelCase pro proměnné, PascalCase pro třídy

### Testing

```bash
# Unit tests (future)
npm test

# E2E tests (future)
npm run test:e2e
```

## 🌐 Deployment

### GitHub Pages

```bash
# Build pro production
npm run build

# Deploy na GitHub Pages
npm run deploy
```

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📊 Statistiky Projektu

- **41 areálů** v 6 okresech
- **181,947 m²** celková plocha
- **10,544 m** celková délka oplocení
- **95% cíl** dokončení
- **3 kategorie** rizika

## 🤝 Přispívání

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👤 Autor

**Dominik Schmied**
- GitHub: [@Dominik-88](https://github.com/Dominik-88)
- Email: dominikschmied4@gmail.com

## 🙏 Poděkování

- [Leaflet](https://leafletjs.com/) - amazing mapping library
- [Firebase](https://firebase.google.com/) - real-time database
- [Tailwind CSS](https://tailwindcss.com/) - utility-first CSS
- [Font Awesome](https://fontawesome.com/) - icons

---

**Made with ❤️ in Czech Republic**
