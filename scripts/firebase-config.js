/**
 * Firebase Configuration for JVS Provozní Mapa
 * Handles authentication, Firestore database, and analytics
 */

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

console.log('🔥 Firebase config loading...');

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('✅ Firebase initialized');

// =============================================
// AUTHENTICATION
// =============================================

let currentUser = null;

// Anonymous sign-in
export async function initAuth() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                console.log('✅ User authenticated:', user.uid);
                resolve(user);
            } else {
                try {
                    const userCredential = await signInAnonymously(auth);
                    currentUser = userCredential.user;
                    console.log('✅ Anonymous sign-in successful:', currentUser.uid);
                    resolve(currentUser);
                } catch (error) {
                    console.error('❌ Auth error:', error);
                    reject(error);
                }
            }
        });
    });
}

// =============================================
// FIRESTORE OPERATIONS
// =============================================

/**
 * Save area maintenance status to Firestore
 * @param {number} areaId - Area ID
 * @param {boolean} isMaintained - Maintenance status
 */
export async function saveAreaStatus(areaId, isMaintained) {
    try {
        const areaRef = doc(db, 'areas', `area_${areaId}`);
        await setDoc(areaRef, {
            id: areaId,
            is_maintained: isMaintained,
            updated_at: new Date().toISOString(),
            updated_by: currentUser?.uid || 'anonymous'
        }, { merge: true });
        
        console.log(`✅ Saved area ${areaId}: ${isMaintained ? 'maintained' : 'not maintained'}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving area status:', error);
        return false;
    }
}

/**
 * Load area maintenance status from Firestore
 * @param {number} areaId - Area ID
 * @returns {Promise<boolean|null>} Maintenance status or null if not found
 */
export async function loadAreaStatus(areaId) {
    try {
        const areaRef = doc(db, 'areas', `area_${areaId}`);
        const areaDoc = await getDoc(areaRef);
        
        if (areaDoc.exists()) {
            const data = areaDoc.data();
            console.log(`✅ Loaded area ${areaId}: ${data.is_maintained ? 'maintained' : 'not maintained'}`);
            return data.is_maintained;
        } else {
            console.log(`ℹ️ Area ${areaId} not found in Firestore`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error loading area status:', error);
        return null;
    }
}

/**
 * Load all areas maintenance status from Firestore
 * @returns {Promise<Object>} Object with area IDs as keys and maintenance status as values
 */
export async function loadAllAreasStatus() {
    try {
        const areasRef = collection(db, 'areas');
        const snapshot = await getDocs(areasRef);
        
        const statuses = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            statuses[data.id] = data.is_maintained;
        });
        
        console.log(`✅ Loaded ${Object.keys(statuses).length} areas from Firestore`);
        return statuses;
    } catch (error) {
        console.error('❌ Error loading all areas:', error);
        return {};
    }
}

/**
 * Listen to real-time updates for a specific area
 * @param {number} areaId - Area ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAreaUpdates(areaId, callback) {
    const areaRef = doc(db, 'areas', `area_${areaId}`);
    
    return onSnapshot(areaRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            console.log(`🔄 Real-time update for area ${areaId}:`, data.is_maintained);
            callback(data.is_maintained);
        }
    }, (error) => {
        console.error('❌ Error in real-time listener:', error);
    });
}

/**
 * Listen to real-time updates for all areas
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAllAreasUpdates(callback) {
    const areasRef = collection(db, 'areas');
    
    return onSnapshot(areasRef, (snapshot) => {
        const statuses = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            statuses[data.id] = data.is_maintained;
        });
        
        console.log(`🔄 Real-time update: ${snapshot.size} areas`);
        callback(statuses);
    }, (error) => {
        console.error('❌ Error in real-time listener:', error);
    });
}

/**
 * Save area metadata (name, district, etc.)
 * @param {Object} area - Area object with all properties
 */
export async function saveAreaMetadata(area) {
    try {
        const areaRef = doc(db, 'areas', `area_${area.id}`);
        await setDoc(areaRef, {
            id: area.id,
            name: area.name,
            district: area.district,
            lat: area.lat,
            lng: area.lng,
            area: area.area,
            fence: area.fence,
            cat: area.cat,
            is_maintained: area.is_maintained,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { merge: true });
        
        console.log(`✅ Saved metadata for area ${area.id}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving area metadata:', error);
        return false;
    }
}

/**
 * Initialize all areas in Firestore (one-time setup)
 * @param {Array} areas - Array of area objects
 */
export async function initializeAllAreas(areas) {
    try {
        console.log(`🔄 Initializing ${areas.length} areas in Firestore...`);
        
        const promises = areas.map(area => saveAreaMetadata(area));
        await Promise.all(promises);
        
        console.log(`✅ Initialized ${areas.length} areas in Firestore`);
        return true;
    } catch (error) {
        console.error('❌ Error initializing areas:', error);
        return false;
    }
}

// =============================================
// ANALYTICS
// =============================================

/**
 * Log custom event to Firebase Analytics
 * @param {string} eventName - Event name
 * @param {Object} eventParams - Event parameters
 */
export function logEvent(eventName, eventParams = {}) {
    try {
        analytics.logEvent(eventName, eventParams);
        console.log(`📊 Analytics event: ${eventName}`, eventParams);
    } catch (error) {
        console.error('❌ Error logging event:', error);
    }
}

// Export Firebase instances
export { app, analytics, db, auth };

console.log('✅ Firebase config loaded');