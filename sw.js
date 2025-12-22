/**
 * JVS Management System - Service Worker
 * PWA Caching and Offline Support
 * Version: 2.0.0
 */

// =============================================
// CONFIGURATION
// =============================================

const CACHE_NAME = 'jvs-system-v2.0.0';
const DATA_CACHE_NAME = 'jvs-system-data-v2.0.0';

// Files to cache for offline functionality
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // Styles
    '/src/assets/css/main.css',
    '/src/assets/css/components.css',
    '/src/assets/css/map.css',
    '/src/assets/css/animations.css',
    '/src/assets/css/ai-components.css',
    
    // Scripts
    '/src/app.js',
    '/src/services/data.service.js',
    '/src/services/map.service.js',
    '/src/services/ai.service.js',
    '/src/modules/filters.module.js',
    '/src/modules/routes.module.js',
    '/src/modules/ui.module.js',
    '/src/components/modal.component.js',
    '/src/components/toast.component.js',
    
    // External libraries (CDN)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    
    // Icons
    '/src/assets/icons/icon-192x192.png',
    '/src/assets/icons/icon-512x512.png',
    '/src/assets/icons/apple-touch-icon.png',
    '/src/assets/icons/favicon-32x32.png',
    '/src/assets/icons/favicon-16x16.png'
];

// API endpoints to cache
const API_URLS = [
    /^\\/api\\//,
    /firestore\\.googleapis\\.com/,
    /firebase/
];

// Background sync tags
const SYNC_TAGS = {
    DATA_SYNC: 'data-sync',
    MAINTENANCE_SYNC: 'maintenance-sync'
};

// =============================================
// INSTALLATION
// =============================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching app shell');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// =============================================
// ACTIVATION
// =============================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('[SW] Removing old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Take control of all clients immediately
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

// =============================================
// FETCH HANDLING
// =============================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests
    if (isAPIRequest(url)) {
        // API requests - cache with network first strategy
        event.respondWith(handleAPIRequest(request));
    } else if (isMapTileRequest(url)) {
        // Map tiles - cache with cache first strategy
        event.respondWith(handleMapTileRequest(request));
    } else if (isStaticAsset(url)) {
        // Static assets - cache first strategy
        event.respondWith(handleStaticAssetRequest(request));
    } else {
        // Navigation requests - cache first with network fallback
        event.respondWith(handleNavigationRequest(request));
    }
});

/**
 * Handle API requests with network-first strategy
 */
async function handleAPIRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed for API request, trying cache:', request.url);
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response
        return new Response(
            JSON.stringify({
                error: 'Network unavailable',
                offline: true,
                timestamp: Date.now()
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
    }
}

/**
 * Handle map tile requests with cache-first strategy
 */
async function handleMapTileRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Map tile request failed:', request.url);
        // Return placeholder tile or empty response
        return new Response('', { status: 404 });
    }
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticAssetRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Static asset request failed:', request.url);
        return new Response('', { status: 404 });
    }
}

/**
 * Handle navigation requests
 */
async function handleNavigationRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('[SW] Navigation request failed, using cached version');
        
        // Fallback to cached index.html
        const cachedResponse = await cache.match('/index.html');
        return cachedResponse || new Response('App unavailable offline', { status: 503 });
    }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Check if request is to an API endpoint
 */
function isAPIRequest(url) {
    return API_URLS.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(url.pathname) || pattern.test(url.hostname);
        }
        return url.pathname.startsWith(pattern);
    });
}

/**
 * Check if request is for map tiles
 */
function isMapTileRequest(url) {
    return url.hostname.includes('tile.openstreetmap.org') ||
           url.hostname.includes('tiles.') ||
           url.pathname.includes('/tile/');
}

/**
 * Check if request is for static assets
 */
function isStaticAsset(url) {
    return url.pathname.includes('/src/') ||
           url.pathname.includes('/assets/') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.png') ||
           url.pathname.endsWith('.jpg') ||
           url.pathname.endsWith('.ico') ||
           url.hostname.includes('cdnjs.cloudflare.com') ||
           url.hostname.includes('fonts.googleapis.com') ||
           url.hostname.includes('cdn.tailwindcss.com');
}

// =============================================
// BACKGROUND SYNC
// =============================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    switch (event.tag) {
        case SYNC_TAGS.DATA_SYNC:
            event.waitUntil(syncOfflineData());
            break;
        case SYNC_TAGS.MAINTENANCE_SYNC:
            event.waitUntil(syncMaintenanceData());
            break;
        default:
            console.log('[SW] Unknown sync tag:', event.tag);
    }
});

/**
 * Sync offline data changes
 */
async function syncOfflineData() {
    try {
        console.log('[SW] Syncing offline data...');
        
        // Get pending changes from IndexedDB or localStorage
        const pendingChanges = await getPendingChanges();
        
        if (pendingChanges.length === 0) {
            console.log('[SW] No pending changes to sync');
            return;
        }
        
        // Sync each change
        for (const change of pendingChanges) {
            try {
                await syncSingleChange(change);
                await removePendingChange(change.id);
            } catch (error) {
                console.error('[SW] Failed to sync change:', change, error);
            }
        }
        
        console.log('[SW] Data sync completed');
        
        // Notify clients about sync completion
        await notifyClients('data-synced', { count: pendingChanges.length });
        
    } catch (error) {
        console.error('[SW] Data sync failed:', error);
    }
}

/**
 * Sync maintenance data
 */
async function syncMaintenanceData() {
    try {
        console.log('[SW] Syncing maintenance data...');
        // Implementation for maintenance-specific sync
        await notifyClients('maintenance-synced');
    } catch (error) {
        console.error('[SW] Maintenance sync failed:', error);
    }
}

// =============================================
// PUSH NOTIFICATIONS
// =============================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push message received');
    
    let data = {};
    if (event.data) {
        data = event.data.json();
    }
    
    const options = {
        body: data.body || 'Nová aktualizace v JVS systému',
        icon: '/src/assets/icons/icon-192x192.png',
        badge: '/src/assets/icons/badge-72x72.png',
        tag: data.tag || 'jvs-notification',
        renotify: true,
        requireInteraction: data.urgent || false,
        actions: [
            {
                action: 'view',
                title: 'Zobrazit',
                icon: '/src/assets/icons/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Zavřít'
            }
        ],
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || 'JVS Management System',
            options
        )
    );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        // Open the app
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Open new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// =============================================
// MESSAGE HANDLING
// =============================================

self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'SYNC_DATA':
            self.registration.sync.register(SYNC_TAGS.DATA_SYNC);
            break;
            
        default:
            console.log('[SW] Unknown message type:', type);
    }
});

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get pending changes from storage
 */
async function getPendingChanges() {
    // This would typically read from IndexedDB
    // For now, return empty array
    return [];
}

/**
 * Sync a single change
 */
async function syncSingleChange(change) {
    const response = await fetch(change.endpoint, {
        method: change.method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(change.data)
    });
    
    if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
    }
    
    return response.json();
}

/**
 * Remove pending change from storage
 */
async function removePendingChange(changeId) {
    // Implementation would remove from IndexedDB
    console.log('[SW] Removed pending change:', changeId);
}

/**
 * Notify all clients about an event
 */
async function notifyClients(type, data = {}) {
    const clients = await self.clients.matchAll();
    
    clients.forEach(client => {
        client.postMessage({
            type,
            data,
            timestamp: Date.now()
        });
    });
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('[SW] All caches cleared');
}

// =============================================
// ERROR HANDLING
// =============================================

self.addEventListener('error', (event) => {
    console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker loaded successfully');