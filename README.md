# 🌲 JVS Management System

> **Moderní PWA aplikace pro správu 41 vodárenských areálů v Jihočeském kraji**  
> **📱 Plně optimalizováno pro iOS iPhone**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/progressive-web-apps/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet-brightgreen)](https://leafletjs.com/)
[![iOS](https://img.shields.io/badge/iOS-Optimized-black)](./IOS_GUIDE.md)

## 🎯 O Projektu

JVS Management System je **kompletní, nadčasová a profesionální** webová aplikace navržená pro efektivní správu vodárenských areálů. Aplikace kombinuje moderní technologie s intuitivním uživatelským rozhraním pro maximální produktivitu.

### ✨ Klíčové Vlastnosti

- 🗺️ **Interaktivní Mapa** - Leaflet s marker clustering pro 41 areálů
- 🔥 **Real-time Synchronizace** - Firebase Firestore s offline podporou
- 🤖 **AI Asistent** - Inteligentní pomocník s Gemini API
- 📱 **PWA** - Instalovatelná aplikace pro desktop i mobil
- 🍎 **iOS Optimized** - Plná kompatibilita s iPhone (iOS 13+)
- 🎨 **Moderní UI/UX** - Responzivní design s mikroanimacemi
- 📊 **Dynamické Filtry** - Real-time statistiky a pokročilé vyhledávání
- 📍 **GPS Navigace** - Přesná navigace k areálům
- 💾 **Offline Mode** - Plná funkčnost bez internetového připojení

## 📱 iOS Kompatibilita

Aplikace je **plně optimalizována pro iOS** s automatickými opravami všech Safari quirks:

✅ **Viewport Height Fix** - Řeší problém s 100vh  
✅ **Touch Events** - Optimalizované pro dotykové ovládání  
✅ **Input Zoom Prevention** - Žádný zoom při psaní  
✅ **Safe Area Insets** - Podpora pro notch a home indicator  
✅ **Bounce Scroll Fix** - Kontrolované scrollování  
✅ **IndexedDB Fallback** - Funguje i v Private Mode  
✅ **Install Prompt** - Automatické instrukce pro instalaci  

📖 **Detailní průvodce:** [IOS_GUIDE.md](./IOS_GUIDE.md)

### Podporované Zařízení

- ✅ iPhone 15 Pro Max / 15 / 15 Plus
- ✅ iPhone 14 Pro / 14 / 13 / 12
- ✅ iPhone 11 / XR / XS / X
- ✅ iPhone SE (2020+)
- ✅ iPad Pro / Air / Mini
- ✅ iOS 13+ (plná podpora iOS 14+)

## 🚀 Quick Start

### 1. Klonování Repozitáře

```bash
git clone https://github.com/Dominik-88/FOREST.git
cd FOREST
```

### 2. Firebase Setup

1. Vytvořte Firebase projekt na [console.firebase.google.com](https://console.firebase.google.com)
2. Aktivujte Firestore Database
3. Zkopírujte konfiguraci do `firebase-config.js`

### 3. Migrace Dat

```bash
cd scripts
npm install firebase
node migrate-to-firestore.js
```

### 4. Spuštění

```bash
# Jednoduchý HTTP server
python -m http.server 8000

# Nebo
npx http-server -p 8000
```

Otevřete: `http://localhost:8000/index-enhanced.html`

📖 **Detailní návod:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)  
⚡ **Rychlý start:** [QUICK_START.md](./QUICK_START.md)

## 📁 Struktura Projektu

```
FOREST/
├── 📄 index-enhanced.html          # Hlavní HTML s kompletním UI
├── 📄 app-enhanced.js              # Hlavní aplikační logika
├── 📄 firebase-config.js           # Firebase konfigurace
├── 📄 firestore.rules              # Firestore security rules
│
├── 📂 src/
│   ├── 📂 services/
│   │   ├── firestore.service.enhanced.js    # Firestore integrace
│   │   └── ai.service.enhanced.js           # AI asistent
│   │
│   ├── 📂 modules/
│   │   └── filters.module.enhanced.js       # Filtry s real-time stats
│   │
│   ├── 📂 components/
│   │   └── bottomsheet.component.js         # Mobile detail panel
│   │
│   └── 📂 utils/
│       └── ios-compatibility.js             # iOS compatibility layer
│
├── 📂 scripts/
│   └── migrate-to-firestore.js     # Migration script
│
└── 📂 docs/
    ├── SETUP_GUIDE.md              # Kompletní setup průvodce
    ├── QUICK_START.md              # 5-minutový quick start
    ├── IOS_GUIDE.md                # iOS kompatibilita
    └── IMPLEMENTATION_PLAN.md      # Implementační plán
```

## 🎨 Funkce

### 🗺️ Interaktivní Mapa

- **Leaflet MarkerCluster** - Efektivní zobrazení 41 areálů
- **Barevné Markery** - Vizualizace rizika údržby
  - 🔴 Kritické riziko
  - 🟠 Vysoké riziko
  - 🟡 Střední riziko
  - 🟢 Nízké riziko
- **Custom Popups** - Detailní informace při kliknutí
- **Auto Zoom** - Automatické přiblížení na vybrané areály
- **Touch-Optimized** - Optimalizováno pro dotykové ovládání (iOS)

### 🔍 Pokročilé Filtry

- **Real-time Statistiky** - Okamžitá aktualizace při filtraci
- **Vícenásobné Filtry:**
  - 📍 Okres (CB, TA, PT, CK, PI, ST)
  - 🏷️ Kategorie (I., II., Bez kategorie)
  - ✅ Stav dokončení
  - ⚠️ Úroveň rizika
  - 🔎 Textové vyhledávání
- **Debounced Search** - Optimalizované vyhledávání (300ms)
- **Filter Reset** - Jednoduchý reset všech filtrů

### 🤖 AI Asistent

- **Přirozený Jazyk** - Dotazy v češtině
- **Inteligentní Funkce:**
  - 🔍 Filtrace: "Ukaž areály kategorie I. v Písku"
  - 📊 Statistiky: "Kolik je celkem areálů?"
  - 🔮 Predikce: "Které areály potřebují údržbu?"
  - 📝 Protokoly: "Vygeneruj protokol pro cb001"
- **Konverzační Historie** - Uložení dotazů v Firestore
- **Gemini API** - Pokročilé AI zpracování (volitelné)

### 📱 Bottom Sheet (Mobile)

- **Swipe Gesture** - Přirozené ovládání (iOS optimized)
- **Detailní Informace:**
  - Základní údaje (plocha, oplocení)
  - Stav rizika s barevným označením
  - Historie údržby
  - GPS souřadnice
  - Poznámky
- **Akční Tlačítka:**
  - 📍 Navigace k areálu
  - ➕ Přidání do trasy
  - 📋 Zobrazení protokolu

### 💾 Offline Podpora

- **IndexedDB Persistence** - Lokální cache dat
- **Service Worker** - Cache-First strategie
- **Pending Writes Queue** - Synchronizace při obnovení připojení
- **Multi-tab Support** - Synchronizace mezi záložkami
- **iOS Private Mode** - Automatický fallback na localStorage

## 📊 Data

### Areály (41 celkem)

| Okres | Počet | Příklad |
|-------|-------|---------|
| České Budějovice (CB) | 19 | VDJ Hlavatce, VDJ Zdoba |
| Tábor (TA) | 10 | VDJ Čekanice, VDJ Svatá Anna |
| Prachatice (PT) | 4 | VDJ Šibeniční vrch I, ÚV Husinecka |
| Český Krumlov (CK) | 4 | VDJ Domoradice, VDJ Horní Brána |
| Písek (PI) | 2 | VDJ Amerika II, VDJ Zálužany |
| Strakonice (ST) | 2 | VDJ Drahonice, VDJ Vodňany |

### Atributy Areálu

```javascript
{
  id: 'cb001',
  name: 'VDJ Hlavatce',
  district: 'CB',
  category: 'I.',
  lat: 49.063584,
  lng: 14.267751,
  area_sqm: 7968,
  fence_length: 424,
  is_completed: false,
  last_maintenance: Timestamp,
  notes: 'Poznámky...',
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## 🛠️ Technologie

### Frontend

- **Vanilla JavaScript** - ES6+ Modules
- **Leaflet.js** - Interaktivní mapy
- **Leaflet.markercluster** - Clustering markerů
- **CSS3** - Moderní styling s animacemi
- **HTML5** - Sémantické značkování

### Backend & Services

- **Firebase Firestore** - NoSQL databáze
- **Firebase Auth** - Anonymní autentizace
- **Firebase Hosting** - Deployment (volitelné)
- **Google Gemini API** - AI asistent (volitelné)

### PWA

- **Service Worker** - Offline podpora
- **Web App Manifest** - Instalovatelnost
- **IndexedDB** - Lokální persistence
- **Cache API** - Asset caching

### iOS Optimizations

- **iOS Compatibility Layer** - Automatické opravy Safari quirks
- **Touch Events** - Optimalizované pro iOS
- **Safe Area Insets** - Podpora pro notch
- **Viewport Height Fix** - Řešení 100vh problému

## 📈 Performance

### Lighthouse Skóre (Cíl)

- ✅ **Performance:** 90+
- ✅ **PWA:** 100
- ✅ **Accessibility:** 90+
- ✅ **Best Practices:** 90+
- ✅ **SEO:** 90+

### iOS Performance

| Metrika | iPhone 15 Pro | iPhone 12 | iPhone SE |
|---------|---------------|-----------|-----------|
| First Paint | < 1s | < 1.5s | < 2s |
| Interactive | < 2s | < 3s | < 4s |
| FPS (scroll) | 60 | 60 | 50-60 |
| Memory | ~50MB | ~60MB | ~70MB |

### Optimalizace

- **Lazy Loading** - Postupné načítání komponent
- **Code Splitting** - ES6 modules
- **Asset Optimization** - Minifikace CSS/JS
- **Debouncing** - Optimalizované vyhledávání
- **Marker Clustering** - Efektivní zobrazení velkého počtu markerů
- **Hardware Acceleration** - iOS GPU optimizations

## 🔒 Bezpečnost

### Firestore Rules

```javascript
// Public read, authenticated write
match /areals/{arealId} {
  allow read: if true;
  allow write: if request.auth != null;
}

// Private user data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### Best Practices

- ✅ HTTPS Only (production)
- ✅ API Key Restrictions
- ✅ Input Sanitization
- ✅ XSS Protection
- ✅ CORS Configuration

## 🚀 Deployment

### Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

### Alternativy

- **Netlify** - Automatický deployment z GitHub
- **Vercel** - Edge network deployment
- **GitHub Pages** - Zdarma pro public repozitáře

## 📱 Instalace PWA

### Desktop (Chrome/Edge)

1. Otevřete aplikaci
2. Klikněte na ikonu "Install" v adresním řádku
3. Potvrďte instalaci

### Mobile (Android)

1. Otevřete v Chrome
2. Menu → "Add to Home screen"

### Mobile (iOS) 🍎

1. Otevřete v Safari
2. Klikněte na tlačítko "Sdílet" (dole uprostřed)
3. Vyberte "Přidat na plochu"
4. Klikněte "Přidat"

📖 **Detailní návod:** [IOS_GUIDE.md](./IOS_GUIDE.md)

## 🤝 Přispívání

Příspěvky jsou vítány! Prosím:

1. Fork repozitáře
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

## 📝 Roadmap

### Fáze 1: Core Features ✅
- [x] Firestore integrace
- [x] Interaktivní mapa
- [x] Filtry s real-time stats
- [x] AI asistent
- [x] Bottom sheet component
- [x] Offline podpora
- [x] iOS kompatibilita

### Fáze 2: Enhanced Features 🚧
- [ ] Route optimization (TSP solver)
- [ ] Export/Import (CSV, GeoJSON, PDF)
- [ ] Dark mode
- [ ] Advanced analytics
- [ ] Push notifications

### Fáze 3: Advanced Features 📋
- [ ] Multi-user collaboration
- [ ] Role-based access control
- [ ] Maintenance scheduling
- [ ] Photo attachments
- [ ] QR code generation

## 🐛 Known Issues

Žádné známé kritické problémy. Pro reportování bugů použijte [Issues](https://github.com/Dominik-88/FOREST/issues).

## 📄 License

Tento projekt je licencován pod MIT License - viz [LICENSE](LICENSE) soubor.

## 👥 Autoři

- **Dominik Schmied** - *Initial work* - [Dominik-88](https://github.com/Dominik-88)

## 🙏 Poděkování

- Firebase team za skvělou platformu
- Leaflet.js komunitu
- Google AI team za Gemini API
- Všem přispěvatelům

## 📞 Kontakt

- **Email:** d.schmied@lantaron.cz
- **GitHub:** [@Dominik-88](https://github.com/Dominik-88)
- **Issues:** [GitHub Issues](https://github.com/Dominik-88/FOREST/issues)

---

**Vytvořeno s ❤️ pro efektivní správu vodárenských areálů**

🌲 **FOREST** - *Future-Oriented Resource & Estate System Technology*  
📱 **iOS Optimized** - Nativní zážitek na iPhone
