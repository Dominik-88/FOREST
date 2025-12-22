/**
 * JVS Management System - Enhanced Service Worker
 * Cache-First strategy with IndexedDB for offline support
 * Version: 2.0.0
 */

const CACHE_VERSION = 'jvs-v2.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/src/core/state.js',
    '/src/services/firestore.service.js',
    '/src/services/map.service.enhanced.js',
    '/src/modules/gps.module.js',
    '/src/assets/css/main.css',
    '/src/assets/css/components.css',
    '/src/assets/css/map-enhanced.css',
    '/src/assets/css/animations.css',
    // External libraries (CDN)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js'
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

// =============================================
// INSTALL EVENT
// =============================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                console.log('[SW] Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// =============================================
// ACTIVATE EVENT
// =============================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('jvs-') && name !== CACHE_STATIC && name !== CACHE_DYNAMIC && name !== CACHE_IMAGES)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                return self.clients.claim(); // Take control immediately
            })
    );
});

// =============================================
// FETCH EVENT - Cache-First Strategy
// =============================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Firebase/Firestore requests (handle separately)
    if (url.hostname.includes('firebaseio.com') || url.hostname.includes('firestore.googleapis.com')) {
        return;
    }

    // Determine caching strategy based on request type
    if (isImageRequest(request)) {
        event.respondWith(cacheFirstImage(request));
    } else if (isStaticAsset(request)) {
        event.respondWith(cacheFirstStatic(request));
    } else {
        event.respondWith(cacheFirstDynamic(request));
    }
});

// =============================================
// CACHING STRATEGIES
// =============================================

/**
 * Cache-First strategy for static assets
 */
async function cacheFirstStatic(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_STATIC);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first static failed:', error);
        return new Response('Offline - Asset not available', { status: 503 });
    }
}

/**
 * Cache-First strategy for dynamic content
 */
async function cacheFirstDynamic(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            // Return cached version and update in background
            fetchAndUpdateCache(request, CACHE_DYNAMIC);
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_DYNAMIC);
            cache.put(request, networkResponse.clone());
            
            // Limit cache size
            limitCacheSize(CACHE_DYNAMIC, MAX_DYNAMIC_CACHE_SIZE);
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first dynamic failed:', error);
        
        // Try to return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Offline - Content not available', { status: 503 });
    }
}

/**
 * Cache-First strategy for images
 */
async function cacheFirstImage(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_IMAGES);
            cache.put(request, networkResponse.clone());
            
            // Limit cache size
            limitCacheSize(CACHE_IMAGES, MAX_IMAGE_CACHE_SIZE);
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first image failed:', error);
        return new Response('Offline - Image not available', { status: 503 });
    }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Check if request is for an image
 */
function isImageRequest(request) {
    return request.destination === 'image' || 
           /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(request.url);
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
    return /\.(css|js|woff|woff2|ttf|eot)$/i.test(request.url) ||
           request.url.includes('cdnjs.cloudflare.com') ||
           request.url.includes('fonts.googleapis.com') ||
           request.url.includes('fonts.gstatic.com');
}

/**
 * Fetch and update cache in background
 */
async function fetchAndUpdateCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
    } catch (error) {
        // Silently fail - we already returned cached version
    }
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
        const keysToDelete = keys.slice(0, keys.length - maxSize);
        await Promise.all(keysToDelete.map(key => cache.delete(key)));
        console.log(`[SW] Trimmed ${cacheName} cache to ${maxSize} items`);
    }
}

// =============================================
// BACKGROUND SYNC (for offline data)
// =============================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-areals') {
        event.waitUntil(syncArealData());
    }
});

/**
 * Sync areal data when back online
 */
async function syncArealData() {
    try {
        console.log('[SW] Syncing areal data...');
        
        // Get pending updates from IndexedDB
        const db = await openIndexedDB();
        const pendingUpdates = await getPendingUpdates(db);
        
        if (pendingUpdates.length === 0) {
            console.log('[SW] No pending updates to sync');
            return;
        }

        // Send updates to Firestore
        for (const update of pendingUpdates) {
            await fetch('/api/sync-areal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update)
            });
        }

        // Clear pending updates
        await clearPendingUpdates(db);
        
        console.log('[SW] Sync completed successfully');
    } catch (error) {
        console.error('[SW] Sync failed:', error);
        throw error; // Retry sync
    }
}

// =============================================
// INDEXEDDB HELPERS
// =============================================

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('JVS_DB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('pending_updates')) {
                db.createObjectStore('pending_updates', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

async function getPendingUpdates(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pending_updates'], 'readonly');
        const store = transaction.objectStore('pending_updates');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function clearPendingUpdates(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pending_updates'], 'readwrite');
        const store = transaction.objectStore('pending_updates');
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// =============================================
// PUSH NOTIFICATIONS (future feature)
// =============================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'JVS Management System';
    const options = {
        body: data.body || 'Nová notifikace',
        icon: '/src/assets/icons/icon-192x192.png',
        badge: '/src/assets/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[SW] Service worker loaded');
