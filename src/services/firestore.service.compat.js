/**
 * Firestore Service - Compat Version
 * Uses global Firebase instances from firebase-config.js
 * Version: 3.1.0
 */

class FirestoreServiceCompat {
    constructor() {
        this.db = null;
        this.auth = null;
        this.isInitialized = false;
        this.listeners = new Map();
    }

    /**
     * Initialize service with global Firebase instances
     */
    async initialize() {
        try {
            console.log('[Firestore Service] Initializing...');
            
            // Wait for Firebase to be loaded
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase not loaded. Make sure firebase-config.js is loaded first.');
            }
            
            // Get global instances
            this.db = window.firebaseDb;
            this.auth = window.firebaseAuth;
            
            if (!this.db) {
                throw new Error('Firestore instance not found');
            }
            
            console.log('[Firestore Service] Using global Firebase instances');
            
            // Sign in anonymously
            await this.auth.signInAnonymously();
            console.log('[Firestore Service] Authenticated anonymously');
            
            this.isInitialized = true;
            console.log('[Firestore Service] Initialized successfully');
            
            return { success: true };
        } catch (error) {
            console.error('[Firestore Service] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Subscribe to areals collection with real-time updates
     */
    subscribeToAreals(callback, options = {}) {
        try {
            console.log('[Firestore Service] Subscribing to areals...');
            
            let query = this.db.collection(window.COLLECTIONS.AREALS);
            
            // Apply sorting
            if (options.sortBy) {
                query = query.orderBy(options.sortBy, options.sortDirection || 'asc');
            }
            
            // Apply limit
            if (options.limitCount) {
                query = query.limit(options.limitCount);
            }
            
            // Subscribe to real-time updates
            const unsubscribe = query.onSnapshot(
                (snapshot) => {
                    console.log(`[Firestore Service] Received ${snapshot.size} areals`);
                    
                    const areals = [];
                    snapshot.forEach((doc) => {
                        areals.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    callback(areals);
                },
                (error) => {
                    console.error('[Firestore Service] Subscription error:', error);
                }
            );
            
            // Store listener for cleanup
            this.listeners.set('areals', unsubscribe);
            
            return unsubscribe;
        } catch (error) {
            console.error('[Firestore Service] Subscribe failed:', error);
            throw error;
        }
    }

    /**
     * Get single areal by ID
     */
    async getAreal(arealId) {
        try {
            const doc = await this.db.collection(window.COLLECTIONS.AREALS).doc(arealId).get();
            
            if (!doc.exists) {
                return null;
            }
            
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error('[Firestore Service] Get areal failed:', error);
            throw error;
        }
    }

    /**
     * Update areal
     */
    async updateAreal(arealId, data) {
        try {
            await this.db.collection(window.COLLECTIONS.AREALS).doc(arealId).update({
                ...data,
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`[Firestore Service] Updated areal: ${arealId}`);
            return { success: true };
        } catch (error) {
            console.error('[Firestore Service] Update failed:', error);
            throw error;
        }
    }

    /**
     * Add new areal
     */
    async addAreal(data) {
        try {
            const docRef = await this.db.collection(window.COLLECTIONS.AREALS).add({
                ...data,
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`[Firestore Service] Added areal: ${docRef.id}`);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('[Firestore Service] Add failed:', error);
            throw error;
        }
    }

    /**
     * Delete areal
     */
    async deleteAreal(arealId) {
        try {
            await this.db.collection(window.COLLECTIONS.AREALS).doc(arealId).delete();
            
            console.log(`[Firestore Service] Deleted areal: ${arealId}`);
            return { success: true };
        } catch (error) {
            console.error('[Firestore Service] Delete failed:', error);
            throw error;
        }
    }

    /**
     * Save AI query to history
     */
    async saveAIQuery(query, response) {
        try {
            await this.db.collection(window.COLLECTIONS.AI_HISTORY).add({
                query,
                response,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                user_id: this.auth.currentUser?.uid
            });
            
            console.log('[Firestore Service] AI query saved');
            return { success: true };
        } catch (error) {
            console.error('[Firestore Service] Save AI query failed:', error);
            // Don't throw - AI history is not critical
            return { success: false };
        }
    }

    /**
     * Cleanup listeners
     */
    cleanup() {
        console.log('[Firestore Service] Cleaning up listeners...');
        
        this.listeners.forEach((unsubscribe, key) => {
            unsubscribe();
            console.log(`[Firestore Service] Unsubscribed from ${key}`);
        });
        
        this.listeners.clear();
    }
}

// Export singleton instance
export const firestoreService = new FirestoreServiceCompat();

// Also make it globally available
window.firestoreService = firestoreService;

console.log('[Firestore Service] Module loaded');
