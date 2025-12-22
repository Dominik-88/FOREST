# ⚡ Quick Start - 5 Minut k Funkční Aplikaci

## 🎯 Cíl

Spustit JVS Management System lokálně během 5 minut pro okamžité testování.

---

## 📋 Prerekvizity

- ✅ Git nainstalován
- ✅ Python 3 nebo Node.js
- ✅ Moderní webový prohlížeč (Chrome doporučeno)

---

## 🚀 Krok za Krokem

### 1️⃣ Klonování (30 sekund)

```bash
git clone https://github.com/Dominik-88/FOREST.git
cd FOREST
```

### 2️⃣ Firebase Setup (2 minuty)

**A) Vytvořte Firebase projekt:**
1. Otevřete [console.firebase.google.com](https://console.firebase.google.com)
2. Klikněte **"Add project"**
3. Název: `jvs-management`
4. Klikněte **"Create project"**

**B) Aktivujte Firestore:**
1. Levé menu → **"Firestore Database"**
2. **"Create database"**
3. **"Start in production mode"**
4. Lokace: **"europe-west3 (Frankfurt)"**
5. **"Enable"**

**C) Získejte konfiguraci:**
1. Project Settings (⚙️) → **"General"**
2. Scroll dolů → **"Your apps"**
3. Klikněte **Web icon** `</>`
4. Název: `JVS Management`
5. **Zkopírujte** `firebaseConfig` objekt

**D) Aktualizujte konfiguraci:**

Otevřete `firebase-config.js` a nahraďte:

```javascript
export const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
    messagingSenderId: "PASTE_YOUR_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};
```

### 3️⃣ Migrace Dat (1 minuta)

```bash
cd scripts
npm install firebase
node migrate-to-firestore.js
```

Měli byste vidět:
```
✅ Migration completed successfully!
📊 Migrated 41 areals to Firestore
```

### 4️⃣ Spuštění (30 sekund)

**Varianta A - Python:**
```bash
cd ..
python -m http.server 8000
```

**Varianta B - Node.js:**
```bash
cd ..
npx http-server -p 8000
```

**Varianta C - PHP:**
```bash
cd ..
php -S localhost:8000
```

### 5️⃣ Otevření (10 sekund)

Otevřete prohlížeč na:
```
http://localhost:8000/index-enhanced.html
```

---

## ✅ Co Byste Měli Vidět

### Při Načtení:

1. **Loader** s textem "Načítání aplikace..."
2. **Mapa** s 41 barevnými markery
3. **Postranní panel** s filtry a statistikami
4. **Toast notifikace** "JVS Management System připraven"

### Funkční Testy:

#### Test 1: Mapa ✅
- Klikněte na marker → Zobrazí se popup
- Klikněte "Zobrazit detail" → Otevře se bottom sheet

#### Test 2: Filtry ✅
- Vyberte okres "České Budějovice" → Mapa zobrazí pouze CB areály
- Statistiky se aktualizují v reálném čase

#### Test 3: Vyhledávání ✅
- Zadejte "Hlavatce" do vyhledávání
- Mapa zobrazí pouze VDJ Hlavatce

#### Test 4: AI Asistent ✅
- Přepněte na záložku "AI Asistent"
- Zadejte: "Kolik je celkem areálů?"
- AI odpoví s detailními statistikami

#### Test 5: Bottom Sheet ✅
- Klikněte na marker
- Klikněte "Zobrazit detail"
- Swipe dolů pro zavření (mobil)
- Klikněte "Navigovat" → Mapa se přiblíží

#### Test 6: Offline Mode ✅
- Vypněte internet
- Obnovte stránku (F5)
- Aplikace stále funguje!
- Zapněte internet → Automatická synchronizace

---

## 🎨 Screenshoty Očekávaného Výsledku

### Desktop View:
```
┌─────────────────────────────────────────────────────┐
│ [Sidebar]              │         [Mapa]             │
│                        │                            │
│ 📊 Statistiky          │    🗺️ 41 markerů          │
│ Celkem: 41             │    (barevně podle rizika)  │
│ Plocha: 181,947 m²     │                            │
│                        │    🔴 Kritické             │
│ 🔍 Filtry              │    🟠 Vysoké               │
│ [Okres ▼]              │    🟡 Střední              │
│ [Kategorie ▼]          │    🟢 Nízké                │
│ [Stav ▼]               │                            │
│                        │                            │
└─────────────────────────────────────────────────────┘
```

### Mobile View:
```
┌──────────────────┐
│   [Mapa]         │
│                  │
│   🗺️ Markery    │
│                  │
│                  │
│                  │
└──────────────────┘
     ↓ Swipe up
┌──────────────────┐
│ Bottom Sheet     │
│ ─────            │
│ VDJ Hlavatce     │
│ 🔴 Vysoké riziko │
│ 7,968 m²         │
│ [Navigovat] [+]  │
└──────────────────┘
```

---

## 🐛 Troubleshooting

### Problém: "Failed to fetch"

**Řešení:**
```bash
# Zkontrolujte firebase-config.js
# Ujistěte se, že jste zkopírovali správnou konfiguraci
```

### Problém: Mapa se nenačítá

**Řešení:**
```bash
# Zkontrolujte konzoli (F12)
# Ujistěte se, že máte internetové připojení
# Leaflet skripty se načítají z CDN
```

### Problém: Žádné markery na mapě

**Řešení:**
```bash
# Zkontrolujte, zda migrace proběhla úspěšně
cd scripts
node migrate-to-firestore.js

# Ověřte v Firebase Console:
# Firestore Database → areals → mělo by být 41 dokumentů
```

### Problém: AI asistent neodpovídá

**Řešení:**
```
AI funguje i bez Gemini API!
Používá lokální zpracování dotazů.
Zkuste jednoduchý dotaz: "Kolik je celkem areálů?"
```

---

## 🎓 Další Kroky

Po úspěšném lokálním testování:

1. **Přečtěte si:** [SETUP_GUIDE.md](./SETUP_GUIDE.md) pro production deployment
2. **Prozkoumejte:** [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) pro přehled funkcí
3. **Nasaďte:** Firebase Hosting / Netlify / Vercel

---

## 📞 Potřebujete Pomoc?

- 📖 [Dokumentace](./README.md)
- 🐛 [Issues](https://github.com/Dominik-88/FOREST/issues)
- 📧 Email: d.schmied@lantaron.cz

---

## ⏱️ Časová Osa

- **0:00** - Klonování repozitáře
- **0:30** - Firebase projekt vytvořen
- **2:30** - Konfigurace zkopírována
- **3:30** - Data migrována
- **4:00** - Server spuštěn
- **5:00** - ✅ **Aplikace běží!**

---

**Užijte si testování! 🚀**

🌲 **FOREST** - *Future-Oriented Resource & Estate System Technology*
