# 🌲 JVS FOREST v4.0

**Profesionální systém správy vodárenských areálů**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-4.0.0-green.svg)](https://github.com/Dominik-88/FOREST)
[![Security](https://img.shields.io/badge/security-hardened-brightgreen.svg)](./SECURITY-FIXES.md)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange.svg)](https://firebase.google.com)

🔗 **Live Demo**: 
- GitHub Pages: [https://dominik-88.github.io/FOREST/](https://dominik-88.github.io/FOREST/)
- Firebase Hosting: [https://jvs-management.web.app](https://jvs-management.web.app)

---

## 📋 Obsah

- [O projektu](#-o-projektu)
- [Funkce](#-funkce)
- [Technologie](#-technologie)
- [Instalace](#-instalace)
- [Deployment](#-deployment)
- [Použití](#-použití)
- [Struktura projektu](#-struktura-projektu)
- [Bezpečnost](#-bezpečnost)
- [Dokumentace](#-dokumentace)
- [Licence](#-licence)

---

## 🎯 O projektu

JVS FOREST je moderní webová aplikace pro správu a údržbu vodárenských areálů. Poskytuje komplexní nástroje pro plánování sečí, sledování údržby, optimalizaci tras a analýzu nákladů.

### ✨ Klíčové vlastnosti

- 🗺️ **Interaktivní mapa** - Leaflet s clustering a heatmap
- 🤖 **AI Asistent** - Inteligentní pomocník pro správu
- 📊 **Statistiky** - Real-time přehledy a analýzy
- 📱 **PWA** - Funguje offline jako nativní aplikace
- 🔒 **Bezpečné** - XSS protected, clean code
- ⚡ **Rychlé** - Optimalizované pro výkon
- 🔥 **Firebase** - Hosting + Analytics

---

## 🚀 Funkce

### 📍 Správa areálů
- 41 vodárenských areálů v Jihočeském kraji
- Detailní informace (výměra, oplocení, priorita)
- Kategorizace (I., II. kategorie)
- GPS souřadnice a vizualizace na mapě

### 🗺️ Interaktivní mapa
- **Leaflet** s OpenStreetMap podkladem
- **Clustering** pro přehlednost
- **Heatmapa** podle priority
- **Vlastní markery** podle kategorie
- Geolokace uživatele

### 📅 Provozní modul
- ✅ Dokončení seče (datum, pracovník, poznámka)
- 📖 Servisní knížka (historie až 50 záznamů)
- 📊 Statistiky (dnes/týden/měsíc)
- 🔔 Predikce údržby (30 dní)
- ⏰ Sledování termínů

### 🤖 AI Asistent
- Plánování sečí a údržby
- Optimalizace tras
- Analýza nákladů
- Predikce servisních úkonů
- Statistiky a přehledy

### 🔍 Filtry a vyhledávání
- Fulltextové vyhledávání
- Filtr podle okresu (CB, TA, PT, CK, PI, ST)
- Filtr podle stavu (čeká, posečeno, po termínu)
- Real-time aktualizace

### 📥 Export dat
- CSV export areálů
- Komplexní provozní reporty
- Statistiky pracovníků
- Analýza nákladů

---

## 🛠️ Technologie

### Frontend
- **HTML5** - Sémantický markup
- **CSS3** - Modern styling, Tailwind CSS
- **JavaScript ES6+** - Modular, clean code
- **Leaflet** - Interaktivní mapy
- **Font Awesome** - Ikony

### Backend & Hosting
- **Firebase Hosting** - CDN, SSL, Custom domain
- **Firebase Analytics** - User tracking
- **GitHub Pages** - Alternative hosting

### PWA
- **Service Worker** - Offline podpora
- **Web App Manifest** - Instalovatelná aplikace
- **LocalStorage** - Lokální ukládání dat

### Bezpečnost
- ✅ XSS protection (createElement + textContent)
- ✅ Scoped localStorage (prefixed keys)
- ✅ No inline styles/scripts
- ✅ Event delegation
- ✅ Secure DOM manipulation

---

## 📦 Instalace

### Požadavky
- Moderní webový prohlížeč (Chrome, Firefox, Safari, Edge)
- Git (pro klonování repozitáře)
- Webový server (pro lokální vývoj)

### Krok 1: Klonování
```bash
git clone https://github.com/Dominik-88/FOREST.git
cd FOREST
```

### Krok 2: Spuštění
```bash
# Jednoduchý HTTP server (Python)
python -m http.server 8000

# Nebo Node.js
npx http-server -p 8000

# Nebo VS Code Live Server
# Klikněte pravým na index.html → Open with Live Server
```

### Krok 3: Otevření
```
http://localhost:8000
```

---

## 🔥 Deployment

### Firebase Hosting (Doporučeno)

```bash
# 1. Instalace Firebase CLI
npm install -g firebase-tools

# 2. Přihlášení
firebase login

# 3. Deploy
firebase deploy --only hosting

# 4. Otevření
firebase open hosting:site
```

**URL**: https://jvs-management.web.app

Více informací: [FIREBASE-DEPLOYMENT.md](./FIREBASE-DEPLOYMENT.md)

### GitHub Pages (Alternativa)

```bash
# Automatický deployment při push do main
git add .
git commit -m "Update"
git push origin main
```

**URL**: https://dominik-88.github.io/FOREST/

### GitHub Actions

Automatický deployment je nakonfigurován v `.github/workflows/firebase-hosting.yml`:
- ✅ Auto-deploy při push do main
- ✅ Manuální trigger možný
- ✅ Firebase token authentication

---

## 💻 Použití

### Základní ovládání

1. **Zobrazení areálů**
   - Areály se zobrazí na mapě jako barevné markery
   - Kliknutím na marker zobrazíte detail

2. **Vyhledávání**
   - Použijte vyhledávací pole v postranním panelu
   - Filtrujte podle okresu nebo stavu

3. **Dokončení seče**
   - Klikněte na areál na mapě
   - Vyberte "✅ Dokončit seč"
   - Vyplňte pracovníka a poznámku

4. **AI Asistent**
   - Klikněte na FAB tlačítko s robotem
   - Zadejte dotaz (např. "Které areály potřebují seč?")
   - AI vám poskytne odpověď

5. **Export dat**
   - V postranním panelu klikněte na "📥 Export"
   - Vyberte CSV nebo Report

### Klávesové zkratky
- `Esc` - Zavřít modální okna
- `Ctrl + F` - Zaměřit vyhledávání

---

## 📁 Struktura projektu

```
FOREST/
├── index.html              # Hlavní HTML soubor
├── offline.html            # PWA offline stránka
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── config.json             # Konfigurace
├── firebase.json           # Firebase config
├── .firebaserc             # Firebase project
├── robots.txt              # SEO
├── sitemap.xml             # SEO
│
├── .github/                # GitHub Actions
│   └── workflows/
│       └── firebase-hosting.yml
│
├── data/                   # Data
│   └── areals-2025-updated.json
│
├── scripts/                # JavaScript
│   ├── app.js             # Hlavní aplikace
│   └── firebase-config.js # Firebase SDK
│
├── styles/                 # CSS
│   └── main.css           # Hlavní styly
│
└── docs/                   # Dokumentace
    ├── README.md
    ├── SECURITY-FIXES.md
    ├── FIREBASE-DEPLOYMENT.md
    └── ...
```

---

## 🔒 Bezpečnost

### Implementované ochrany

✅ **XSS Protection**
- Používáme `createElement` + `textContent`
- Žádné `innerHTML` s uživatelskými daty
- Automatické escapování

✅ **LocalStorage**
- Prefixované klíče (`jvs_`)
- Bezpečné mazání (ne `clear()`)
- Izolace dat

✅ **Clean Code**
- Zero globálních proměnných
- Event delegation
- Modular architecture

✅ **Service Worker**
- Správné fallbacky
- Bezpečné cachování
- Offline podpora

✅ **Firebase Security**
- HTTPS only
- Security headers
- Analytics privacy

### Security Score
**95/100** 🟢 (zlepšení z 40/100)

Více informací: [SECURITY-FIXES.md](./SECURITY-FIXES.md)

---

## 📖 Dokumentace

### Dostupné dokumenty

- **[README.md](./README.md)** - Tento soubor
- **[SECURITY-FIXES.md](./SECURITY-FIXES.md)** - Bezpečnostní opravy
- **[FIREBASE-DEPLOYMENT.md](./FIREBASE-DEPLOYMENT.md)** - Firebase deployment
- **[CLEANUP-COMPLETE.md](./CLEANUP-COMPLETE.md)** - Úklid repozitáře
- **[FINAL-SUMMARY.md](./FINAL-SUMMARY.md)** - Finální shrnutí

### API Reference

#### LocalStorage Keys
```javascript
// Mowing records
jvs_mowing_{arealId}  // Timestamp poslední seče

// Service history
jvs_history_{arealId} // Array servisních záznamů
```

#### Data Structure
```javascript
{
  id: 1,
  nazev: "Název areálu",
  okres: "CB",
  kategorie: "I.",
  vymera: 5000,        // m²
  oploceni: 300,       // bm
  priorita: 85,        // 0-100
  lat: 49.0,
  lon: 14.5,
  frekvenceUdrzby: 21  // dny
}
```

---

## 🤝 Přispívání

Příspěvky jsou vítány! Postupujte takto:

1. Fork repozitáře
2. Vytvořte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevřete Pull Request

### Coding Standards
- ✅ XSS protection (createElement + textContent)
- ✅ No inline styles/scripts
- ✅ Event delegation
- ✅ Modular code
- ✅ Comments in Czech

---

## 🐛 Hlášení chyb

Našli jste chybu? Otevřete [Issue](https://github.com/Dominik-88/FOREST/issues) s:

- Popisem problému
- Kroky k reprodukci
- Očekávané chování
- Screenshots (pokud je to relevantní)
- Verze prohlížeče

---

## 📝 Changelog

### v4.0.0 (2025-12-25)
- 🔒 **Security**: XSS protection, scoped localStorage
- 🏗️ **Architecture**: Clean code, modular structure
- 🎨 **UI**: Separated CSS, no inline styles
- 🔧 **Service Worker**: Fixed offline handling
- 🧹 **Cleanup**: Removed 33 old files (-73%)
- 🔥 **Firebase**: Hosting + Analytics integration
- 📖 **Documentation**: Professional guides
- 🤖 **CI/CD**: GitHub Actions workflow

### v3.0.0 (2025-12-22)
- 🤖 AI Asistent
- 📅 Provozní modul
- 📊 Advanced reporting

### v2.0.0 (2025-12-20)
- 🗺️ Leaflet integration
- 📱 PWA support
- 🔍 Filters

### v1.0.0 (2025-12-15)
- 🎉 Initial release

---

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor pro detaily.

```
MIT License

Copyright (c) 2025 Dominik Schmied

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Autor

**Dominik Schmied**
- GitHub: [@Dominik-88](https://github.com/Dominik-88)
- Email: d.schmied@lantaron.cz

---

## 🙏 Poděkování

- [Leaflet](https://leafletjs.com/) - Interaktivní mapy
- [OpenStreetMap](https://www.openstreetmap.org/) - Mapové podklady
- [Font Awesome](https://fontawesome.com/) - Ikony
- [Firebase](https://firebase.google.com/) - Hosting & Analytics
- [GitHub](https://github.com/) - Version control & Pages

---

## 📊 Statistiky projektu

- **Řádků kódu**: ~2000
- **Soubory**: 15 (po úklidu)
- **Areály**: 41
- **Okresy**: 6
- **Security Score**: 95/100
- **Hosting**: Firebase + GitHub Pages

---

## 🔗 Odkazy

- **Live Demo (Firebase)**: https://jvs-management.web.app
- **Live Demo (GitHub)**: https://dominik-88.github.io/FOREST/
- **GitHub**: https://github.com/Dominik-88/FOREST
- **Issues**: https://github.com/Dominik-88/FOREST/issues
- **Firebase Console**: https://console.firebase.google.com/project/jvs-management

---

<div align="center">

**Vytvořeno s ❤️ pro JVS a.s.**

⭐ Pokud se vám projekt líbí, dejte mu hvězdičku!

🔥 **[Vyzkoušejte na Firebase](https://jvs-management.web.app)** 🔥

</div>