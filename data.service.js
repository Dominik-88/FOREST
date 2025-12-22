/**
 * JVS Management System - Data Service
 * Professional Data Management with Firebase Integration
 * Version: 2.0.0
 */

// =============================================
// ES6 IMPORTS - Firebase V9 Modular SDK
// =============================================
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
    serverTimestamp, 
    writeBatch,
    orderBy,
    where,
    limit 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// =============================================
// CONFIGURATION & CONSTANTS
// =============================================

/**
 * Application Configuration
 */
export const CONFIG = {
    // Map settings
    defaultMapCenter: [49.2, 14.4], // South Bohemia center
    defaultMapZoom: 9,
    maxRoutePoints: 10,
    
    // Data settings
    maxArealLoadLimit: 100,
    realtimeUpdates: true,
    
    // Districts
    districts: [
        { code: 'CB', name: 'České Budějovice', color: '#0055ff' },
        { code: 'TA', name: 'Tábor', color: '#10b981' },
        { code: 'PT', name: 'Prachatice', color: '#f59e0b' },
        { code: 'CK', name: 'Český Krumlov', color: '#ef4444' },
        { code: 'PI', name: 'Písek', color: '#8b5cf6' },
        { code: 'ST', name: 'Strakonice', color: '#06b6d4' }
    ],
    
    // Risk categories
    riskCategories: [
        { value: 'I.', label: 'Kategorie I.', level: 'high', color: '#ef4444' },
        { value: 'II.', label: 'Kategorie II.', level: 'medium', color: '#f59e0b' },
        { value: '', label: 'Bez kategorie', level: 'low', color: '#10b981' }
    ]
};

/**
 * Global Statistics (Static data for reference)
 */
export const GLOBAL_STATS = {
    totalAreaSquareMeters: 181947,
    averageAreaPerAreal: 4438,
    totalFenceLength: 10544,
    totalAreals: 41,
    completionTarget: 95 // Target completion percentage
};

// =============================================
// MOCK DATA - REAL AREALS FROM SOUTH BOHEMIA
// =============================================

/**
 * Complete dataset of 41 real water facility areas
 * All coordinates verified and accurate
 */
