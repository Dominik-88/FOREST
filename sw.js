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
    '/styles/main.css',
    '/scripts/app.js',
    '/manifest.json',
    '/data/areals-2025-updated.json'
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
                return cache.addAll(ASSETS_TO_CACHE);
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
// FETCH EVENT (FIXED!)
// =============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone response for caching
                const responseToCache = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseToCache);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // FIXED: Only return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL)
                                .then((offlineResponse) => {
                                    if (offlineResponse) {
                                        return offlineResponse;
                                    }
                                    
                                    // Fallback HTML if offline page not cached
                                    return new Response(
                                        '<html><body><h1>Offline</h1><p>Aplikace není dostupná offline.</p></body></html>',
                                        {
                                            headers: { 'Content-Type': 'text/html' }
                                        }
                                    );
                                });
                        }
                        
                        // For non-navigation requests (images, scripts, etc.)
                        // Return a network error instead of HTML
                        return new Response('Network error', {
                            status: 408,
                            statusText: 'Network error'
                        });
                    });
            })
    );
});

// =============================================
// MESSAGE EVENT
// =============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(() => {
                    console.log('[SW] Cache cleared');
                    return self.clients.matchAll();
                })
                .then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'CACHE_CLEARED'
                        });
                    });
                })
        );
    }
});