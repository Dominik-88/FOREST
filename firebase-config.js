/**
 * Firebase Configuration
 * Centralized Firebase setup for JVS Management System
 * Using Firebase Compat SDK for browser compatibility
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjznwuPhwYVhM8eg8HV0TZmquzq8BZTCw",
  authDomain: "jvs-management.firebaseapp.com",
  projectId: "jvs-management",
  storageBucket: "jvs-management.firebasestorage.app",
  messagingSenderId: "838496450152",
  appId: "1:838496450152:web:0bb64f9d64e1ea0ee5addd",
  measurementId: "G-ZR4GGRHVBQ"
};

// Initialize Firebase (compat version)
console.log('[Firebase] Initializing Firebase...');
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

console.log('[Firebase] Firebase initialized successfully');
console.log('[Firebase] Firestore instance created');

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
        console.log('[Firebase] Offline persistence enabled');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('[Firebase] Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('[Firebase] Persistence not available in this browser');
        }
    });

// Firestore Collections
window.COLLECTIONS = {
    AREALS: 'areals',
    USERS: 'users',
    ROUTES: 'routes',
    MAINTENANCE: 'maintenance_logs',
    AI_HISTORY: 'ai_query_history'
};

// Export for global access
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

console.log('[Firebase] Global instances exported');

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create Firebase Project:
 *    - Go to https://console.firebase.google.com
 *    - Create new project "JVS Management"
 *    - Enable Google Analytics (optional)
 * 
 * 2. Enable Firestore:
 *    - Navigate to Firestore Database
 *    - Create database in production mode
 *    - Choose europe-west3 (Frankfurt) location
 * 
 * 3. Get Configuration:
 *    - Project Settings > General
 *    - Scroll to "Your apps"
 *    - Click Web app icon
 *    - Copy configuration and replace above
 * 
 * 4. Setup Firestore Rules:
 *    - Copy rules from firestore.rules file
 *    - Deploy via Firebase Console or CLI
 * 
 * 5. Run Migration:
 *    - cd scripts
 *    - npm install firebase
 *    - node migrate-to-firestore.js
 * 
 * 6. Verify Data:
 *    - Open Firebase Console
 *    - Navigate to Firestore Database
 *    - Check that 'areals' collection has 41 documents
 */