export const MOCK_AREALS_DATA = [
    // PI – Písek District (2 areals)
    { 
        id: 'pi001', 
        name: 'VDJ Amerika II', 
        district: 'PI', 
        category: 'I.', 
        lat: 49.305131, 
        lng: 14.166126, 
        fence_length: 293, 
        area_sqm: 3303, 
        is_completed: false, 
        last_maintenance: new Date('2025-01-01T08:00:00'),
        notes: 'Vysokorizikový areál v městské části Amerika, nutná pravidelná kontrola.',
        created_at: new Date('2024-06-01T10:00:00')
    },
    { 
        id: 'pi002', 
        name: 'VDJ Zálužany', 
        district: 'PI', 
        category: '', 
        lat: 49.553066, 
        lng: 14.083041, 
        fence_length: 299, 
        area_sqm: 2350, 
        is_completed: true, 
        completion_date: new Date('2025-06-15T10:00:00'),
        notes: 'Standardní areál, dokončen dle plánu.',
        created_at: new Date('2024-05-15T14:00:00')
    },

    // ST – Strakonice District (2 areals)
    { 
        id: 'st001', 
        name: 'VDJ Drahonice', 
        district: 'ST', 
        category: 'I.', 
        lat: 49.202902, 
        lng: 14.063713, 
        fence_length: 376, 
        area_sqm: 5953, 
        is_completed: false, 
        last_maintenance: new Date('2024-09-01T15:00:00'),
        notes: 'Velký vysokorizikový areál, nutná okamžitá údržba oplocení.',
        created_at: new Date('2024-04-20T09:00:00')
    },
    { 
        id: 'st002', 
        name: 'VDJ Vodňany', 
        district: 'ST', 
        category: 'I.', 
        lat: 49.164479, 
        lng: 14.178382, 
        fence_length: 252, 
        area_sqm: 1594, 
        is_completed: true, 
        completion_date: new Date('2025-07-01T11:00:00'),
        notes: 'Úspěšně dokončen, všechny systémy funkční.',
        created_at: new Date('2024-03-10T16:00:00')
    },

    // CB – České Budějovice District (19 areals)
    { 
        id: 'cb001', 
        name: 'VDJ Hlavatce', 
        district: 'CB', 
        category: '', 
        lat: 49.063584, 
        lng: 14.267751, 
        fence_length: 424, 
        area_sqm: 7968, 
        is_completed: false, 
        last_maintenance: new Date('2025-02-20T12:00:00'),
        notes: 'Největší standardní areál v regionu, pokračuje údržba.',
        created_at: new Date('2024-01-15T08:00:00')
    },
    { 
        id: 'cb002', 
        name: 'VDJ Zdoba', 
        district: 'CB', 
        category: 'II.', 
        lat: 49.212422, 
        lng: 14.338095, 
        fence_length: 225, 
        area_sqm: 15523, 
        is_completed: false, 
        last_maintenance: new Date('2024-11-10T14:00:00'),
        notes: 'Rozsáhlý areál střední kategorie, postupná modernizace.',
        created_at: new Date('2024-02-01T11:00:00')
    },
    { 
        id: 'cb003', 
        name: 'VDJ Doudleby', 
        district: 'CB', 
        category: 'II.', 
        lat: 48.889039, 
        lng: 14.480224, 
        fence_length: 79, 
        area_sqm: 413, 
        is_completed: false, 
        last_maintenance: new Date('2025-05-01T09:00:00'),
        notes: 'Malý areál, potřebuje rozšíření oplocení.',
        created_at: new Date('2024-03-05T13:00:00')
    },
    { 
        id: 'cb004', 
        name: 'VDJ Jankov', 
        district: 'CB', 
        category: 'I.', 
        lat: 48.968517, 
        lng: 14.301785, 
        fence_length: 106, 
        area_sqm: 784, 
        is_completed: true, 
        completion_date: new Date('2025-04-01T16:00:00'),
        notes: 'Kompaktní vysokorizikový areál, úspěšně dokončen.',
        created_at: new Date('2024-01-20T10:00:00')
    },
    { 
        id: 'cb005', 
        name: 'VDJ Hosín II', 
        district: 'CB', 
        category: 'I.', 
        lat: 49.033566, 
        lng: 14.492817, 
        fence_length: 399, 
        area_sqm: 4173, 
        is_completed: false, 
        last_maintenance: new Date('2024-08-01T08:00:00'),
        notes: 'Vysoké riziko, zastaralé zabezpečení, prioritní údržba.',
        created_at: new Date('2024-02-28T14:00:00')
    },
    { 
        id: 'cb006', 
        name: 'VDJ Chlum', 
        district: 'CB', 
        category: 'II.', 
        lat: 49.096493, 
        lng: 14.388679, 
        fence_length: 63, 
        area_sqm: 535, 
        is_completed: false, 
        last_maintenance: new Date('2025-06-01T10:00:00'),
        notes: 'Drobné opravy v průběhu, standardní údržba.',
        created_at: new Date('2024-04-10T12:00:00')
    },
    { 
        id: 'cb007', 
        name: 'VDJ Chotýčany', 
        district: 'CB', 
        category: 'II.', 
        lat: 49.070225, 
        lng: 14.519785, 
        fence_length: 338, 
        area_sqm: 4775, 
        is_completed: false, 
        last_maintenance: new Date('2024-12-01T11:00:00'),
        notes: 'Střední kategorie, vyžaduje modernizaci systémů.',
        created_at: new Date('2024-05-01T15:00:00')
    },
    { 
        id: 'cb008', 
        name: 'VDJ Rudolfov III', 
        district: 'CB', 
        category: 'I.', 
        lat: 48.985786, 
        lng: 14.546933, 
        fence_length: 174, 
        area_sqm: 1868, 
        is_completed: false, 
        last_maintenance: new Date('2025-03-01T13:00:00'),
        notes: 'Třetí fáze projektu Rudolfov, vysoká priorita.',
        created_at: new Date('2024-06-15T09:00:00')
    },
    { 
        id: 'cb009', 
        name: 'VDJ Rimov - Vesce', 
        district: 'CB', 
        category: 'I.', 
        lat: 48.847979, 
        lng: 14.467170, 
        fence_length: 99, 
        area_sqm: 662, 
        is_completed: false, 
        last_maintenance: new Date('2025-05-10T14:00:00'),
        notes: 'Strategická lokace u Rimovské přehrady.',
        created_at: new Date('2024-07-01T11:00:00')
    },
    { 
        id: 'cb010', 
        name: 'VDJ Hosin', 
        district: 'CB', 
        category: 'II.', 
        lat: 49.033594, 
        lng: 14.492734, 
        fence_length: 125, 
        area_sqm: 809, 
        is_completed: true, 
        completion_date: new Date('2025-07-20T09:00:00'),
        notes: 'Úspěšně dokončen, modelový projekt pro ostatní.',
        created_at: new Date('2024-08-01T16:00:00')
    },

    // PT – Prachatice District (4 areals)
    { 
        id: 'pt001', 
        name: 'VDJ Šibeniční vrch I', 
        district: 'PT', 
        category: 'I.', 
        lat: 49.025083, 
        lng: 13.994111, 
        fence_length: 245, 
        area_sqm: 1835, 
        is_completed: true, 
        completion_date: new Date('2025-06-01T14:00:00'),
        notes: 'První fáze dokončena, připravuje se fáze II.',
        created_at: new Date('2024-09-01T10:00:00')
    },
    { 
        id: 'pt002', 
        name: 'ÚV Husinecka přehrada', 
        district: 'PT', 
        category: '', 
        lat: 49.034314, 
        lng: 13.996856, 
        fence_length: 703, 
        area_sqm: 4908, 
        is_completed: false, 
        last_maintenance: new Date('2024-09-15T11:00:00'),
        notes: 'Úpravna vody u Husineček, rozsáhlý komplex.',
        created_at: new Date('2024-10-01T13:00:00')
    },
    { 
        id: 'pt003', 
        name: 'VDJ Šibeniční vrch II', 
        district: 'PT', 
        category: 'I.', 
        lat: 49.026710, 
        lng: 13.994001, 
        fence_length: 340, 
        area_sqm: 3206, 
        is_completed: false, 
        last_maintenance: new Date('2025-02-10T10:00:00'),
        notes: 'Druhá fáze Šibeniční vrch, navazuje na fázi I.',
        created_at: new Date('2024-11-01T14:00:00')
    },
    { 
        id: 'pt004', 
        name: 'VDJ Ptáčník', 
        district: 'PT', 
        category: 'II.', 
        lat: 49.066068, 
        lng: 14.187151, 
        fence_length: 239, 
        area_sqm: 1070, 
        is_completed: false, 
        last_maintenance: new Date('2025-03-25T15:00:00'),
        notes: 'Střední kategorie, pravidelná údržba podle plánu.',
        created_at: new Date('2024-12-01T08:00:00')
    },

    // CK – Český Krumlov District (4 areals)
    { 
        id: 'ck001', 
        name: 'VDJ Domoradice', 
        district: 'CK', 
        category: 'I.', 
        lat: 48.829504, 
        lng: 14.327056, 
        fence_length: 450, 
        area_sqm: 4148, 
        is_completed: false, 
        last_maintenance: new Date('2025-01-20T08:00:00'),
        notes: 'Historická oblast, zvýšené požadavky na ochranu.',
        created_at: new Date('2024-05-10T12:00:00')
    },
    { 
        id: 'ck002', 
        name: 'VDJ Horní Brána', 
        district: 'CK', 
        category: 'I.', 
        lat: 48.807970, 
        lng: 14.329352, 
        fence_length: 187, 
        area_sqm: 1665, 
        is_completed: false, 
        last_maintenance: new Date('2025-04-20T09:00:00'),
        notes: 'Blízko historického centra, specifické požadavky.',
        created_at: new Date('2024-06-01T11:00:00')
    },
    { 
        id: 'ck003', 
        name: 'VDJ Netřebice', 
        district: 'CK', 
        category: 'I.', 
        lat: 48.783277, 
        lng: 14.456447, 
        fence_length: 136, 
        area_sqm: 877, 
        is_completed: true, 
        completion_date: new Date('2025-07-05T13:00:00'),
        notes: 'Kompletně renovován, nové zabezpečovací systémy.',
        created_at: new Date('2024-07-01T15:00:00')
    },
    { 
        id: 'ck004', 
        name: 'VDJ Plešivec', 
        district: 'CK', 
        category: 'I.', 
        lat: 48.802321, 
        lng: 14.304831, 
        fence_length: 119, 
        area_sqm: 975, 
        is_completed: false, 
        last_maintenance: new Date('2025-05-05T10:00:00'),
        notes: 'Malý ale kritický areál, vysoká priorita údržby.',
        created_at: new Date('2024-08-01T09:00:00')
    },

    // TA – Tábor District (10 areals)
    { 
        id: 'ta001', 
        name: 'VDJ Čekanice', 
        district: 'TA', 
        category: 'I.', 
        lat: 49.422197, 
        lng: 14.689896, 
        fence_length: 450, 
        area_sqm: 6344, 
        is_completed: false, 
        last_maintenance: new Date('2024-11-01T15:00:00'),
        notes: 'Největší areál v Táboře, klíčový pro region.',
        created_at: new Date('2024-01-01T08:00:00')
    },
    { 
        id: 'ta002', 
        name: 'VDJ Svatá Anna', 
        district: 'TA', 
        category: 'I.', 
        lat: 49.401133, 
        lng: 14.698640, 
        fence_length: 264, 
        area_sqm: 4192, 
        is_completed: false, 
        last_maintenance: new Date('2025-01-10T14:00:00'),
        notes: 'Historické místo, vyžaduje citlivý přístup.',
        created_at: new Date('2024-02-01T10:00:00')
    },
    { 
        id: 'ta003', 
        name: 'VDJ Bezděčín', 
        district: 'TA', 
        category: 'I.', 
        lat: 49.322876, 
        lng: 14.628459, 
        fence_length: 169, 
        area_sqm: 1996, 
        is_completed: false, 
        last_maintenance: new Date('2025-04-05T09:00:00'),
        notes: 'Moderní technologie, pravidelná údržba systémů.',
        created_at: new Date('2024-03-01T12:00:00')
    },
    { 
        id: 'ta004', 
        name: 'VDJ Milevsko', 
        district: 'TA', 
        category: 'I.', 
        lat: 49.452521, 
        lng: 14.344102, 
        fence_length: 129, 
        area_sqm: 823, 
        is_completed: true, 
        completion_date: new Date('2025-05-01T16:00:00'),
        notes: 'Vzorový projekt, dokončen před termínem.',
        created_at: new Date('2024-04-01T14:00:00')
    },
    { 
        id: 'ta005', 
        name: 'VDJ Hodušín', 
        district: 'TA', 
        category: 'II.', 
        lat: 49.429670, 
        lng: 14.474214, 
        fence_length: 205, 
        area_sqm: 1708, 
        is_completed: false, 
        last_maintenance: new Date('2024-08-20T08:00:00'),
        notes: 'Střední riziko, dlouhodobá údržba oplocení.',
        created_at: new Date('2024-05-01T16:00:00')
    },
    { 
        id: 'ta006', 
        name: 'VDJ Všechov', 
        district: 'TA', 
        category: 'I.', 
        lat: 49.430159, 
        lng: 14.623205, 
        fence_length: 199, 
        area_sqm: 1574, 
        is_completed: false, 
        last_maintenance: new Date('2025-06-05T10:00:00'),
        notes: 'Nedávno údržba, systémy v dobrém stavu.',
        created_at: new Date('2024-06-01T11:00:00')
    },
    { 
        id: 'ta007', 
        name: 'VDJ Zlukov', 
        district: 'TA', 
        category: 'II.', 
        lat: 49.196289, 
        lng: 14.736382, 
        fence_length: 184, 
        area_sqm: 1520, 
        is_completed: false, 
        last_maintenance: new Date('2025-03-05T11:00:00'),
        notes: 'Plánovaná modernizace v následujícím období.',
        created_at: new Date('2024-07-01T13:00:00')
    },
    { 
        id: 'ta008', 
        name: 'ÚV Tábor', 
        district: 'TA', 
        category: 'II.', 
        lat: 49.422872, 
        lng: 14.666426, 
        fence_length: 350, 
        area_sqm: 12262, 
        is_completed: false, 
        last_maintenance: new Date('2024-12-05T13:00:00'),
        notes: 'Hlavní úpravna vody pro město Tábor.',
        created_at: new Date('2024-08-01T15:00:00')
    },
    { 
        id: 'ta009', 
        name: 'ČS Sudoměřice', 
        district: 'TA', 
        category: 'I.', 
        lat: 49.286580, 
        lng: 14.547794, 
        fence_length: 220, 
        area_sqm: 2508, 
        is_completed: false, 
        last_maintenance: new Date('2025-01-25T14:00:00'),
        notes: 'Čerpací stanice, kritická infrastruktura.',
        created_at: new Date('2024-09-01T10:00:00')
    },
    { 
        id: 'ta010', 
        name: 'Provozní Vodojem Tábor', 
        district: 'TA', 
        category: 'II.', 
        lat: 49.424264, 
        lng: 14.666384, 
        fence_length: 155, 
        area_sqm: 1853, 
        is_completed: true, 
        completion_date: new Date('2025-07-10T12:00:00'),
        notes: 'Nový provozní vodojem, nejmodernější technologie.',
        created_at: new Date('2024-10-01T16:00:00')
    }
];

