/**
 * Firebase Configuration
 * Centralized Firebase setup for JVS Management System
 */

// Firebase Configuration Object
export const firebaseConfig = {
    apiKey: "AIzaSyDemoKey-ReplaceWithYourActualKey",
    authDomain: "jvs-management.firebaseapp.com",
    projectId: "jvs-management",
    storageBucket: "jvs-management.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Firestore Collections
export const COLLECTIONS = {
    AREALS: 'areals',
    USERS: 'users',
    ROUTES: 'routes',
    MAINTENANCE: 'maintenance_logs',
    AI_HISTORY: 'ai_query_history'
};

// Firestore Indexes (for complex queries)
export const REQUIRED_INDEXES = [
    {
        collection: 'areals',
        fields: ['district', 'category', 'last_maintenance']
    },
    {
        collection: 'areals',
        fields: ['is_completed', 'area_sqm']
    }
];

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
 *    - node scripts/migrate-to-firestore.js
 */
