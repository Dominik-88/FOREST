# 🔥 Firebase Integration Guide

## Overview

JVS Provozní Mapa v7.0 integrates Firebase for:
- **Authentication** - Anonymous user authentication
- **Firestore Database** - Cloud storage for maintenance status
- **Real-time Sync** - Multi-device synchronization
- **Analytics** - Usage tracking and insights

---

## 🚀 Features

### 1. **Cloud Storage**
- Maintenance status saved to Firestore
- Persistent across devices and sessions
- Automatic backup and recovery

### 2. **Real-time Synchronization**
- Changes sync instantly across all devices
- Multiple users can work simultaneously
- No conflicts or data loss

### 3. **Analytics Tracking**
- App usage statistics
- User behavior insights
- Feature usage tracking

### 4. **Offline Support**
- Works without internet connection
- Syncs when connection restored
- Graceful fallback mode

---

## 📊 Firestore Structure

### Collection: `areas`

Each document represents one area:

```javascript
{
  id: 1,                              // Area ID (number)
  name: "VDJ Amerika II",             // Area name (string)
  district: "PI",                     // District code (string)
  lat: 49.305131,                     // Latitude (number)
  lng: 14.166126,                     // Longitude (number)
  area: 3303,                         // Area in m² (number)
  fence: 293,                         // Fence length in bm (number)
  cat: "I.",                          // Category (string)
  is_maintained: false,               // Maintenance status (boolean)
  created_at: "2025-12-25T20:00:00Z", // Creation timestamp (ISO string)
  updated_at: "2025-12-25T21:30:00Z", // Last update timestamp (ISO string)
  updated_by: "user_uid_123"          // User who updated (string)
}
```

### Document ID Format

```
area_{id}
```

Examples:
- `area_1` - VDJ Amerika II
- `area_2` - VDJ Drahonice
- `area_41` - Provozní Vodojem Tábor

---

## 🔧 Firebase Configuration

### Current Configuration

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDjznwuPhwYVhM8eg8HV0TZmquzq8BZTCw",
  authDomain: "jvs-management.firebaseapp.com",
  projectId: "jvs-management",
  storageBucket: "jvs-management.firebasestorage.app",
  messagingSenderId: "838496450152",
  appId: "1:838496450152:web:0bb64f9d64e1ea0ee5addd",
  measurementId: "G-ZR4GGRHVBQ"
};
```

### Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /areas/{areaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📖 API Reference

### Authentication

#### `initAuth()`
Initialize Firebase authentication with anonymous sign-in.

```javascript
import { initAuth } from './firebase-config.js';

await initAuth();
// Returns: User object
```

---

### Firestore Operations

#### `saveAreaStatus(areaId, isMaintained)`
Save maintenance status for a specific area.

```javascript
import { saveAreaStatus } from './firebase-config.js';

await saveAreaStatus(1, true);
// Saves: area_1 with is_maintained = true
```

**Parameters:**
- `areaId` (number) - Area ID (1-41)
- `isMaintained` (boolean) - Maintenance status

**Returns:** `Promise<boolean>` - Success status

---

#### `loadAreaStatus(areaId)`
Load maintenance status for a specific area.

```javascript
import { loadAreaStatus } from './firebase-config.js';

const status = await loadAreaStatus(1);
// Returns: true/false or null if not found
```

**Parameters:**
- `areaId` (number) - Area ID (1-41)

**Returns:** `Promise<boolean|null>` - Maintenance status or null

---

#### `loadAllAreasStatus()`
Load maintenance status for all areas.

```javascript
import { loadAllAreasStatus } from './firebase-config.js';

const statuses = await loadAllAreasStatus();
// Returns: { 1: true, 2: false, 3: true, ... }
```

**Returns:** `Promise<Object>` - Object with area IDs as keys

---

#### `subscribeToAreaUpdates(areaId, callback)`
Listen to real-time updates for a specific area.

```javascript
import { subscribeToAreaUpdates } from './firebase-config.js';

const unsubscribe = subscribeToAreaUpdates(1, (isMaintained) => {
  console.log('Area 1 updated:', isMaintained);
});

// Later: unsubscribe();
```

**Parameters:**
- `areaId` (number) - Area ID (1-41)
- `callback` (Function) - Callback function receiving boolean

**Returns:** `Function` - Unsubscribe function

---

#### `subscribeToAllAreasUpdates(callback)`
Listen to real-time updates for all areas.

```javascript
import { subscribeToAllAreasUpdates } from './firebase-config.js';

const unsubscribe = subscribeToAllAreasUpdates((statuses) => {
  console.log('All areas updated:', statuses);
});

// Later: unsubscribe();
```

**Parameters:**
- `callback` (Function) - Callback function receiving object

**Returns:** `Function` - Unsubscribe function

---

#### `saveAreaMetadata(area)`
Save complete area metadata to Firestore.

```javascript
import { saveAreaMetadata } from './firebase-config.js';

await saveAreaMetadata({
  id: 1,
  name: "VDJ Amerika II",
  district: "PI",
  lat: 49.305131,
  lng: 14.166126,
  area: 3303,
  fence: 293,
  cat: "I.",
  is_maintained: false
});
```

**Parameters:**
- `area` (Object) - Complete area object

**Returns:** `Promise<boolean>` - Success status

---

#### `initializeAllAreas(areas)`
Initialize all areas in Firestore (one-time setup).

```javascript
import { initializeAllAreas } from './firebase-config.js';

