/**
 * Enhanced Firestore Service
 * Professional data management with real-time synchronization
 * Version: 3.0.0
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
    getDocs,
    getDoc,
    query, 
    serverTimestamp, 
    writeBatch,
    orderBy,
    where,
    limit,
    enableIndexedDbPersistence,
    enableMultiTabIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { 
    getAuth, 
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import { firebaseConfig, COLLECTIONS } from '../../firebase-config.js';

/**
 * Enhanced Firestore Service Class
 */
class FirestoreService {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.isOffline = false;
        this.listeners = new Map();
        this.pendingWrites = [];
    }

    /**
     * Initialize Firebase and Firestore
     */
    async initialize() {
        try {
            console.log('[Firestore] Initializing...');
            
            // Initialize Firebase App
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            
            // Enable offline persistence
            await this.enableOfflinePersistence();
            
            // Authenticate user
            await this.authenticateUser();
            
            // Setup connection monitoring
            this.setupConnectionMonitoring();
            
            this.isInitialized = true;
            console.log('[Firestore] Initialized successfully');
            
            return { success: true };
        } catch (error) {
            console.error('[Firestore] Initialization failed:', error);
            throw new Error(`Firestore initialization failed: ${error.message}`);
        }
    }

    /**
     * Enable offline persistence with multi-tab support
     */
    async enableOfflinePersistence() {
        try {
            // Try multi-tab persistence first
            await enableMultiTabIndexedDbPersistence(this.db);
            console.log('[Firestore] Multi-tab persistence enabled');
        } catch (error) {
            if (error.code === 'failed-precondition') {
                // Multiple tabs open, fallback to single-tab
                console.warn('[Firestore] Multi-tab persistence failed, using single-tab');
                try {
                    await enableIndexedDbPersistence(this.db);
                } catch (err) {
                    console.error('[Firestore] Persistence failed:', err);
                }
            } else if (error.code === 'unimplemented') {
                console.warn('[Firestore] Persistence not supported in this browser');
            }
        }
    }

    /**
     * Authenticate user (anonymous for now)
     */
    async authenticateUser() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (user) {
                    this.currentUser = user;
                    console.log('[Firestore] User authenticated:', user.uid);
                    resolve(user);
                } else {
                    try {
                        const userCredential = await signInAnonymously(this.auth);
                        this.currentUser = userCredential.user;
                        console.log('[Firestore] Anonymous user created:', this.currentUser.uid);
                        resolve(this.currentUser);
                    } catch (error) {
                        console.error('[Firestore] Authentication failed:', error);
                        reject(error);
                    }
                }
            });
        });
    }

    /**
     * Setup connection monitoring
     */
    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOffline = false;
            console.log('[Firestore] Connection restored');
            this.processPendingWrites();
        });
        
        window.addEventListener('offline', () => {
            this.isOffline = true;
            console.log('[Firestore] Connection lost - working offline');
        });
    }

    // =============================================
    // AREALS OPERATIONS
    // =============================================

    /**
     * Subscribe to areals with real-time updates
     */
    subscribeToAreals(callback, options = {}) {
        const {
            sortBy = 'name',
            sortDirection = 'asc',
            limitCount = 100,
            filters = {}
        } = options;

        try {
            let q = collection(this.db, COLLECTIONS.AREALS);
            
            // Apply filters
            if (filters.district) {
                q = query(q, where('district', '==', filters.district));
            }
            if (filters.category) {
                q = query(q, where('category', '==', filters.category));
            }
            if (filters.is_completed !== undefined) {
                q = query(q, where('is_completed', '==', filters.is_completed));
            }
            
            // Apply sorting
            const sortField = this.getSortField(sortBy);
            q = query(q, orderBy(sortField, sortDirection));
            
            // Apply limit
            if (limitCount) {
                q = query(q, limit(limitCount));
            }

            // Create listener
            const unsubscribe = onSnapshot(q, 
                (snapshot) => {
                    const areals = [];
                    snapshot.forEach((doc) => {
                        areals.push({
                            id: doc.id,
                            ...doc.data(),
                            _metadata: {
                                fromCache: snapshot.metadata.fromCache,
                                hasPendingWrites: snapshot.metadata.hasPendingWrites
                            }
                        });
                    });
                    
                    console.log(`[Firestore] Received ${areals.length} areals (fromCache: ${snapshot.metadata.fromCache})`);
                    callback(areals);
                },
                (error) => {
                    console.error('[Firestore] Subscription error:', error);
                    callback([]);
                }
            );

            // Store listener for cleanup
            const listenerId = `areals_${Date.now()}`;
            this.listeners.set(listenerId, unsubscribe);
            
            return listenerId;
        } catch (error) {
            console.error('[Firestore] Subscribe failed:', error);
            throw error;
        }
    }

    /**
     * Get single areal by ID
     */
    async getAreal(arealId) {
        try {
            const docRef = doc(this.db, COLLECTIONS.AREALS, arealId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                throw new Error(`Areal ${arealId} not found`);
            }
        } catch (error) {
            console.error('[Firestore] Get areal failed:', error);
            throw error;
        }
    }

    /**
     * Create new areal
     */
    async createAreal(arealData) {
        try {
            const data = {
                ...arealData,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
                created_by: this.currentUser?.uid || 'anonymous'
            };
            
            const docRef = await addDoc(collection(this.db, COLLECTIONS.AREALS), data);
            console.log('[Firestore] Areal created:', docRef.id);
            
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('[Firestore] Create areal failed:', error);
            
            if (this.isOffline) {
                this.pendingWrites.push({ type: 'create', collection: COLLECTIONS.AREALS, data });
            }
            
            throw error;
        }
    }

    /**
     * Update existing areal
     */
    async updateAreal(arealId, updates) {
        try {
            const docRef = doc(this.db, COLLECTIONS.AREALS, arealId);
            const data = {
                ...updates,
                updated_at: serverTimestamp(),
                updated_by: this.currentUser?.uid || 'anonymous'
            };
            
            await updateDoc(docRef, data);
            console.log('[Firestore] Areal updated:', arealId);
            
            return { success: true };
        } catch (error) {
            console.error('[Firestore] Update areal failed:', error);
            
            if (this.isOffline) {
                this.pendingWrites.push({ type: 'update', collection: COLLECTIONS.AREALS, id: arealId, data: updates });
            }
            
            throw error;
        }
    }

    /**
     * Delete areal
     */
    async deleteAreal(arealId) {
        try {
            const docRef = doc(this.db, COLLECTIONS.AREALS, arealId);
            await deleteDoc(docRef);
            console.log('[Firestore] Areal deleted:', arealId);
            
            return { success: true };
        } catch (error) {
            console.error('[Firestore] Delete areal failed:', error);
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
                const docRef = doc(this.db, COLLECTIONS.AREALS, id);
                batch.update(docRef, {
                    ...data,
                    updated_at: serverTimestamp()
                });
            });
            
            await batch.commit();
            console.log(`[Firestore] Batch updated ${updates.length} areals`);
            
            return { success: true, count: updates.length };
        } catch (error) {
            console.error('[Firestore] Batch update failed:', error);
            throw error;
        }
    }

    // =============================================
    // USER PREFERENCES
    // =============================================

    /**
     * Get user preferences
     */
    async getUserPreferences() {
        if (!this.currentUser) return {};
        
        try {
            const docRef = doc(this.db, COLLECTIONS.USERS, this.currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            return docSnap.exists() ? docSnap.data().preferences || {} : {};
        } catch (error) {
            console.error('[Firestore] Get preferences failed:', error);
            return {};
        }
    }

    /**
     * Save user preferences
     */
    async saveUserPreferences(preferences) {
        if (!this.currentUser) return;
        
        try {
            const docRef = doc(this.db, COLLECTIONS.USERS, this.currentUser.uid);
            await updateDoc(docRef, {
                preferences,
                updated_at: serverTimestamp()
            });
            
            console.log('[Firestore] Preferences saved');
        } catch (error) {
            // Document might not exist, create it
            if (error.code === 'not-found') {
                await addDoc(collection(this.db, COLLECTIONS.USERS), {
                    userId: this.currentUser.uid,
                    preferences,
                    created_at: serverTimestamp()
                });
            } else {
                console.error('[Firestore] Save preferences failed:', error);
            }
        }
    }

    // =============================================
    // AI QUERY HISTORY
    // =============================================

    /**
     * Save AI query to history
     */
    async saveAIQuery(query, response) {
        if (!this.currentUser) return;
        
        try {
            await addDoc(collection(this.db, COLLECTIONS.AI_HISTORY), {
                userId: this.currentUser.uid,
                query,
                response,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('[Firestore] Save AI query failed:', error);
        }
    }

    /**
     * Get AI query history
     */
    async getAIHistory(limitCount = 10) {
        if (!this.currentUser) return [];
        
        try {
            const q = query(
                collection(this.db, COLLECTIONS.AI_HISTORY),
                where('userId', '==', this.currentUser.uid),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );
            
            const snapshot = await getDocs(q);
            const history = [];
            
            snapshot.forEach((doc) => {
                history.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return history;
        } catch (error) {
            console.error('[Firestore] Get AI history failed:', error);
            return [];
        }
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    /**
     * Get sort field mapping
     */
    getSortField(sortBy) {
        const fieldMap = {
            'name': 'name',
            'area_asc': 'area_sqm',
            'area_desc': 'area_sqm',
            'district': 'district',
            'category': 'category',
            'maintenance': 'last_maintenance'
        };
        
        return fieldMap[sortBy] || 'name';
    }

    /**
     * Process pending writes when connection restored
     */
    async processPendingWrites() {
        if (this.pendingWrites.length === 0) return;
        
        console.log(`[Firestore] Processing ${this.pendingWrites.length} pending writes`);
        
        const writes = [...this.pendingWrites];
        this.pendingWrites = [];
        
        for (const write of writes) {
            try {
                if (write.type === 'create') {
                    await addDoc(collection(this.db, write.collection), write.data);
                } else if (write.type === 'update') {
                    const docRef = doc(this.db, write.collection, write.id);
                    await updateDoc(docRef, write.data);
                }
            } catch (error) {
                console.error('[Firestore] Pending write failed:', error);
                // Re-add to queue
                this.pendingWrites.push(write);
            }
        }
    }

    /**
     * Unsubscribe from listener
     */
    unsubscribe(listenerId) {
        const unsubscribe = this.listeners.get(listenerId);
        if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(listenerId);
            console.log('[Firestore] Unsubscribed:', listenerId);
        }
    }

    /**
     * Cleanup all listeners
     */
    cleanup() {
        this.listeners.forEach((unsubscribe) => unsubscribe());
        this.listeners.clear();
        console.log('[Firestore] All listeners cleaned up');
    }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
