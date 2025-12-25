# 🗺️ JVS Provozní Mapa - Dokumentace

## 📋 Přehled

Provozní mapa je pokročilá webová aplikace pro správu vodárenských areálů s integrací Firebase, real-time synchronizací a pokročilými funkcemi pro plánování údržby.

---

## ✨ Funkce

### 📍 Správa Areálů
- **41 vodárenských areálů** v Jihočeském kraji
- **Real-time synchronizace** s Firebase Firestore
- **Offline podpora** s LocalStorage fallback
- **Kategorizace** (I., II., Bez kategorie)
- **Sledování údržby** (datum, status)

### 🗺️ Interaktivní Mapa
- **Leaflet** s OpenStreetMap/Satelitní podklad
- **Clustering** pro přehlednost
- **Heatmapa rizika** podle priority údržby
- **Vlastní markery** podle stavu údržby
- **Geolokace** uživatele

### 📊 Rizikové Skóre
Automatický výpočet rizika pro každý areál:
- **Časové skóre** (0-1): Dny od poslední údržby / 180 dní
- **Kategorie váha**: I. = 1.0, II. = 0.5, Bez = 0.2
- **Kombinace**: 60% čas + 40% kategorie
- **Vizualizace**: Zelená (OK) → Oranžová (Varování) → Červená (Kritické)

### 🛣️ Plánování Tras
- **OSRM routing** pro optimalizaci tras
- **Drag & drop** bodů trasy
- **Výpočet vzdálenosti** a času
- **Perzistence** v LocalStorage
- **Export** do Google Maps

### 🎨 Kreslicí Nástroje
- **Měření plochy** (polygon)
- **Měření vzdálenosti** (polyline)
- **Přidání areálu** (marker)
- **Leaflet Draw** integrace

### ☁️ Počasí
- **Open-Meteo API** integrace
- **Real-time data** pro centrum mapy
- **Kvalita vzduchu** (PM10, PM2.5)
- **Automatická aktualizace** každých 10 minut

---

## 🔒 Bezpečnost

### XSS Protection
```javascript
// ❌ UNSAFE
popup.innerHTML = `<h3>${area.name}</h3>`;

// ✅ SAFE
const title = document.createElement('h3');
title.textContent = area.name; // Automatické escapování
popup.appendChild(title);
```

### Scoped LocalStorage
```javascript
// ✅ Prefixované klíče
localStorage.setItem('jvs_areal_data', data);
localStorage.setItem('jvs_route_points', data);

// ❌ NIKDY nepoužívat
localStorage.clear(); // Smaže VŠE na doméně!
```

### Event Delegation
```javascript
// ✅ Event listeners v JS
button.addEventListener('click', handler);

// ❌ NIKDY inline onclick
<button onclick="handler()">
```

---

## 🔥 Firebase Integrace

### Konfigurace
```javascript
const firebaseConfig = {
    apiKey: "...",
    authDomain: "jvs-management.firebaseapp.com",
    projectId: "jvs-management",
    storageBucket: "jvs-management.firebasestorage.app",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "..."
};
```

### Firestore Struktura
```
artifacts/
  └── {appId}/
      └── public/
          └── data/
              └── {userId}_areals/
                  ├── {docId1}
                  ├── {docId2}
                  └── ...
```

### Real-time Sync
```javascript
window.onSnapshot(colRef, (snapshot) => {
    const firestoreAreas = snapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id
    }));
    
    app.arealData = firestoreAreas;
    applyFilters();
});
```

---

## 📊 Data Struktura

### Areál Object
```javascript
{
    id: 'vdj_amerika_ii',
    name: "VDJ Amerika II",
    district: "PI",
    lat: 49.305131,
    lng: 14.166126,
    area: 3303,              // m²
    fence: 293,              // bm
    cat: "I.",               // I., II., nebo B (bez)
    last_maintenance: '2025-05-15',
    is_maintained: false,
    docId: 'firebase-doc-id' // Firestore document ID
}
```

### Route Point
```javascript
{
    docId: 'firebase-doc-id',
    name: "VDJ Amerika II",
    lat: 49.305131,
    lng: 14.166126
}
```

---

## 🎯 Použití

### Základní Workflow

1. **Zobrazení areálů**
   - Mapa se načte s 41 areály
   - Clustering pro přehlednost
   - Kliknutím na marker zobrazíte detail

2. **Filtrace**
   - Vyhledávání podle názvu
   - Filtr podle okresu (CB, TA, PT, CK, PI, ST)
   - Toggle "Jen k údržbě"

3. **Změna stavu údržby**
   - Klikněte na areál
   - Tlačítko "Hotovo" / "K údržbě"
   - Automatická synchronizace s Firebase

4. **Plánování trasy**
   - Klikněte "Trasa" u areálu
   - Přidejte minimálně 2 areály
   - OSRM vypočítá optimální trasu

