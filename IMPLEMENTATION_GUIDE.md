# 📖 JVS Ultimate PRO - Implementační Průvodce

**Kompletní návod pro nasazení, konfiguraci a rozšíření aplikace.**

---

## 🎯 **OBSAH**

1. [Rychlé Nasazení](#rychlé-nasazení)
2. [Konfigurace](#konfigurace)
3. [Firebase Integrace](#firebase-integrace)
4. [Gemini AI Setup](#gemini-ai-setup)
5. [Rozšíření Funkcí](#rozšíření-funkcí)
6. [Optimalizace](#optimalizace)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 **RYCHLÉ NASAZENÍ**

### **Metoda 1: GitHub Pages (Doporučeno)**

```bash
# 1. Forkněte repozitář
git clone https://github.com/Dominik-88/FOREST.git
cd FOREST

# 2. Aktivujte GitHub Pages
# Settings → Pages → Source: main branch

# 3. Otevřete aplikaci
https://your-username.github.io/FOREST/jvs-ultimate-pro.html
```

### **Metoda 2: Lokální Server**

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# Otevřete: http://localhost:8000/jvs-ultimate-pro.html
```

### **Metoda 3: Netlify/Vercel**

```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod
```

---

## ⚙️ **KONFIGURACE**

### **1. Základní Nastavení**

Upravte konstanty v `jvs-ultimate-pro.html`:

```javascript
const CONFIG = {
    defaultCenter: [49.15, 14.35],  // GPS střed mapy
    defaultZoom: 10,                 // Výchozí zoom
    avgSpeed: 50,                    // km/h pro výpočet času
    storageKey: 'jvs_ultimate_v1',   // LocalStorage klíč
    maintenanceDays: 7,              // Dny pro "hotovo" status
    weatherUpdateInterval: 600000    // 10 minut
};
```

### **2. Přidání Nových Areálů**

```javascript
// Přidejte do arealData array:
{
    id: 42,
    nazev: "VDJ Nový Areál",
    okres: "CB",
    kategorie: "I.",
    oploceni: 250,
    vymera: 3500,
    lat: 49.123456,
    lon: 14.654321
}
```

### **3. Vlastní Barvy**

```css
:root {
    --primary: #0055ff;      /* Hlavní barva */
    --success: #10b981;      /* Úspěch */
    --danger: #ef4444;       /* Kritické */
    --warning: #f59e0b;      /* Varování */
}
```

---

## 🔥 **FIREBASE INTEGRACE**

### **1. Vytvoření Firebase Projektu**

```bash
# 1. Jděte na https://console.firebase.google.com
# 2. Vytvořte nový projekt "JVS-Management"
# 3. Aktivujte Realtime Database
# 4. Zkopírujte konfiguraci
```

### **2. Přidání Firebase SDK**

```html
<!-- Přidejte před </body> -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>

<script>
// Firebase konfigurace
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "jvs-management.firebaseapp.com",
    databaseURL: "https://jvs-management-default-rtdb.firebaseio.com",
    projectId: "jvs-management",
    storageBucket: "jvs-management.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
</script>
```

### **3. Realtime Sync**

```javascript
// Načtení dat z Firebase
function loadFromFirebase() {
    db.ref('areals').on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            arealData = Object.values(data);
            createMarkers(arealData);
            updateStats(arealData);
        }
    });
}

// Uložení do Firebase
function saveToFirebase(areal) {
    db.ref('areals/' + areal.id).set(areal)
        .then(() => showToast('Data synchronizována', 'success'))
        .catch(err => showToast('Chyba: ' + err.message, 'danger'));
}

// Autentizace
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(user => {
            showToast('Přihlášen: ' + user.email, 'success');
            loadFromFirebase();
        })
        .catch(err => showToast('Chyba: ' + err.message, 'danger'));
}
```

### **4. Firebase Rules**

```json
{
  "rules": {
    "areals": {
      ".read": "auth != null",
      ".write": "auth != null && (
        root.child('users').child(auth.uid).child('role').val() == 'admin' ||
        root.child('users').child(auth.uid).child('role').val() == 'editor'
      )"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## 🤖 **GEMINI AI SETUP**

### **1. Získání API Klíče**

```bash
# 1. Jděte na https://makersuite.google.com/app/apikey
# 2. Vytvořte nový API klíč
# 3. Zkopírujte klíč
```

### **2. Integrace do Aplikace**

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

async function generateAIProtocol() {
    if (selectedRoute.length === 0) {
        showToast('Vytvořte trasu', 'warning');
        return;
    }
    
    openAIModal();
    document.getElementById('aiContent').innerHTML = '<p style="text-align:center;">Generuji protokol...</p>';
    
    // Příprava promptu
    let dist = 0;
    for (let i = 0; i < selectedRoute.length - 1; i++) {
        const p1 = L.latLng(selectedRoute[i].lat, selectedRoute[i].lon);
        const p2 = L.latLng(selectedRoute[i+1].lat, selectedRoute[i+1].lon);
        dist += p1.distanceTo(p2);
    }
    const km = (dist / 1000) * 1.3;
    const mins = (km / CONFIG.avgSpeed) * 60;
    
    const prompt = `Vytvořte PROFESIONÁLNÍ PROTOKOL ÚDRŽBY pro ${selectedRoute.length} vodárenských areálů JVS:

TRASA (${km.toFixed(1)}km, ${Math.round(mins)}min):
${selectedRoute.map((a, i) => `${i+1}. ${a.nazev} (${a.okres}, ${a.kategorie || 'N/A'})`).join('\n')}

POŽADAVKY:
• Časový harmonogram (30min/areál)
• Kontrolní seznam úkolů pro každý areál
• Bezpečnostní pokyny
• Materiálové potřeby
• Profesionální formát připravený pro PDF export

Formát: Strukturovaný text v češtině, použij emoji pro lepší čitelnost.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );
        
        const data = await response.json();
        const protocol = data.candidates[0].content.parts[0].text;
        
        document.getElementById('aiContent').innerHTML = `
            <pre style="background:#f8fafc;padding:16px;border-radius:10px;font-size:12px;font-family:monospace;white-space:pre-wrap;max-height:60vh;overflow-y:auto;">${protocol}</pre>
            <button class="btn btn-primary" onclick="downloadPDF()" style="margin-top:16px;">
                <i class="fas fa-download"></i> Stáhnout PDF
            </button>
        `;
        
        window.currentProtocol = protocol;
        
    } catch (error) {
        console.error('Gemini API Error:', error);
        showToast('AI nedostupné - použit fallback', 'warning');
        generateFallbackProtocol();
    }
}
```

### **3. Rate Limiting**

```javascript
// Implementace rate limitingu
let lastAICall = 0;
const AI_COOLDOWN = 5000; // 5 sekund

function canCallAI() {
    const now = Date.now();
    if (now - lastAICall < AI_COOLDOWN) {
        const remaining = Math.ceil((AI_COOLDOWN - (now - lastAICall)) / 1000);
        showToast(`Počkejte ${remaining}s před dalším voláním`, 'warning');
        return false;
    }
    lastAICall = now;
    return true;
}
```

---

## 🔧 **ROZŠÍŘENÍ FUNKCÍ**

### **1. Přidání Geofencing Notifikací**

```javascript
// Kontrola vzdálenosti od areálů
function checkGeofencing() {
    if (!userLocation) return;
    
    arealData.forEach(areal => {
        const distance = L.latLng(userLocation.lat, userLocation.lon)
            .distanceTo(L.latLng(areal.lat, areal.lon));
        
        if (distance < 500 && areal.kategorie === 'I.') {
            showNotification(
                'Blížíte se k areálu',
                `${areal.nazev} - ${Math.round(distance)}m`
            );
        }
    });
}

// Push notifikace
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,...',
            badge: 'data:image/svg+xml,...'
        });
    }
}

// Požádat o povolení
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showToast('Notifikace povoleny', 'success');
            }
        });
    }
}
```

### **2. Foto Upload (Firebase Storage)**

```javascript
// Přidání Firebase Storage
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>

const storage = firebase.storage();

// Upload fotky
async function uploadPhoto(arealId, file) {
    const storageRef = storage.ref(`areals/${arealId}/${Date.now()}_${file.name}`);
    
    try {
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        
        // Uložit URL do databáze
        db.ref(`areals/${arealId}/photos`).push({
            url: url,
            timestamp: Date.now()
        });
        
        showToast('Fotka nahrána', 'success');
        return url;
    } catch (error) {
        showToast('Chyba: ' + error.message, 'danger');
    }
}

// HTML input
<input type="file" accept="image/*" capture="camera" onchange="handlePhotoUpload(event)">

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file && currentArealId) {
        uploadPhoto(currentArealId, file);
    }
}
```

### **3. Export do Google Sheets**

```javascript
// Google Sheets API
const SHEETS_API_KEY = 'YOUR_SHEETS_API_KEY';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

async function exportToSheets() {
    const values = [
        ['ID', 'Název', 'Okres', 'Kategorie', 'Výměra', 'Oplocení', 'Lat', 'Lon', 'Údržba']
    ];
    
    arealData.forEach(a => {
        values.push([
            a.id,
            a.nazev,
            a.okres,
            a.kategorie || '',
            a.vymera,
            a.oploceni,
            a.lat,
            a.lon,
            a.lastMaintenance ? new Date(a.lastMaintenance).toLocaleDateString('cs-CZ') : ''
        ]);
    });
    
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Areály!A1:append?valueInputOption=RAW&key=${SHEETS_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: values })
            }
        );
        
        if (response.ok) {
            showToast('Data exportována do Google Sheets', 'success');
        }
    } catch (error) {
        showToast('Chyba: ' + error.message, 'danger');
    }
}
```

---

## ⚡ **OPTIMALIZACE**

### **1. Lazy Loading Markerů**

```javascript
// Načítání markerů pouze v zobrazené oblasti
let visibleMarkers = [];

map.on('moveend', () => {
    const bounds = map.getBounds();
    
    // Odstraň markery mimo viewport
    visibleMarkers.forEach(m => {
        if (!bounds.contains(m.getLatLng())) {
            markerCluster.removeLayer(m);
        }
    });
    
    // Přidej markery ve viewportu
    arealData.forEach(areal => {
        if (bounds.contains([areal.lat, areal.lon])) {
            const marker = createMarker(areal);
            markerCluster.addLayer(marker);
            visibleMarkers.push(marker);
        }
    });
});
```

### **2. Debouncing Filtrů**

```javascript
// Debounce pro vyhledávání
let searchTimeout;

function applyFiltersDebounced() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 300);
}

// Použití
<input type="text" oninput="applyFiltersDebounced()">
```

### **3. IndexedDB pro Velká Data**

```javascript
// Použití IndexedDB místo LocalStorage
const dbName = 'JVS_DB';
const storeName = 'areals';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
        };
    });
}

async function saveToIndexedDB(data) {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    data.forEach(item => store.put(item));
    
    return tx.complete;
}

async function loadFromIndexedDB() {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    return store.getAll();
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Problém 1: Mapa se nenačítá**

```javascript
// Řešení:
// 1. Zkontrolujte konzoli (F12)
// 2. Ověřte Leaflet CSS/JS
// 3. Zkuste:

if (typeof L === 'undefined') {
    console.error('Leaflet není načten!');
    document.body.innerHTML = '<h1>Chyba: Leaflet nenačten</h1>';
}
```

### **Problém 2: Markery se nezobrazují**

```javascript
// Debug:
console.log('Počet areálů:', arealData.length);
console.log('Markery v clusteru:', markerCluster.getLayers().length);

// Zkuste vynutit refresh:
markerCluster.clearLayers();
createMarkers(arealData);
```

### **Problém 3: Firebase nefunguje**

```javascript
// Testování připojení:
db.ref('.info/connected').on('value', snapshot => {
    if (snapshot.val() === true) {
        console.log('✅ Firebase připojeno');
    } else {
        console.log('❌ Firebase odpojeno');
    }
});
```

### **Problém 4: PWA se neinstaluje**

```javascript
// Kontrola manifest.json:
fetch('/manifest.json')
    .then(r => r.json())
    .then(data => console.log('Manifest OK:', data))
    .catch(err => console.error('Manifest chyba:', err));

// Kontrola Service Worker:
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(regs => console.log('SW registrace:', regs));
}
```

---

## 📊 **MONITORING & ANALYTICS**

### **Google Analytics**

```html
<!-- Přidejte před </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX');

// Custom events
function trackEvent(category, action, label) {
    gtag('event', action, {
        'event_category': category,
        'event_label': label
    });
}

// Použití:
trackEvent('Route', 'optimize', 'TSP Algorithm');
trackEvent('Export', 'csv', 'Areals Data');
</script>
```

### **Error Tracking (Sentry)**

```html
<script src="https://browser.sentry-cdn.com/7.91.0/bundle.min.js"></script>
<script>
Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0
});

// Automatické zachycení chyb
window.addEventListener('error', (event) => {
    Sentry.captureException(event.error);
});
</script>
```

---

## 🎓 **BEST PRACTICES**

### **1. Kód Organizace**

```javascript
// Použijte moduly (ES6)
// map.module.js
export class MapManager {
    constructor(config) {
        this.map = L.map('map', config);
    }
    
    addMarker(lat, lon, options) {
        return L.marker([lat, lon], options).addTo(this.map);
    }
}

// main.js
import { MapManager } from './map.module.js';
const mapManager = new MapManager({ center: [49.15, 14.35], zoom: 10 });
```

### **2. Error Handling**

```javascript
// Vždy používejte try-catch
async function safeOperation() {
    try {
        const result = await riskyOperation();
        return result;
    } catch (error) {
        console.error('Chyba:', error);
        showToast('Operace selhala: ' + error.message, 'danger');
        return null;
    }
}
```

### **3. Performance**

```javascript
// Použijte requestAnimationFrame pro animace
function smoothScroll(element, target) {
    const start = element.scrollTop;
    const distance = target - start;
    const duration = 500;
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        element.scrollTop = start + distance * easeInOutCubic(progress);
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

---

## 📚 **DALŠÍ ZDROJE**

- **Leaflet Docs**: https://leafletjs.com/reference.html
- **Chart.js Docs**: https://www.chartjs.org/docs/
- **Firebase Docs**: https://firebase.google.com/docs
- **Gemini AI**: https://ai.google.dev/docs
- **PWA Guide**: https://web.dev/progressive-web-apps/

---

**Vytvořeno s ❤️ pomocí Bhindi AI**