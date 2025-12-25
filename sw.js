/**
 * JVS FOREST v4.0 - Service Worker
 * Secure offline caching with proper fallback handling
 * 
 * @version 4.0.0
 * @date 2025-12-25
 */

const CACHE_NAME = 'jvs-forest-v4.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/scripts/provozni-mapa.js',
    '/scripts/firebase-config.js',
    '/data/areals-2025-updated.json',
    // Leaflet
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css',
    'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js',
    'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css',
    'https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js',
    'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css',
    'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js',
    'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js',
    // Icons
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    // Tailwind
    'https://cdn.tailwindcss.com'
];

// =============================================
// INSTALL EVENT
// =============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets');
                // Cache local assets first
                const localAssets = ASSETS_TO_CACHE.filter(url => !url.startsWith('http'));
                return cache.addAll(localAssets)
                    .then(() => {
                        // Then try to cache external assets (don't fail if they fail)
                        const externalAssets = ASSETS_TO_CACHE.filter(url => url.startsWith('http'));
                        return Promise.allSettled(
                            externalAssets.map(url => 
                                cache.add(url).catch(err => {
                                    console.warn(`[SW] Failed to cache ${url}:`, err);
                                })
                            )
                        );
                    });
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// =============================================
// ACTIVATE EVENT
// =============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// =============================================
// FETCH EVENT - Network First with Cache Fallback
// =============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extensions
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Skip Firebase API calls (always need fresh data)
    if (url.hostname.includes('firebaseio.com') || 
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('firestore.googleapis.com')) {
        return;
    }
    
    // Network First strategy for HTML
    if (request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If no cache, return offline page
                            return caches.match(OFFLINE_URL);
                        });
                })
        );
        return;
    }
    
    // Cache First strategy for static assets
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    fetch(request)
                        .then((response) => {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, response);
                            });
                        })
                        .catch(() => {
                            // Network failed, but we have cache
                        });
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // Clone and cache the response
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // For other requests, just fail
                        throw error;
                    });
            })
    );
});

// =============================================
// MESSAGE EVENT - Handle messages from clients
// =============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// =============================================
// SYNC EVENT - Background sync (future feature)
// =============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-areals') {
        event.waitUntil(
            // Future: Sync data with Firebase when back online
            Promise.resolve()
        );
    }
});

// =============================================
// PUSH EVENT - Push notifications (future feature)
// =============================================
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nová notifikace z JVS FOREST',
        icon: '/manifest-icon-192.png',
        badge: '/manifest-icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('JVS FOREST', options)
    );
});

// =============================================
// NOTIFICATION CLICK EVENT
// =============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});