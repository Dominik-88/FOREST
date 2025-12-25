# 🗺️ JVS Provozní Mapa

Interaktivní mapa vodárenských areálů pro správu a údržbu.

## 🚀 Live Demo

**👉 [https://dominik-88.github.io/FOREST/](https://dominik-88.github.io/FOREST/)**

---

## ✨ Funkce

### 📍 Mapa
- **41 vodárenských areálů** v okresech PI, ST, CB, CK, PT, TA
- **Interaktivní markery** - kliknutím zobrazíte detail
- **Clustering** - automatické seskupování při oddálení
- **Barevné rozlišení** - zelená (hotovo), oranžová (k údržbě)
- **🆕 Google Maps integrace** - otevřít areál v Google Maps jedním klikem

### 🔍 Filtry
- **Vyhledávání** podle názvu areálu
- **Filtr podle okresu** (PI, ST, CB, CK, PT, TA)
- **Toggle údržby** - zobrazit jen areály k údržbě

### 📊 Statistiky
- Celkový počet areálů
- Počet areálů k údržbě
- Celková plocha (m²)
- Celkové oplocení (bm)

### 🌤️ Počasí
- Real-time počasí v centru mapy
- Teplota, srážky, vítr
- Automatická aktualizace při pohybu mapy

### 📱 Další funkce
- **Geolokace** - najít moji polohu
- **Responzivní design** - funguje na mobilu i PC
- **Toast notifikace** - vizuální zpětná vazba
- **Skládací panel** - přehledné ovládání
- **🆕 Zobrazení souřadnic** - přesné GPS souřadnice v popupu

---

## 🛠️ Technologie

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Mapa:** Leaflet 1.9.4 + MarkerCluster
- **API:** Open-Meteo (počasí), OpenStreetMap (tiles), Google Maps
- **Hosting:** GitHub Pages

---

## 📁 Struktura projektu

```
FOREST/
├── index.html              # Hlavní HTML soubor
├── scripts/
│   └── provozni-mapa.js   # Hlavní JavaScript aplikace
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── offline.html           # Offline stránka
├── robots.txt             # SEO
├── sitemap.xml            # SEO
├── README.md              # Dokumentace
├── CONNECTIONS.md         # Dokumentace propojení
├── test-connections.html  # Testovací stránka
└── verify.sh              # Verifikační skript
```

---

## 🚀 Instalace a spuštění

### Lokální vývoj

1. **Klonujte repozitář:**
```bash
git clone https://github.com/Dominik-88/FOREST.git
cd FOREST
```

2. **Spusťte lokální server:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

3. **Otevřete v prohlížeči:**
```
http://localhost:8000
```

### Deployment na GitHub Pages

1. **Push do main branch:**
```bash
git add .
git commit -m "Update"
git push origin main
```

2. **GitHub Pages se automaticky aktualizuje**
   - URL: `https://[username].github.io/FOREST/`

---

## 📖 Použití

### Základní ovládání

1. **Zobrazení detailu areálu:**
   - Klikněte na marker na mapě
   - Zobrazí se popup s informacemi

2. **Změna stavu údržby:**
   - V popupu klikněte na tlačítko "K údržbě" / "Hotovo"
   - Barva markeru se změní

3. **🆕 Otevření v Google Maps:**
   - V popupu klikněte na tlačítko "🗺️ Google Maps"
   - Otevře se nová záložka s přesnou polohou areálu
   - Můžete použít navigaci, Street View, satelitní zobrazení

4. **Filtrování:**
   - Otevřete panel (tlačítko vpravo nahoře)
   - Použijte vyhledávání, filtr okresu nebo toggle údržby

5. **Geolokace:**
   - Klikněte na tlačítko s ikonou lokace
   - Mapa se přesune na vaši polohu

### Klávesové zkratky

- **Esc** - Zavřít popup
- **+/-** - Přiblížit/oddálit mapu
- **Šipky** - Posun mapy

---

## 🎨 Kategorie areálů

- **I.** - Kategorie I (nejvyšší priorita) - 23 areálů
- **II.** - Kategorie II (střední priorita) - 15 areálů
- **B** - Kategorie B (základní) - 3 areály

---

## 📊 Data

Aplikace obsahuje data o **41 vodárenských areálech**:

- **Okresy:** PI (2), ST (2), CB (20), CK (4), PT (4), TA (9)
- **Celková plocha:** 198 093 m²
- **Celkové oplocení:** 10 907 bm

Data jsou uložena přímo v `scripts/provozni-mapa.js` jako JavaScript pole.

---

## 🔧 Konfigurace

### Změna výchozího zobrazení mapy

V `scripts/provozni-mapa.js`:

```javascript
map = L.map('map').setView([49.15, 14.15], 10);
//                           [lat,   lng  ] zoom
```

### Změna clusteru

```javascript
clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,  // Poloměr clusteru
    spiderfyOnMaxZoom: true
});
```

### Přidání nového areálu

V `scripts/provozni-mapa.js` přidejte do pole `areas`:

```javascript
{
    id: 42,
    name: "Nový areál",
    district: "PI",
    lat: 49.123,
    lng: 14.456,
    area: 1000,
    fence: 100,
    cat: "I.",
    is_maintained: false
}
```

---

## 🐛 Řešení problémů

### Mapa se nezobrazuje

1. **Vyčistěte cache:**
   - Chrome: `Ctrl+Shift+Delete`
   - Firefox: `Ctrl+Shift+Delete`

2. **Hard refresh:**
   - Chrome: `Ctrl+Shift+R`
   - Firefox: `Ctrl+F5`

3. **Zkontrolujte konzoli:**
   - F12 → Console
   - Hledejte červené chyby

### Markery se nezobrazují

1. **Zkontrolujte data:**
   - Otevřete `scripts/provozni-mapa.js`
   - Ověřte, že pole `areas` obsahuje data

2. **Zkontrolujte konzoli:**
   - Měli byste vidět: `✅ Rendered 41 markers`

### Filtry nefungují

1. **Zkontrolujte event listenery:**
   - Konzole by měla zobrazit: `✅ Event listeners set up`

2. **Zkontrolujte ID elementů:**
   - `searchInput`, `districtFilter`, `maintainedToggle`

### Google Maps se neotevírá

1. **Zkontrolujte popup blocker:**
   - Povolte popup okna pro tuto stránku

2. **Zkontrolujte konzoli:**
   - Hledejte chyby při otevírání nového okna

---

## 📝 Changelog

### v6.1 (2025-12-25)
- ✅ **Google Maps integrace**
  - Tlačítko "🗺️ Google Maps" v popupu
  - Otevření areálu v Google Maps v nové záložce
  - Zobrazení GPS souřadnic v popupu
  - Toast notifikace při otevření
- ✅ Vylepšený popup design
  - Dual button layout (Toggle + Maps)
  - Širší popup (280px)
  - Lepší button styling
  - Hover animace

### v6.0 (2025-12-25)
- ✅ Kompletní přepsání aplikace
- ✅ Odstranění Firebase závislosti
- ✅ Zjednodušení kódu
- ✅ Oprava všech filtrů
- ✅ Oprava interaktivních markerů
- ✅ Vyčištění repozitáře

### v5.1 (2025-12-25)
- ✅ Auto-start bez Firebase
- ✅ Lepší console logging

### v5.0 (2025-12-25)
- ✅ Kompletní přepsání index.html
- ✅ Kompletní přepsání provozni-mapa.js
- ✅ XSS-safe popupy

---

## 🧪 Testování

### Automatický test
```
https://dominik-88.github.io/FOREST/test-connections.html
```
- Zkontroluje všechny závislosti
- Zkontroluje všechny DOM elementy
- Zkontroluje data (41 areálů)
- Zkontroluje funkce
- Interaktivní testy filtrů

### Bash skript
```bash
chmod +x verify.sh
./verify.sh
```
- Zkontroluje strukturu souborů
- Zkontroluje všechna propojení
- Vypočítá score
- Exit code pro CI/CD

---

## 👨‍💻 Autor

**Dominik Schmied**
- Email: d.schmied@lantaron.cz
- GitHub: [@Dominik-88](https://github.com/Dominik-88)

---

## 📄 Licence

Tento projekt je určen pro interní použití JVS.

---

## 🙏 Poděkování

- [Leaflet](https://leafletjs.com/) - Open-source JavaScript knihovna pro interaktivní mapy
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) - Clustering plugin
- [OpenStreetMap](https://www.openstreetmap.org/) - Mapové podklady
- [Open-Meteo](https://open-meteo.com/) - Počasí API
- [Font Awesome](https://fontawesome.com/) - Ikony
- [Google Maps](https://maps.google.com/) - Mapová integrace

---

**🎉 JVS Provozní Mapa v6.1 - Clean, Simple, Functional + Google Maps!**