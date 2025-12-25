/**
 * Firebase Configuration
 * JVS FOREST v4.0
 * 
 * @version 4.0.0
 * @date 2025-12-25
 */

// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

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

// Initialize Firebase
let app = null;
let analytics = null;

try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// Export for use in other modules
export { app, analytics };