await initializeAllAreas(areas);
// Initializes all 41 areas in Firestore
```

**Parameters:**
- `areas` (Array) - Array of area objects

**Returns:** `Promise<boolean>` - Success status

---

### Analytics

#### `logEvent(eventName, eventParams)`
Log custom event to Firebase Analytics.

```javascript
import { logEvent } from './firebase-config.js';

logEvent('toggle_maintenance', {
  area_id: 1,
  area_name: 'VDJ Amerika II',
  is_maintained: true
});
```

**Parameters:**
- `eventName` (string) - Event name
- `eventParams` (Object) - Event parameters

---

## 🔄 Real-time Sync Flow

```
User A clicks "Hotovo" on Area 1
         ↓
Local state updated
         ↓
Save to Firestore (saveAreaStatus)
         ↓
Firestore triggers real-time listener
         ↓
User B receives update (subscribeToAllAreasUpdates)
         ↓
User B's map updates automatically
```

---

## 📊 Analytics Events

### Tracked Events

1. **app_start**
   - When: App initializes
   - Params: `areas_count`

2. **toggle_maintenance**
   - When: User toggles maintenance status
   - Params: `area_id`, `area_name`, `is_maintained`

3. **open_google_maps**
   - When: User opens Google Maps
   - Params: `area_name`, `lat`, `lng`

4. **use_geolocation**
   - When: User uses geolocation
   - Params: none

5. **toggle_panel**
   - When: User opens/closes panel
   - Params: `is_open`

---

## 🧪 Testing

### Manual Testing

1. **Open app in two browsers:**
   ```
   Browser A: https://dominik-88.github.io/FOREST/
   Browser B: https://dominik-88.github.io/FOREST/
   ```

2. **Toggle maintenance in Browser A:**
   - Click on any marker
   - Click "K údržbě" / "Hotovo"

3. **Verify sync in Browser B:**
   - Marker color should change automatically
   - No page refresh needed

### Console Testing

```javascript
// Check Firebase connection
console.log('Firebase initialized:', app);

// Check authentication
console.log('Current user:', auth.currentUser);

// Check Firestore
const testDoc = await getDoc(doc(db, 'areas', 'area_1'));
console.log('Area 1 data:', testDoc.data());
```

---

## 🐛 Troubleshooting

### Firebase not connecting

1. **Check console for errors:**
   ```
   F12 → Console → Look for Firebase errors
   ```

2. **Verify Firebase config:**
   - Check `scripts/firebase-config.js`
   - Ensure all credentials are correct

3. **Check network:**
   - Ensure internet connection
   - Check firewall settings

### Real-time sync not working

1. **Check Firestore rules:**
   - Ensure read/write permissions
   - Check authentication status

2. **Check listener:**
   ```javascript
   console.log('Listener active:', realtimeUnsubscribe !== null);
   ```

3. **Check browser console:**
   - Look for WebSocket errors
   - Check for CORS issues

### Data not persisting

1. **Check Firestore console:**
   ```
   https://console.firebase.google.com/project/jvs-management/firestore
   ```

2. **Verify document structure:**
   - Check document IDs (area_1, area_2, etc.)
   - Verify field names

3. **Check authentication:**
   ```javascript
   console.log('User authenticated:', auth.currentUser !== null);
   ```

---

## 🔒 Security Best Practices

### 1. **API Key Protection**
- API key is public (client-side)
- Restrict in Firebase Console:
  - Go to Google Cloud Console
  - API & Services → Credentials
  - Restrict API key to specific domains

### 2. **Firestore Rules**
- Implement proper security rules
- Require authentication for writes
- Validate data structure

### 3. **Anonymous Auth**
- Users are anonymous but authenticated
- Each user gets unique UID
- Track changes by user

---

## 📈 Performance

### Optimization Tips

1. **Batch Operations**
   ```javascript
   // Instead of multiple saves:
   await saveAreaStatus(1, true);
   await saveAreaStatus(2, true);
   
   // Use batch:
   const batch = writeBatch(db);
   batch.set(doc(db, 'areas', 'area_1'), { is_maintained: true }, { merge: true });
   batch.set(doc(db, 'areas', 'area_2'), { is_maintained: true }, { merge: true });
   await batch.commit();
   ```

2. **Offline Persistence**
   ```javascript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   
   enableIndexedDbPersistence(db)
     .catch((err) => {
       console.error('Persistence error:', err);
     });
   ```

3. **Limit Listeners**
   - Use single listener for all areas
   - Unsubscribe when not needed
   - Clean up on page unload

---

## 🎯 Future Enhancements

### Planned Features

1. **User Authentication**
   - Email/password login
   - Role-based access control
   - User profiles

2. **History Tracking**
   - Maintenance history
   - Change logs
   - Audit trail

3. **Notifications**
   - Push notifications
   - Email alerts
   - SMS reminders

4. **Advanced Analytics**
   - Custom dashboards
   - Usage reports
   - Performance metrics

---

## 📞 Support

**Firebase Console:**
https://console.firebase.google.com/project/jvs-management

**Documentation:**
https://firebase.google.com/docs

**Author:**
Dominik Schmied - d.schmied@lantaron.cz

---

**🔥 Firebase Integration Complete!**

**Version:** 7.0.0  
**Last Updated:** 2025-12-25  
**Status:** ✅ Production Ready