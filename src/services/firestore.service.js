/**
 * JVS Management System - Firestore Service
 * Real-time database with offline persistence
 * Version: 2.0.0
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    orderBy,
    limit,
    enableIndexedDbPersistence,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { stateManager } from '../core/state.js';

/**
 * Firebase Configuration
 * TODO: Replace with your Firebase project config
 */
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

class FirestoreService {
    constructor() {
        this.app = null;
        this.db = null;
        this.isInitialized = false;
        this.subscriptions = new Map();
    }

    /**
     * Initialize Firebase and Firestore
     */
    async initialize() {
        try {
            console.log('[Firestore] Initializing...');
            
            // Initialize Firebase
            this.app = initializeApp(FIREBASE_CONFIG);
            this.db = getFirestore(this.app);
            
            // Enable offline persistence
            await this.enableOfflinePersistence();
            
            this.isInitialized = true;
            console.log('[Firestore] Initialized successfully');
            
            return true;
        } catch (error) {
            console.error('[Firestore] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Enable IndexedDB persistence for offline support
     */
    async enableOfflinePersistence() {
        try {
            await enableIndexedDbPersistence(this.db);
            console.log('[Firestore] Offline persistence enabled');
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('[Firestore] Multiple tabs open, persistence only in first tab');
            } else if (error.code === 'unimplemented') {
                console.warn('[Firestore] Browser doesn\'t support persistence');
            } else {
                console.error('[Firestore] Persistence error:', error);
            }
        }
    }

    /**
     * Subscribe to areals collection with real-time updates
     */
    subscribeToAreals(callback, options = {}) {
        const {
            sortBy = 'name',
            sortOrder = 'asc',
            limitCount = 100,
            filters = {}
        } = options;

        try {
            // Build query
            let q = collection(this.db, 'areals');
            
            // Apply filters
            if (filters.district) {
                q = query(q, where('district', '==', filters.district));
            }
            if (filters.category !== undefined) {
                q = query(q, where('category', '==', filters.category));
            }
            if (filters.isCompleted !== undefined) {
                q = query(q, where('is_completed', '==', filters.isCompleted));
            }
            
            // Apply sorting
            q = query(q, orderBy(sortBy, sortOrder));
            
            // Apply limit
            if (limitCount) {
                q = query(q, limit(limitCount));
            }

            // Subscribe to real-time updates
            const unsubscribe = onSnapshot(q, 
                (snapshot) => {
                    const areals = [];
                    snapshot.forEach((doc) => {
                        areals.push({
                            id: doc.id,
                            ...doc.data(),
                            // Convert Firestore Timestamps to JS Dates
                            created_at: doc.data().created_at?.toDate(),
                            last_maintenance: doc.data().last_maintenance?.toDate(),
                            completion_date: doc.data().completion_date?.toDate()
                        });
                    });
                    
                    console.log(`[Firestore] Received ${areals.length} areals`);
                    callback(areals);
                },
                (error) => {
                    console.error('[Firestore] Snapshot error:', error);
                    // Fallback to cached data if available
                    if (error.code === 'unavailable') {
                        console.log('[Firestore] Using cached data (offline)');
                    }
                }
            );

            // Store subscription for cleanup
            const subscriptionId = `areals_${Date.now()}`;
            this.subscriptions.set(subscriptionId, unsubscribe);
            
            return () => {
                unsubscribe();
                this.subscriptions.delete(subscriptionId);
            };
            
        } catch (error) {
            console.error('[Firestore] Subscribe error:', error);
            throw error;
        }
    }

    /**
     * Add new areal
     */
    async addAreal(arealData) {
        try {
            const docRef = await addDoc(collection(this.db, 'areals'), {
                ...arealData,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });
            
            console.log('[Firestore] Areal added:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('[Firestore] Add areal error:', error);
            throw error;
        }
    }

    /**
     * Update existing areal
     */
    async updateAreal(arealId, updates) {
        try {
            const arealRef = doc(this.db, 'areals', arealId);
            await updateDoc(arealRef, {
                ...updates,
                updated_at: serverTimestamp()
            });
            
            console.log('[Firestore] Areal updated:', arealId);
            return true;
        } catch (error) {
            console.error('[Firestore] Update areal error:', error);
            throw error;
        }
    }

    /**
     * Delete areal
     */
    async deleteAreal(arealId) {
        try {
            await deleteDoc(doc(this.db, 'areals', arealId));
            console.log('[Firestore] Areal deleted:', arealId);
            return true;
        } catch (error) {
            console.error('[Firestore] Delete areal error:', error);
            throw error;
        }
    }

    /**
     * Batch update multiple areals
     */
    async batchUpdateAreals(updates) {
        try {
            const batch = writeBatch(this.db);
            
            updates.forEach(({ id, data }) => {
                const arealRef = doc(this.db, 'areals', id);
                batch.update(arealRef, {
                    ...data,
                    updated_at: serverTimestamp()
                });
            });
            
            await batch.commit();
            console.log(`[Firestore] Batch updated ${updates.length} areals`);
            return true;
        } catch (error) {
            console.error('[Firestore] Batch update error:', error);
            throw error;
        }
    }

    /**
     * Calculate statistics from areals
     */
    calculateStats(areals) {
        return {
            total: areals.length,
            completed: areals.filter(a => a.is_completed).length,
            highRisk: areals.filter(a => a.category === 'I.').length,
            mediumRisk: areals.filter(a => a.category === 'II.').length,
            lowRisk: areals.filter(a => !a.category || a.category === '').length,
            totalArea: areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0),
            totalFence: areals.reduce((sum, a) => sum + (a.fence_length || 0), 0),
            averageArea: areals.length > 0 
                ? Math.round(areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0) / areals.length)
                : 0,
            completionRate: areals.length > 0
                ? Math.round((areals.filter(a => a.is_completed).length / areals.length) * 100)
                : 0
        };
    }

    /**
     * Cleanup all subscriptions
     */
    cleanup() {
        console.log(`[Firestore] Cleaning up ${this.subscriptions.size} subscriptions`);
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions.clear();
    }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