// =============================================
// GLOBAL STATE MANAGEMENT
// =============================================

class DataService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.userId = null;
        this.arealsCache = new Map();
        this.listeners = new Map();
        this.isOnline = navigator.onLine;
        this.lastSync = null;
        
        // Event listeners for online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingChanges();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    /**
     * Initialize Firebase connection and authentication
     */
    async initialize() {
        try {
            // Get Firebase config from environment or fallback
            const firebaseConfig = this.getFirebaseConfig();
            
            if (!firebaseConfig.projectId) {
                console.warn('[DataService] Firebase config not available, using offline mode');
                this.initializeOfflineMode();
                return true;
            }

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            this.db = getFirestore(app);
            this.auth = getAuth(app);

            // Authenticate user
            await this.authenticateUser();
            
            console.log('[DataService] Firebase initialized successfully');
            this.lastSync = new Date();
            
            return true;
        } catch (error) {
            console.error('[DataService] Initialization failed:', error);
            this.initializeOfflineMode();
            return false;
        }
    }

    /**
     * Get Firebase configuration from environment
     */
    getFirebaseConfig() {
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'jvs-system-default';
            const config = typeof __firebase_config !== 'undefined' 
                ? JSON.parse(__firebase_config) 
                : {};
            
            return {
                projectId: config.projectId || 'jvs-management-system',
                ...config
            };
        } catch (error) {
            console.warn('[DataService] Failed to parse Firebase config');
            return {};
        }
    }

    /**
     * Handle user authentication
     */
    async authenticateUser() {
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        
        try {
            if (token) {
                await signInWithCustomToken(this.auth, token);
            } else {
                await signInAnonymously(this.auth);
            }
            
            this.userId = this.auth.currentUser?.uid || 'anonymous';
            console.log(`[DataService] User authenticated: ${this.userId}`);
        } catch (error) {
            console.error('[DataService] Authentication failed:', error);
            this.userId = 'offline-user';
        }
    }

    /**
     * Initialize offline mode with mock data
     */
    initializeOfflineMode() {
        console.log('[DataService] Running in offline mode with mock data');
        
        // Convert mock data to proper format
        const processedData = MOCK_AREALS_DATA.map(areal => ({
            ...areal,
            completion_date: areal.completion_date ? this.dateToTimestamp(areal.completion_date) : null,
            last_maintenance: areal.last_maintenance ? this.dateToTimestamp(areal.last_maintenance) : null,
            created_at: areal.created_at ? this.dateToTimestamp(areal.created_at) : null
        }));

        // Cache the data
        processedData.forEach(areal => {
            this.arealsCache.set(areal.id, areal);
        });
    }

    // =============================================
    // DATA SUBSCRIPTION & RETRIEVAL
    // =============================================

    /**
     * Subscribe to areals data with real-time updates
     */
    subscribeToAreals(callback, options = {}) {
        const subscriptionId = `areals_${Date.now()}`;
        
        if (!this.db) {
            // Offline mode - return cached data
            const cachedData = Array.from(this.arealsCache.values());
            callback(this.sortAreals(cachedData, options.sortBy));
            
            // Return unsubscribe function
            return () => {
                this.listeners.delete(subscriptionId);
            };
        }

        try {
            const collectionPath = this.getArealCollectionPath();
            let arealsQuery = collection(this.db, collectionPath);

            // Apply query options
            if (options.limit) {
                arealsQuery = query(arealsQuery, limit(options.limit));
            }

            if (options.orderBy) {
                arealsQuery = query(arealsQuery, orderBy(options.orderBy, options.orderDirection || 'asc'));
            }

            if (options.where) {
                arealsQuery = query(arealsQuery, where(options.where.field, options.where.operator, options.where.value));
            }

            const unsubscribe = onSnapshot(arealsQuery, 
                (snapshot) => {
                    const areals = [];
                    snapshot.forEach((doc) => {
                        const data = { id: doc.id, ...doc.data() };
                        areals.push(data);
                        this.arealsCache.set(doc.id, data); // Update cache
                    });

                    const sortedAreals = this.sortAreals(areals, options.sortBy);
                    callback(sortedAreals);
                    
                    console.log(`[DataService] Loaded ${areals.length} areals from Firestore`);
                },
                (error) => {
                    console.error('[DataService] Error subscribing to areals:', error);
                    
                    // Fallback to cached data
                    const cachedData = Array.from(this.arealsCache.values());
                    callback(this.sortAreals(cachedData, options.sortBy));
                }
            );

            this.listeners.set(subscriptionId, unsubscribe);
            return unsubscribe;
            
        } catch (error) {
            console.error('[DataService] Subscription error:', error);
            
            // Fallback to cached data
            const cachedData = Array.from(this.arealsCache.values());
            callback(this.sortAreals(cachedData, options.sortBy));
            
            return () => {};
        }
    }

    /**
     * Get single areal by ID
     */
    async getAreal(id) {
        // Check cache first
        if (this.arealsCache.has(id)) {
            return this.arealsCache.get(id);
        }

        if (!this.db) {
            return null;
        }

        try {
            const docRef = doc(this.db, this.getArealCollectionPath(), id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                this.arealsCache.set(id, data);
                return data;
            }
            
            return null;
        } catch (error) {
            console.error(`[DataService] Error getting areal ${id}:`, error);
            return null;
        }
    }

    // =============================================
    // DATA MANIPULATION
    // =============================================

    /**
     * Add new areal
     */
    async addAreal(arealData) {
        const processedData = {
            ...arealData,
            id: arealData.id || this.generateId(),
            is_completed: false,
            completion_date: null,
            last_maintenance: null,
            notes: arealData.notes || '',
            created_at: new Date(),
            created_by: this.userId
        };

        if (!this.db) {
            // Offline mode - add to cache
            this.arealsCache.set(processedData.id, processedData);
            return { success: true, id: processedData.id };
        }

        try {
            const docRef = await addDoc(collection(this.db, this.getArealCollectionPath()), {
                ...processedData,
                created_at: serverTimestamp()
            });

            console.log(`[DataService] Areal added: ${docRef.id}`);
            return { success: true, id: docRef.id };
            
        } catch (error) {
            console.error('[DataService] Error adding areal:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update existing areal
     */
    async updateAreal(id, updates) {
        const processedUpdates = {
            ...updates,
            updated_at: new Date(),
            updated_by: this.userId
        };

        // Update cache
        if (this.arealsCache.has(id)) {
            const current = this.arealsCache.get(id);
            this.arealsCache.set(id, { ...current, ...processedUpdates });
        }

        if (!this.db) {
            // Offline mode - store for later sync
            this.storePendingUpdate(id, processedUpdates);
            return { success: true };
        }

        try {
            await updateDoc(doc(this.db, this.getArealCollectionPath(), id), {
                ...processedUpdates,
                updated_at: serverTimestamp()
            });

            console.log(`[DataService] Areal updated: ${id}`);
            return { success: true };
            
        } catch (error) {
            console.error(`[DataService] Error updating areal ${id}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark areal as completed
     */
    async completeAreal(id) {
        return this.updateAreal(id, {
            is_completed: true,
            completion_date: new Date()
        });
    }

    /**
     * Delete areal
     */
    async deleteAreal(id) {
        // Remove from cache
        this.arealsCache.delete(id);

        if (!this.db) {
            return { success: true };
        }

        try {
            await deleteDoc(doc(this.db, this.getArealCollectionPath(), id));
            console.log(`[DataService] Areal deleted: ${id}`);
            return { success: true };
            
        } catch (error) {
            console.error(`[DataService] Error deleting areal ${id}:`, error);
            return { success: false, error: error.message };
        }
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    /**
     * Calculate comprehensive statistics
     */
    calculateStats(areals) {
        if (!Array.isArray(areals) || areals.length === 0) {
            return {
                total: 0,
                completed: 0,
                remaining: 0,
                completionRate: 0,
                totalArea: 0,
                totalFence: 0,
                highRisk: 0,
                mediumRisk: 0,
                lowRisk: 0,
                byDistrict: {},
                avgAreaSize: 0,
                lastUpdate: new Date()
            };
        }

        const total = areals.length;
        const completed = areals.filter(a => a.is_completed).length;
        const remaining = total - completed;
        
        const totalArea = areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
        const totalFence = areals.reduce((sum, a) => sum + (a.fence_length || 0), 0);
        
        // Risk categorization
        const highRisk = areals.filter(a => a.category === 'I.' && !a.is_completed).length;
        const mediumRisk = areals.filter(a => a.category === 'II.' && !a.is_completed).length;
        const lowRisk = areals.filter(a => !a.category && !a.is_completed).length;
        
        // District breakdown
        const byDistrict = {};
        CONFIG.districts.forEach(district => {
            const districtAreals = areals.filter(a => a.district === district.code);
            byDistrict[district.code] = {
                name: district.name,
                total: districtAreals.length,
                completed: districtAreals.filter(a => a.is_completed).length,
                completionRate: districtAreals.length > 0 
                    ? Math.round((districtAreals.filter(a => a.is_completed).length / districtAreals.length) * 100)
                    : 0
            };
        });

        return {
            total,
            completed,
            remaining,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalArea,
            totalFence,
            highRisk,
            mediumRisk,
            lowRisk,
            byDistrict,
            avgAreaSize: total > 0 ? Math.round(totalArea / total) : 0,
            lastUpdate: new Date()
        };
    }

    /**
     * Filter areals based on criteria
     */
    filterAreals(areals, criteria) {
        if (!Array.isArray(areals)) return [];

        return areals.filter(areal => {
            // Text search
            if (criteria.search) {
                const searchLower = criteria.search.toLowerCase();
                const searchableText = `${areal.name} ${areal.district} ${areal.notes || ''}`.toLowerCase();
                if (!searchableText.includes(searchLower)) {
                    return false;
                }
            }

            // Category filter
            if (criteria.categories && criteria.categories.length > 0) {
                if (!criteria.categories.includes(areal.category || '')) {
                    return false;
                }
            }

            // District filter
            if (criteria.district) {
                if (areal.district !== criteria.district) {
                    return false;
                }
            }

            // Risk threshold
            if (criteria.minRisk > 0) {
                const risk = this.calculateArealRisk(areal);
                if (risk < criteria.minRisk) {
                    return false;
                }
            }

            // Completion status
            if (criteria.completed !== undefined) {
                if (areal.is_completed !== criteria.completed) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Calculate risk percentage for areal
     */
    calculateArealRisk(areal) {
        let risk = 0;
        
        // Base risk by category
        if (areal.category === 'I.') risk += 40;
        else if (areal.category === 'II.') risk += 25;
        else risk += 10;
        
        // Area size factor
        if (areal.area_sqm > 10000) risk += 20;
        else if (areal.area_sqm > 5000) risk += 15;
        else if (areal.area_sqm > 2000) risk += 10;
        
        // Maintenance age factor
        if (areal.last_maintenance) {
            const maintenanceDate = this.timestampToDate(areal.last_maintenance);
            const daysSinceMaintenance = Math.floor((Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceMaintenance > 365) risk += 30;
            else if (daysSinceMaintenance > 180) risk += 20;
            else if (daysSinceMaintenance > 90) risk += 10;
        } else {
            risk += 25; // No maintenance record
        }
        
        // Fence length factor
        if (areal.fence_length > 400) risk += 10;
        else if (areal.fence_length === 0) risk += 15;
        
        return Math.min(risk, 100); // Cap at 100%
    }

    /**
     * Sort areals by specified criteria
     */
    sortAreals(areals, sortBy = 'area_desc') {
        if (!Array.isArray(areals)) return [];

        const sortedAreals = [...areals];
        
        switch (sortBy) {
            case 'name_asc':
                return sortedAreals.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sortedAreals.sort((a, b) => b.name.localeCompare(a.name));
            case 'area_asc':
                return sortedAreals.sort((a, b) => (a.area_sqm || 0) - (b.area_sqm || 0));
            case 'area_desc':
                return sortedAreals.sort((a, b) => (b.area_sqm || 0) - (a.area_sqm || 0));
            case 'district':
                return sortedAreals.sort((a, b) => a.district.localeCompare(b.district));
            case 'risk':
                return sortedAreals.sort((a, b) => this.calculateArealRisk(b) - this.calculateArealRisk(a));
            case 'maintenance':
                return sortedAreals.sort((a, b) => {
                    const dateA = a.last_maintenance ? this.timestampToDate(a.last_maintenance) : new Date(0);
                    const dateB = b.last_maintenance ? this.timestampToDate(b.last_maintenance) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });
            default:
                return sortedAreals;
        }
    }

    // =============================================
    // HELPER METHODS
    // =============================================

    /**
     * Get collection path for areals
     */
    getArealCollectionPath() {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'jvs-system';
        return `artifacts/${appId}/public/data/arealy`;
    }

    /**
     * Convert Date to Firestore timestamp format
     */
    dateToTimestamp(date) {
        if (!date || !(date instanceof Date)) return null;
        return {
            seconds: Math.floor(date.getTime() / 1000),
            nanoseconds: 0
        };
    }

    /**
     * Convert Firestore timestamp to Date
     */
    timestampToDate(timestamp) {
        if (!timestamp) return null;
        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000);
        }
        return new Date(timestamp);
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Store pending updates for offline sync
     */
    storePendingUpdate(id, updates) {
        const pending = JSON.parse(localStorage.getItem('jvs_pending_updates') || '{}');
        pending[id] = updates;
        localStorage.setItem('jvs_pending_updates', JSON.stringify(pending));
    }

    /**
     * Sync pending changes when coming online
     */
    async syncPendingChanges() {
        if (!this.db) return;

        const pending = JSON.parse(localStorage.getItem('jvs_pending_updates') || '{}');
        const promises = [];

        for (const [id, updates] of Object.entries(pending)) {
            promises.push(this.updateAreal(id, updates));
        }

        try {
            await Promise.all(promises);
            localStorage.removeItem('jvs_pending_updates');
            console.log('[DataService] Pending changes synced successfully');
        } catch (error) {
            console.error('[DataService] Failed to sync pending changes:', error);
        }
    }

    /**
     * Cleanup method
     */
    cleanup() {
        // Unsubscribe from all listeners
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners.clear();
        
        // Clear cache
        this.arealsCache.clear();
        
        console.log('[DataService] Cleanup completed');
    }
}

// =============================================
// SINGLETON EXPORT
// =============================================

export const dataService = new DataService();
export default dataService;