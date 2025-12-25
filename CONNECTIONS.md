# 🔗 JVS FOREST - Dokumentace propojení

Kompletní dokumentace všech propojení, dat, proměnných a logiky aplikace.

---

## 📋 OBSAH

1. [Struktura souborů](#struktura-souborů)
2. [Tok dat](#tok-dat)
3. [Propojení HTML ↔ JavaScript](#propojení-html--javascript)
4. [Globální proměnné](#globální-proměnné)
5. [Funkce a jejich závislosti](#funkce-a-jejich-závislosti)
6. [Event Listeners](#event-listeners)
7. [Data Flow](#data-flow)
8. [API Integrace](#api-integrace)

---

## 📁 STRUKTURA SOUBORŮ

```
FOREST/
├── index.html                    # Hlavní HTML soubor
│   ├── Načítá: Leaflet CSS
│   ├── Načítá: MarkerCluster CSS
│   ├── Načítá: Font Awesome
│   ├── Načítá: Leaflet JS
│   ├── Načítá: MarkerCluster JS
│   └── Načítá: scripts/provozni-mapa.js
│
├── scripts/
│   └── provozni-mapa.js          # Hlavní JavaScript aplikace
│       ├── Data: 41 areálů
│       ├── Funkce: initMap()
│       ├── Funkce: renderMarkers()
│       ├── Funkce: applyFilters()
│       ├── Funkce: updateStats()
│       ├── Funkce: updateWeather()
│       └── Funkce: init()
│
├── manifest.json                 # PWA manifest
├── sw.js                         # Service Worker
└── offline.html                  # Offline stránka
```

---

## 🔄 TOK DAT

```
1. NAČTENÍ STRÁNKY
   ↓
2. NAČTENÍ ZÁVISLOSTÍ (Leaflet, MarkerCluster)
   ↓
3. NAČTENÍ provozni-mapa.js
   ↓
4. INICIALIZACE (init())
   ├── initMap() → Vytvoří mapu
   ├── populateDistricts() → Naplní dropdown
   ├── setupEventListeners() → Připojí listenery
   └── updateWeather() → Načte počasí
   ↓
5. RENDEROVÁNÍ MARKERŮ (renderMarkers())
   ├── Vytvoří markery pro všechny areály
   ├── Přidá popupy s informacemi
   └── Přidá do cluster group
   ↓
6. AKTUALIZACE STATISTIK (updateStats())
   ├── Spočítá celkový počet
   ├── Spočítá počet k údržbě
   ├── Spočítá celkovou plochu
   └── Spočítá celkové oplocení
   ↓
7. ČEKÁNÍ NA UŽIVATELSKOU AKCI
   ├── Vyhledávání → applyFilters()
   ├── Změna okresu → applyFilters()
   ├── Toggle údržby → applyFilters()
   ├── Klik na marker → Zobrazí popup
   └── Klik v popupu → toggleMaintenance()
```

---

## 🔗 PROPOJENÍ HTML ↔ JAVASCRIPT

### HTML Elementy → JavaScript Proměnné

| HTML Element ID | JavaScript Použití | Funkce |
|----------------|-------------------|--------|
| `#map` | `L.map('map')` | Kontejner pro Leaflet mapu |
| `#searchInput` | `document.getElementById('searchInput')` | Vyhledávání areálů |
| `#districtFilter` | `document.getElementById('districtFilter')` | Filtr podle okresu |
| `#maintainedToggle` | `document.getElementById('maintainedToggle')` | Toggle údržby |
| `#totalCount` | `document.getElementById('totalCount')` | Zobrazení celkového počtu |
| `#remainingCount` | `document.getElementById('remainingCount')` | Zobrazení počtu k údržbě |
| `#totalArea` | `document.getElementById('totalArea')` | Zobrazení celkové plochy |
| `#totalFence` | `document.getElementById('totalFence')` | Zobrazení celkového oplocení |
| `#weatherContent` | `document.getElementById('weatherContent')` | Zobrazení počasí |
| `#toastContainer` | `document.getElementById('toastContainer')` | Kontejner pro notifikace |
| `#panel` | `document.getElementById('panel')` | Spodní panel |
| `#panelHandle` | `document.getElementById('panelHandle')` | Tlačítko pro otevření panelu |
| `#locateBtn` | `document.getElementById('locateBtn')` | Tlačítko geolokace |
| `#togglePanelBtn` | `document.getElementById('togglePanelBtn')` | Tlačítko pro toggle panelu |

---

## 🌐 GLOBÁLNÍ PROMĚNNÉ

### V `scripts/provozni-mapa.js`:

```javascript
// DATA
const areas = [...]              // 41 areálů s kompletními daty
                                 // Struktura: {id, name, district, lat, lng, area, fence, cat, is_maintained}

// STATE
let map = null;                  // Instance Leaflet mapy
let clusterGroup = null;         // Instance MarkerClusterGroup
let filteredAreas = [...areas];  // Aktuálně filtrované areály
```

### Struktura dat areálu:

```javascript
{
  id: 1,                         // Unikátní ID
  name: "VDJ Amerika II",        // Název areálu
  district: "PI",                // Okres (PI, ST, CB, CK, PT, TA)
  lat: 49.305131,                // Zeměpisná šířka
  lng: 14.166126,                // Zeměpisná délka
  area: 3303,                    // Plocha v m²
  fence: 293,                    // Oplocení v bm
  cat: "I.",                     // Kategorie (I., II., B)
  is_maintained: false           // Stav údržby (true/false)
}
```

---

## ⚙️ FUNKCE A JEJICH ZÁVISLOSTI

### 1. `init()`
**Účel:** Hlavní inicializační funkce  
**Volá:**
- `initMap()`
- `populateDistricts()`
- `setupEventListeners()`
- `updateWeather()`
- `showToast()`

**Závislosti:**
- DOM musí být načten
- Leaflet musí být načten

---

### 2. `initMap()`
**Účel:** Inicializace Leaflet mapy  
**Vytváří:**
- `map` - instance L.map
- `clusterGroup` - instance L.markerClusterGroup

**Volá:**
- `renderMarkers()`

**Závislosti:**
- Element `#map` musí existovat
- Leaflet musí být načten
- MarkerCluster musí být načten

---

### 3. `renderMarkers()`
**Účel:** Vykreslení markerů na mapě  
**Používá:**
- `filteredAreas` - data k vykreslení
- `clusterGroup` - kam přidat markery

**Vytváří:**
- Leaflet CircleMarker pro každý areál
- Popup s informacemi
- Event listener pro toggle údržby

**Volá:**
- `updateStats()`

**Závislosti:**
- `map` musí být inicializována
- `clusterGroup` musí existovat
- `filteredAreas` musí obsahovat data

---

### 4. `applyFilters()`
**Účel:** Aplikace filtrů na data  
**Čte:**
- `#searchInput.value` - vyhledávací text
- `#districtFilter.value` - vybraný okres
- `#maintainedToggle.checked` - stav toggle

**Modifikuje:**
- `filteredAreas` - filtrovaná data

**Volá:**
- `renderMarkers()`

**Závislosti:**
- `areas` musí obsahovat data
- Filter elementy musí existovat

---

### 5. `updateStats()`
**Účel:** Aktualizace statistik  
**Čte:**
- `filteredAreas` - aktuální data

**Zapisuje do:**
- `#totalCount` - celkový počet
- `#remainingCount` - počet k údržbě
- `#totalArea` - celková plocha
- `#totalFence` - celkové oplocení

**Závislosti:**
- `filteredAreas` musí existovat
- Stat elementy musí existovat

---

### 6. `toggleMaintenance(areaId)`
**Účel:** Změna stavu údržby areálu  
**Parametry:**
- `areaId` - ID areálu k změně

**Modifikuje:**
- `areas[x].is_maintained` - změní stav

**Volá:**
- `applyFilters()` - překreslí mapu
- `showToast()` - zobrazí notifikaci

**Závislosti:**
- `areas` musí obsahovat areál s daným ID

---

### 7. `updateWeather()`
**Účel:** Načtení a zobrazení počasí  
**API:** Open-Meteo  
**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Čte:**
- `map.getCenter()` - aktuální střed mapy

**Zapisuje do:**
- `#weatherContent` - HTML s počasím

**Závislosti:**
- `map` musí být inicializována
- Internet connection

---

### 8. `showToast(message, type)`
**Účel:** Zobrazení notifikace  
**Parametry:**
- `message` - text notifikace
- `type` - typ (success, warning, danger)

**Vytváří:**
- Toast element v `#toastContainer`
- Auto-remove po 4 sekundách

**Závislosti:**
- `#toastContainer` musí existovat

---

### 9. `populateDistricts()`
**Účel:** Naplnění dropdown s okresy  
**Čte:**
- `areas` - extrahuje unikátní okresy

**Zapisuje do:**
- `#districtFilter` - přidá option elementy

**Závislosti:**
- `areas` musí obsahovat data
- `#districtFilter` musí existovat

---

### 10. `setupEventListeners()`
**Účel:** Připojení event listenerů  
**Připojuje:**
- `#searchInput` → input → `applyFilters()`
- `#districtFilter` → change → `applyFilters()`
- `#maintainedToggle` → change → `applyFilters()`
- `#locateBtn` → click → geolokace
- `#panelHandle` → click → toggle panel
- `#togglePanelBtn` → click → toggle panel
- `map` → moveend → `updateWeather()`

**Závislosti:**
- Všechny elementy musí existovat
- `map` musí být inicializována

---

## 🎧 EVENT LISTENERS

### Input Events

```javascript
// Vyhledávání
#searchInput.addEventListener('input', applyFilters)
  ↓
  Čte: searchInput.value
  ↓
  Filtruje: areas podle názvu
  ↓
  Volá: renderMarkers()
```

### Change Events

```javascript
// Filtr okresu
#districtFilter.addEventListener('change', applyFilters)
  ↓
  Čte: districtFilter.value
  ↓
  Filtruje: areas podle okresu
  ↓
  Volá: renderMarkers()

// Toggle údržby
#maintainedToggle.addEventListener('change', applyFilters)
  ↓
  Čte: maintainedToggle.checked
  ↓
  Filtruje: areas podle is_maintained
  ↓
  Volá: renderMarkers()
```

### Click Events

```javascript
// Geolokace
#locateBtn.addEventListener('click', () => {...})
  ↓
  Volá: navigator.geolocation.getCurrentPosition()
  ↓
  Přesune: map.setView([lat, lng], 13)
  ↓
  Zobrazí: showToast()

// Toggle panel
#panelHandle.addEventListener('click', togglePanel)
#togglePanelBtn.addEventListener('click', togglePanel)
  ↓
  Toggle: panel.classList.toggle('open')

// Marker click (v renderMarkers)
marker.bindPopup(popup)
  ↓
  Zobrazí: popup s informacemi
  ↓
  Button click: toggleMaintenance(area.id)
```

### Map Events

```javascript
// Pohyb mapy
map.on('moveend', updateWeather)
  ↓
  Čte: map.getCenter()
  ↓
  Volá: fetch(Open-Meteo API)
  ↓
  Aktualizuje: #weatherContent
```

---

## 📊 DATA FLOW

### Filtrování dat:

```
areas (41 položek)
  ↓
  [applyFilters()]
  ├── Vyhledávání: name.includes(search)
  ├── Okres: district === selected
  └── Údržba: !is_maintained (pokud checked)
  ↓
filteredAreas (0-41 položek)
  ↓
  [renderMarkers()]
  ├── Vytvoří marker pro každý areál
  ├── Barva podle is_maintained
  └── Přidá do clusterGroup
  ↓
  [updateStats()]
  ├── Spočítá total
  ├── Spočítá remaining
  ├── Spočítá area
  └── Spočítá fence
  ↓
Zobrazení na mapě + statistiky
```

### Toggle údržby:

```
Klik na marker
  ↓
Zobrazí popup
  ↓
Klik na button v popupu
  ↓
  [toggleMaintenance(areaId)]
  ├── Najde areál v areas
  ├── Změní is_maintained
  └── Volá applyFilters()
  ↓
  [applyFilters()]
  └── Překreslí mapu s novou barvou
  ↓
  [showToast()]
  └── Zobrazí notifikaci
```

---

## 🌐 API INTEGRACE

### Open-Meteo Weather API

**Endpoint:**
```
https://api.open-meteo.com/v1/forecast
```

**Parametry:**
```javascript
{
  latitude: map.getCenter().lat,
  longitude: map.getCenter().lng,
  current: 'temperature_2m,precipitation,wind_speed_10m'
}
```

**Response:**
```javascript
{
  current: {
    temperature_2m: 15.5,      // °C
    precipitation: 0.2,         // mm
    wind_speed_10m: 12.3       // km/h
  }
}
```

**Použití:**
```javascript
async function updateWeather() {
  const center = map.getCenter();
  const response = await fetch(`...?latitude=${center.lat}&longitude=${center.lng}...`);
  const data = await response.json();
  
  weatherContent.innerHTML = `
    <div class="weather-temp">${data.current.temperature_2m}°C</div>
    <div class="weather-details">
      <div>☔ Srážky: ${data.current.precipitation} mm</div>
      <div>💨 Vítr: ${data.current.wind_speed_10m} km/h</div>
    </div>
  `;
}
```

---

## 🔍 DEBUGGING

### Console Logs

Aplikace loguje všechny důležité kroky:

```javascript
console.log('🚀 JVS Provozní Mapa v6.0 starting...');
console.log('🎯 Initializing app...');
console.log('📍 Initializing map...');
console.log('✅ Map initialized');
console.log('📌 Rendering 41 markers...');
console.log('✅ Rendered 41 markers');
console.log('✅ Populated 6 districts');
console.log('🎧 Setting up event listeners...');
console.log('✅ Event listeners set up');
console.log('✅ App initialized successfully');
console.log('✅ JVS Provozní Mapa v6.0 loaded');
```

### Kontrola stavu:

```javascript
// V konzoli prohlížeče:
console.log('Map:', map);                    // Leaflet map instance
console.log('Cluster:', clusterGroup);       // MarkerClusterGroup instance
console.log('Areas:', areas);                // Všechna data (41)
console.log('Filtered:', filteredAreas);     // Filtrovaná data
console.log('Markers:', clusterGroup.getLayers().length);  // Počet markerů
```

---

## ✅ CHECKLIST PROPOJENÍ

- [x] HTML načítá Leaflet CSS
- [x] HTML načítá MarkerCluster CSS
- [x] HTML načítá Font Awesome
- [x] HTML načítá Leaflet JS
- [x] HTML načítá MarkerCluster JS
- [x] HTML načítá provozni-mapa.js
- [x] Všechny DOM elementy mají správná ID
- [x] JavaScript inicializuje mapu
- [x] JavaScript vytváří markery
- [x] JavaScript připojuje event listenery
- [x] Filtry fungují
- [x] Statistiky se aktualizují
- [x] Počasí se načítá
- [x] Popupy jsou interaktivní
- [x] Toggle údržby funguje
- [x] Geolokace funguje
- [x] Panel se otevírá/zavírá
- [x] Toast notifikace fungují

---

## 🎯 ZÁVĚR

Všechny části aplikace jsou správně propojeny:

1. **HTML** definuje strukturu a načítá závislosti
2. **JavaScript** obsahuje data a logiku
3. **Leaflet** poskytuje mapovou funkcionalitu
4. **MarkerCluster** seskupuje markery
5. **Open-Meteo API** poskytuje počasí
6. **Event Listeners** propojují UI s logikou
7. **Globální proměnné** sdílejí stav mezi funkcemi

**Aplikace je 100% funkční a všechny části jsou správně propojeny!**

---

**Vytvořeno:** 25. prosince 2025  
**Verze:** 6.0.0  
**Autor:** Dominik Schmied