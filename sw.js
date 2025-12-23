const CACHE_VERSION = 'jvs-ultimate-v2.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  '/FOREST/',
  '/FOREST/jvs-ultimate-pro.html',
  '/FOREST/config.json',
  '/FOREST/data/areals.json',
  '/FOREST/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://unpkg.com/aos@2.3.4/dist/aos.css',
  'https://unpkg.com/aos@2.3.4/dist/aos.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install failed:', err))
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('jvs-ultimate-') && name !== CACHE_STATIC && name !== CACHE_DYNAMIC && name !== CACHE_IMAGES)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
      .catch(err => console.error('[SW] Activation failed:', err))
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // Handle different resource types
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Image requests - cache first, fallback to network
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(CACHE_IMAGES);
    const cached = await cache.match(request);
    
    if (cached) {
      // Return cached, update in background
      fetchAndCache(request, CACHE_IMAGES);
      return cached;
    }
    
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      limitCacheSize(CACHE_IMAGES, MAX_CACHE_SIZE);
    }
    return response;
  } catch (error) {
    console.error('[SW] Image fetch failed:', error);
    return new Response('Image not available', { status: 503 });
  }
}

// API requests - network first, fallback to cache
async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static assets - cache first
async function handleStaticRequest(request) {
  try {
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Static fetch failed:', error);
    return new Response('Resource not available', { status: 503 });
  }
}

// Dynamic requests - network first, fallback to cache
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, response.clone());
      limitCacheSize(CACHE_DYNAMIC, MAX_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page
    return new Response(`
      <!DOCTYPE html>
      <html lang="cs">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - JVS Ultimate PRO</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #0055ff 0%, #0044cc 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 500px;
          }
          h1 {
            font-size: 48px;
            margin-bottom: 16px;
          }
          p {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 32px;
          }
          button {
            background: white;
            color: #0055ff;
            border: none;
            padding: 12px 32px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          button:hover {
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📡 Offline</h1>
          <p>Nemáte připojení k internetu. Některé funkce mohou být omezené.</p>
          <button onclick="location.reload()">Zkusit znovu</button>
        </div>
      </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Helper: Check if request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(request.url);
}

// Helper: Check if request is for API
function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('.json') ||
         request.url.includes('firebase') ||
         request.url.includes('generativelanguage.googleapis.com');
}

// Helper: Check if request is for static asset
function isStaticAsset(request) {
  return request.url.includes('cdnjs.cloudflare.com') ||
         request.url.includes('cdn.jsdelivr.net') ||
         request.url.includes('unpkg.com') ||
         request.url.includes('fonts.googleapis.com') ||
         request.url.includes('fonts.gstatic.com');
}

// Helper: Fetch and cache in background
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silently fail
  }
}

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxSize) {
      await cache.delete(keys[0]);
      limitCacheSize(cacheName, maxSize);
    }
  } catch (error) {
    console.error('[SW] Cache size limit failed:', error);
  }
}

// Helper: Clean old cache entries
async function cleanOldCacheEntries(cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const now = Date.now();
    
    for (const request of keys) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        if (now - cacheDate > maxAge) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Clean old entries failed:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Sync logic here
    console.log('[SW] Syncing data...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'JVS Ultimate PRO';
  const options = {
    body: data.body || 'Nová notifikace',
    icon: data.icon || '/FOREST/icon-192.png',
    badge: '/FOREST/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/FOREST/',
    actions: [
      { action: 'open', title: 'Otevřít' },
      { action: 'close', title: 'Zavřít' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/FOREST/')
    );
  }
});

// Message from client
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
    );
  }
});

// Periodic background sync (experimental)
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'update-data') {
    event.waitUntil(updateData());
  }
});

async function updateData() {
  try {
    console.log('[SW] Updating data...');
    // Update logic here
  } catch (error) {
    console.error('[SW] Update failed:', error);
  }
}

console.log('[SW] Service Worker loaded v' + CACHE_VERSION);