/**
 * Firebase Configuration
 * Centralized Firebase setup for JVS Management System
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjznwuPhwYVhM8eg8HV0TZmquzq8BZTCw",
  authDomain: "jvs-management.firebaseapp.com",
  projectId: "jvs-management",
  storageBucket: "jvs-management.firebasestorage.app",
  messagingSenderId: "838496450152",
  appId: "1:838496450152:web:0bb64f9d64e1ea0ee5addd",
  measurementId: "G-ZR4GGRHVBQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
