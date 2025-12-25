# 🔥 Firebase Hosting - Deployment Guide

## 📋 Přehled

Aplikace JVS FOREST je připravena k nasazení na Firebase Hosting s projektem **jvs-management**.

---

## 🔧 Konfigurace

### Firebase Project
- **Project Name**: jvs-management
- **Project ID**: jvs-management
- **Project Number**: 838496450152
- **Hosting URL**: https://jvs-management.web.app

### Firebase App
- **App Nickname**: JVS Management Web
- **App ID**: 1:838496450152:web:0bb64f9d64e1ea0ee5addd
- **Linked Site**: jvs-management

---

## 📦 Instalace Firebase CLI

### Krok 1: Instalace
```bash
# Globální instalace Firebase CLI
npm install -g firebase-tools

# Ověření instalace
firebase --version
```

### Krok 2: Přihlášení
```bash
# Přihlášení k Firebase účtu
firebase login

# Ověření přihlášení
firebase projects:list
```

---

## 🚀 Deployment

### Metoda 1: Manuální deployment

```bash
# 1. Přejděte do složky projektu
cd FOREST

# 2. Inicializace Firebase (pouze poprvé)
firebase init hosting

# Odpovědi na otázky:
# - What do you want to use as your public directory? → .
# - Configure as a single-page app? → Yes
# - Set up automatic builds with GitHub? → No
# - File index.html already exists. Overwrite? → No

# 3. Deploy na Firebase Hosting
firebase deploy --only hosting

# 4. Otevřete aplikaci
firebase open hosting:site
```

### Metoda 2: GitHub Actions (automatický)

Vytvořte `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: jvs-management
```

---

## 📁 Struktura pro deployment

```
FOREST/
├── index.html              # ✅ Hlavní stránka
├── offline.html            # ✅ Offline stránka
├── manifest.json           # ✅ PWA manifest
├── sw.js                   # ✅ Service Worker
├── firebase.json           # ✅ Firebase config
├── .firebaserc             # ✅ Project alias
├── .firebaseignore         # ✅ Ignore rules
│
├── data/                   # ✅ Data
│   └── areals-2025-updated.json
│
├── scripts/                # ✅ JavaScript
│   ├── app.js
│   └── firebase-config.js
│
└── styles/                 # ✅ CSS
    └── main.css
```

---

## ⚙️ Firebase Configuration

### firebase.json
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/*.md"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "jvs-management"
  }
}
```

---

## 🔒 Bezpečnostní hlavičky

Firebase Hosting automaticky přidává:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📊 Analytics

Firebase Analytics je aktivní:
- **Measurement ID**: G-ZR4GGRHVBQ
- **Tracking**: Automatické
- **Dashboard**: Firebase Console → Analytics

---

## 🌐 Custom Domain (volitelné)

### Přidání vlastní domény:

```bash
# 1. Přidejte doménu v Firebase Console
firebase hosting:channel:deploy production

# 2. Nastavte DNS záznamy
# A record: 151.101.1.195
# A record: 151.101.65.195

# 3. Ověřte doménu
# Postupujte podle instrukcí v konzoli
```

---

## 🔄 Aktualizace aplikace

### Postup:

```bash
# 1. Proveďte změny v kódu
git add .
git commit -m "Update: description"
git push origin main

# 2. Deploy nové verze
firebase deploy --only hosting

# 3. Ověřte změny
# Otevřete https://jvs-management.web.app
```

### Cache invalidation:

```bash
# Vyčistit cache (pokud potřeba)
firebase hosting:channel:delete preview
firebase deploy --only hosting
```

---

## 📱 PWA na Firebase

### Service Worker:
- ✅ Automaticky cachuje soubory
- ✅ Offline podpora
- ✅ Instalovatelná aplikace

### Manifest:
- ✅ Ikony (192x192, 512x512)
- ✅ Theme color
- ✅ Display: standalone

---

## 🐛 Troubleshooting

### Problém: Deploy selhává
```bash
# Řešení: Zkontrolujte přihlášení
firebase logout
firebase login
firebase deploy --only hosting
```

### Problém: Stará verze se zobrazuje
```bash
# Řešení: Vyčistěte cache
# V prohlížeči: Ctrl+Shift+R (hard refresh)
# Nebo smažte cache v DevTools
```

### Problém: 404 chyba
```bash
# Řešení: Zkontrolujte rewrites v firebase.json
# Ujistěte se, že máte SPA rewrite pravidlo
```

---

## 📊 Monitoring

### Firebase Console:
1. Otevřete https://console.firebase.google.com
2. Vyberte projekt "jvs-management"
3. Přejděte na Hosting
4. Sledujte:
   - Návštěvnost
   - Bandwidth
   - Requests
   - Errors

### Analytics:
1. Přejděte na Analytics
2. Sledujte:
   - Active users
   - Page views
   - Events
   - Conversions

---

## 💰 Pricing

### Firebase Hosting - Spark Plan (Free):
- ✅ 10 GB storage
- ✅ 360 MB/day bandwidth
- ✅ Custom domain
- ✅ SSL certificate
- ✅ CDN

### Upgrade na Blaze Plan (Pay as you go):
- 💰 $0.026/GB storage
- 💰 $0.15/GB bandwidth
- ✅ Unlimited projects

---

## ✅ Checklist před deploymentem

- [x] Firebase CLI nainstalováno
- [x] Přihlášení k Firebase účtu
- [x] firebase.json vytvořen
- [x] .firebaserc vytvořen
- [x] .firebaseignore vytvořen
- [x] Aplikace otestována lokálně
- [x] Service Worker funguje
- [x] PWA manifest správný
- [x] Analytics nakonfigurováno

---

## 🚀 Quick Start

```bash
# Kompletní deployment v 3 krocích:

# 1. Přihlášení
firebase login

# 2. Deploy
cd FOREST
firebase deploy --only hosting

# 3. Otevření
firebase open hosting:site
```

---

## 📞 Podpora

### Firebase:
- **Dokumentace**: https://firebase.google.com/docs/hosting
- **Console**: https://console.firebase.google.com
- **Status**: https://status.firebase.google.com

### Projekt:
- **GitHub**: https://github.com/Dominik-88/FOREST
- **Issues**: https://github.com/Dominik-88/FOREST/issues

---

## 🎉 Po deploymentu

### Ověřte:
1. ✅ Aplikace běží na https://jvs-management.web.app
2. ✅ Všechny funkce fungují
3. ✅ Offline režim funguje
4. ✅ PWA je instalovatelná
5. ✅ Analytics sbírá data

### Sdílejte:
- 🔗 URL: https://jvs-management.web.app
- 📱 QR kód (vygenerujte v aplikaci)
- 📧 Email kolegům

---

**Deployment guide vytvořen: 25. prosince 2025**
**Verze: 4.0.0**
**Status: ✅ Ready to Deploy**

---

<div align="center">

**🔥 Firebase Hosting + JVS FOREST = 🚀**

</div>