5. **Přidání nového areálu**
   - Tlačítko "Přidat nový areál"
   - Klikněte na mapu pro umístění
   - Vyplňte formulář

---

## 🛠️ API Reference

### Funkce

#### `showToast(message, type)`
Zobrazí toast notifikaci.
```javascript
showToast('Areál uložen', 'success');
// Types: primary, success, warning, danger
```

#### `calculateRiskScore(area)`
Vypočítá rizikové skóre (0-1).
```javascript
const score = calculateRiskScore(area);
// 0 = žádné riziko, 1 = maximální riziko
```

#### `syncDataFromFirestore()`
Synchronizuje data z Firestore.
```javascript
await syncDataFromFirestore();
```

#### `renderMarkers()`
Vykreslí markery na mapě (XSS-safe).
```javascript
renderMarkers();
```

#### `applyFilters()`
Aplikuje filtry na areály.
```javascript
applyFilters();
```

#### `addToRoute(docId)`
Přidá areál do trasy.
```javascript
addToRoute('firebase-doc-id');
```

#### `updateRoute()`
Aktualizuje trasu s OSRM.
```javascript
updateRoute();
```

#### `toggleMaintenanceStatus(docId)`
Přepne stav údržby areálu.
```javascript
await toggleMaintenanceStatus('firebase-doc-id');
```

---

## 📱 Mobilní Optimalizace

### iOS Fixes
```javascript
// 100dvh fallback
@supports (-webkit-touch-callout: none) {
    body, #mapWrapper { height: -webkit-fill-available; }
}

// Orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => app.map.invalidateSize(), 500);
});
```

### Touch Gestures
- **Pinch to zoom** - Leaflet nativní podpora
- **Swipe panel** - Bottom sheet s drag handle
- **Tap markers** - Zobrazí popup s detaily

---

## 🔧 Konfigurace

### Heatmap Gradient
```javascript
app.heatLayer = L.heatLayer([], {
    radius: 40, 
    blur: 25, 
    maxZoom: 13, 
    gradient: {
        0.0: '#10b981', // Zelená (OK)
        0.5: '#f59e0b', // Oranžová (Varování)
        1.0: '#ef4444'  // Červená (Kritické)
    }
});
```

### Clustering
```javascript
app.clusterGroup = L.markerClusterGroup({ 
    disableClusteringAtZoom: 14,
    maxClusterRadius: 50
});
```

### OSRM Router
```javascript
router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1'
})
```

---

## 🐛 Troubleshooting

### Problém: Mapa se nenačte
**Řešení:**
```javascript
setTimeout(() => app.map.invalidateSize(), 100);
```

### Problém: Firebase sync selhává
**Řešení:**
- Zkontrolujte Firebase config
- Ověřte autentizaci
- Fallback na LocalStorage

### Problém: Trasa se nevypočítá
**Řešení:**
- Minimálně 2 body
- OSRM server dostupný
- Platné GPS souřadnice

### Problém: Heatmapa se nezobrazuje
**Řešení:**
```javascript
// Toggle checkbox
document.getElementById('heatmapToggle').checked = true;
app.map.addLayer(app.heatLayer);
```

---

## 📊 Statistiky

### Výkon
- **Načtení**: < 2s
- **Render 41 areálů**: < 500ms
- **Firebase sync**: Real-time
- **OSRM routing**: < 3s

### Data
- **Areály**: 41
- **Okresy**: 6 (CB, TA, PT, CK, PI, ST)
- **Kategorie**: I., II., Bez
- **Celková plocha**: ~200,000 m²

---

## 🔗 Externí API

### Open-Meteo
```
https://api.open-meteo.com/v1/forecast
?latitude={lat}
&longitude={lng}
&current=temperature_2m,precipitation,wind_speed_10m,cloud_cover
&hourly=pm10,pm2_5
&forecast_days=1
```

### OSRM
```
https://router.project-osrm.org/route/v1/driving/{coords}
?overview=full
&geometries=geojson
```

### Google Maps
```
https://www.google.com/maps/search/?api=1&query={lat},{lng}
```

---

## 📝 Changelog

### v4.0.0 (2025-12-25)
- 🔒 XSS protection (createElement + textContent)
- 🔥 Firebase Firestore integration
- 🗺️ OSRM routing
- 📊 Risk score calculation
- ☁️ Weather integration
- 🎨 Heatmap visualization
- 📱 Mobile optimization
- 🛠️ Draw tools

---

## 👨‍💻 Autor

**Dominik Schmied**
- Email: d.schmied@lantaron.cz
- GitHub: [@Dominik-88](https://github.com/Dominik-88)

---

## 📄 Licence

MIT License - viz [LICENSE](../LICENSE)

---

**Vytvořeno: 25. prosince 2025**
**Verze: 4.0.0**
**Status: ✅ Production Ready**