/**
 * JVS Management PWA - Service Worker
 * Version: 1.0.0
 * 
 * Funkce:
 * - Offline cache strategie (Network First s Cache Fallback)
 * - Dynamické cachování map tiles
 * - Push notifikace
 * - Background sync
 * - Geofencing support
 */

const CACHE_VERSION = 'jvs-pwa-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const MAP_CACHE = `${CACHE_VERSION}-maps`;

// Statické assety pro offline režim
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/map-enhanced.css',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
];

// Maximální velikost cache
const MAX_CACHE_SIZE = 100; // items
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dní

// ===== UTILITY FUNCTIONS =====

/**
 * Omezení velikosti cache
 */
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

/**
 * Vyčištění starých cache
 */
async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, MAP_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(name => !validCaches.includes(name))
      .map(name => {
        console.log('[SW] Deleting old cache:', name);
        return caches.delete(name);
      })
  );
}

/**
 * Kontrola stáří cache položky
 */
async function isCacheExpired(response) {
  if (!response) return true;
  
  const cachedDate = response.headers.get('sw-cached-date');
  if (!cachedDate) return false;
  
  const age = Date.now() - new Date(cachedDate).getTime();
  return age > MAX_CACHE_AGE;
}

// ===== INSTALL EVENT =====

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ===== ACTIVATE EVENT =====

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    cleanOldCaches()
      .then(() => {
        console.log('[SW] Old caches cleaned');
        return self.clients.claim();
      })
      .then(() => {
        console.log('[SW] Service Worker activated and claimed clients');
      })
  );
});

// ===== FETCH EVENT =====

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // Skip Firebase requests (always online)
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }
  
  // Map tiles - Cache First strategy
  if (url.hostname.includes('basemaps.cartocdn.com') || 
      url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(MAP_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              return fetch(request)
                .then((networkResponse) => {
                  cache.put(request, networkResponse.clone());
                  limitCacheSize(MAP_CACHE, MAX_CACHE_SIZE);
                  return networkResponse;
                })
                .catch(() => {
                  console.log('[SW] Map tile fetch failed, no cache available');
                });
            });
        })
    );
    return;
  }
  
  // API requests - Network First with Cache Fallback
  if (url.hostname.includes('api.open-meteo.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              const modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: new Headers(responseClone.headers)
              });
              modifiedResponse.headers.set('sw-cached-date', new Date().toISOString());
              cache.put(request, modifiedResponse);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse && !isCacheExpired(cachedResponse)) {
                console.log('[SW] Serving cached API response');
                return cachedResponse;
              }
              throw new Error('No cached response available');
            });
        })
    );
    return;
  }
  
  // Static assets - Cache First with Network Fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetch(request)
            .then((networkResponse) => {
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, networkResponse));
            })
            .catch(() => {});
          
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.ok) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                  limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return offline page for navigation
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            throw new Error('Network request failed and no cache available');
          });
      })
  );
});

// ===== PUSH NOTIFICATION EVENT =====

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JVS Management';
  const options = {
    body: data.body || 'Nová notifikace z JVS Management',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'jvs-notification',
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data.customData
    },
    actions: [
      {
        action: 'open',
        title: 'Otevřít',
        icon: '/icons/icon-72.png'
      },
      {
        action: 'close',
        title: 'Zavřít'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ===== NOTIFICATION CLICK EVENT =====

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ===== BACKGROUND SYNC EVENT =====

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-maintenance-data') {
    event.waitUntil(
      syncMaintenanceData()
        .then(() => {
          console.log('[SW] Maintenance data synced successfully');
        })
        .catch((error) => {
          console.error('[SW] Sync failed:', error);
          throw error; // Retry sync
        })
    );
  }
});

/**
 * Synchronizace údržbových dat s Firebase
 */
async function syncMaintenanceData() {
  // Get pending changes from IndexedDB
  const db = await openIndexedDB();
  const pendingChanges = await getPendingChanges(db);
  
  if (pendingChanges.length === 0) {
    console.log('[SW] No pending changes to sync');
    return;
  }
  
  // Send to Firebase
  const responses = await Promise.all(
    pendingChanges.map(change => 
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(change)
      })
    )
  );
  
  // Clear synced changes
  await clearPendingChanges(db, pendingChanges);
  
  return responses;
}

// ===== MESSAGE EVENT =====

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map(name => caches.delete(name))
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
    );
  }
  
  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map(async (name) => {
              const cache = await caches.open(name);
              const keys = await cache.keys();
              return { name, size: keys.length };
            })
          );
        })
        .then((cacheInfo) => {
          event.ports[0].postMessage({ cacheInfo });
        })
    );
  }
});

// ===== GEOFENCING (Experimental) =====

/**
 * Kontrola geofencing při změně polohy
 * Vyžaduje Geolocation API a Background Geolocation
 */
self.addEventListener('geofence', (event) => {
  console.log('[SW] Geofence event:', event.region);
  
  const { region, state } = event;
  
  if (state === 'enter') {
    // Uživatel vstoupil do geofence oblasti
    self.registration.showNotification('Blížíte se k areálu', {
      body: `Jste poblíž areálu: ${region.name}`,
      icon: '/icons/icon-192.png',
      tag: 'geofence-' + region.id,
      data: { areaId: region.id }
    });
  }
});

console.log('[SW] Service Worker script loaded v' + CACHE_VERSION);