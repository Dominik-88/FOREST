/**
 * JVS Enhanced v3.0 - Main Application
 * Pokročilý systém správy vodárenských areálů
 * 
 * Features:
 * - Firebase Realtime kolaborace
 * - Geofencing notifikace
 * - Heatmapa intenzity
 * - Chart.js grafy
 * - Open-Meteo počasí
 * - OSRM optimalizace tras
 * - Undo/Redo historie
 * - GPS vzdálenostní filtrace
 * 
 * @version 3.0.0
 * @author JVS Team
 * @date 2025-12-25
 */

// =============================================
// CONFIGURATION
// =============================================

const CONFIG = {
    // Firebase Configuration
    firebase: {
        apiKey: "YOUR_API_KEY",
        authDomain: "jvs-forest.firebaseapp.com",
        projectId: "jvs-forest",
        storageBucket: "jvs-forest.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    
    // Map Configuration
    map: {
        center: [49.0, 14.5],
        zoom: 9,
        maxZoom: 18,
        minZoom: 7
    },
    
    // Geofencing Configuration
    geofencing: {
        enabled: false,
        radius: 500, // meters
        checkInterval: 30000 // 30 seconds
    },
    
    // API Endpoints
    api: {
        openMeteo: 'https://api.open-meteo.com/v1/forecast',
        osrm: 'https://router.project-osrm.org'
    },
    
    // Data Source
    dataSource: './data/areals-2025-updated.json'
};

// =============================================
// GLOBAL STATE
// =============================================

const STATE = {
    areals: [],
    filteredAreals: [],
    selectedAreal: null,
    userLocation: null,
    map: null,
    markers: null,
    heatmapLayer: null,
    routeLayer: null,
    chart: null,
    geofencingActive: false,
    history: {
        past: [],
        future: [],
        current: null
    }
};

// =============================================
// FIREBASE INITIALIZATION
// =============================================

let db = null;
let auth = null;

function initFirebase() {
    try {
        firebase.initializeApp(CONFIG.firebase);
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Anonymous authentication
        auth.signInAnonymously()
            .then(() => {
                console.log('✅ Firebase authenticated');
                setupRealtimeSync();
            })
            .catch(err => {
                console.warn('⚠️ Firebase auth failed:', err.message);
            });
    } catch (error) {
        console.warn('⚠️ Firebase initialization skipped:', error.message);
    }
}

function setupRealtimeSync() {
    if (!db) return;
    
    // Listen to areals collection
    db.collection('areals').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'modified') {
                const data = change.doc.data();
                updateArealInState(data);
                showToast('Areál aktualizován jiným uživatelem', 'info');
            }
        });
    });
}

function updateArealInState(updatedAreal) {
    const index = STATE.areals.findIndex(a => a.id === updatedAreal.id);
    if (index !== -1) {
        STATE.areals[index] = { ...STATE.areals[index], ...updatedAreal };
        renderAreals();
        updateMap();
    }
}

// =============================================
// MAP INITIALIZATION
// =============================================

function initMap() {
    // Initialize Leaflet map
    STATE.map = L.map('map', {
        center: CONFIG.map.center,
        zoom: CONFIG.map.zoom,
        zoomControl: false
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: CONFIG.map.maxZoom,
        minZoom: CONFIG.map.minZoom
    }).addTo(STATE.map);
    
    // Add zoom control to bottom right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(STATE.map);
    
    // Initialize marker cluster group
    STATE.markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    STATE.map.addLayer(STATE.markers);
    
    console.log('✅ Map initialized');
}

// =============================================
// DATA LOADING
// =============================================

async function loadData() {
    try {
        const response = await fetch(CONFIG.dataSource);
        if (!response.ok) throw new Error('Failed to load data');
        
        STATE.areals = await response.json();
        STATE.filteredAreals = [...STATE.areals];
        
        console.log(`✅ Loaded ${STATE.areals.length} areals`);
        
        // Initial render
        renderAreals();
        updateMap();
        updateStatistics();
        initChart();
        
        return STATE.areals;
    } catch (error) {
        console.error('❌ Data loading failed:', error);
        showToast('Chyba při načítání dat', 'error');
        return [];
    }
}

// =============================================
// MAP RENDERING
// =============================================

function updateMap() {
    // Clear existing markers
    STATE.markers.clearLayers();
    
    // Add markers for filtered areals
    STATE.filteredAreals.forEach(areal => {
        const marker = createMarker(areal);
        STATE.markers.addLayer(marker);
    });
    
    // Fit bounds if markers exist
    if (STATE.filteredAreals.length > 0) {
        const bounds = STATE.markers.getBounds();
        if (bounds.isValid()) {
            STATE.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

function createMarker(areal) {
    // Determine marker color based on category
    const color = getMarkerColor(areal.kategorie);
    
    // Create custom icon
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            ">
                ${areal.id}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
    
    // Create marker
    const marker = L.marker([areal.lat, areal.lon], { icon });
    
    // Add popup
    marker.bindPopup(createPopupContent(areal), {
        maxWidth: 300,
        className: 'custom-popup'
    });
    
    // Add click handler
    marker.on('click', () => {
        STATE.selectedAreal = areal;
        highlightArealInList(areal.id);
    });
    
    return marker;
}

function getMarkerColor(kategorie) {
    switch (kategorie) {
        case 'I.': return '#ef4444'; // Red - High risk
        case 'II.': return '#f59e0b'; // Orange - Medium risk
        default: return '#10b981'; // Green - Low risk
    }
}

function createPopupContent(areal) {
    return `
        <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #1e293b;">
                ${areal.nazev}
            </h3>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
                <div><strong>Okres:</strong> ${areal.okres}</div>
                <div><strong>Kategorie:</strong> ${areal.kategorie || 'Bez kategorie'}</div>
                <div><strong>Výměra:</strong> ${areal.vymera.toLocaleString()} m²</div>
                <div><strong>Oplocení:</strong> ${areal.oploceni} bm</div>
                <div><strong>Priorita:</strong> ${areal.priorita}/100</div>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button onclick="editAreal(${areal.id})" 
                        style="flex: 1; padding: 8px; background: #0055ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                    <i class="fas fa-edit"></i> Upravit
                </button>
                <button onclick="addToRoute(${areal.id})" 
                        style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                    <i class="fas fa-route"></i> Do trasy
                </button>
            </div>
        </div>
    `;
}

// =============================================
// HEATMAP
// =============================================

function toggleHeatmap() {
    if (STATE.heatmapLayer) {
        STATE.map.removeLayer(STATE.heatmapLayer);
        STATE.heatmapLayer = null;
        showToast('Heatmapa vypnuta', 'info');
        return;
    }
    
    // Create heatmap data
    const heatData = STATE.filteredAreals.map(areal => {
        // Intensity based on category and priority
        let intensity = 0.3;
        if (areal.kategorie === 'I.') intensity = 1.0;
        else if (areal.kategorie === 'II.') intensity = 0.6;
        
        // Adjust by priority
        intensity *= (areal.priorita / 100);
        
        return [areal.lat, areal.lon, intensity];
    });
    
    // Create heatmap layer
    STATE.heatmapLayer = L.heatLayer(heatData, {
        radius: 30,
        blur: 25,
        maxZoom: 13,
        max: 1.0,
        gradient: {
            0.0: '#4ade80',
            0.5: '#fbbf24',
            1.0: '#f87171'
        }
    }).addTo(STATE.map);
    
    showToast('Heatmapa aktivována', 'success');
}

// =============================================
// GEOFENCING
// =============================================

function toggleGeofencing() {
    CONFIG.geofencing.enabled = !CONFIG.geofencing.enabled;
    
    const indicator = document.getElementById('geofenceIndicator');
    
    if (CONFIG.geofencing.enabled) {
        indicator.style.display = 'block';
        startGeofencing();
        showToast('Geofencing aktivován', 'success');
    } else {
        indicator.style.display = 'none';
        stopGeofencing();
        showToast('Geofencing vypnut', 'info');
    }
}

let geofencingInterval = null;

function startGeofencing() {
    if (!navigator.geolocation) {
        showToast('Geolokace není podporována', 'error');
        return;
    }
    
    // Check immediately
    checkGeofences();
    
    // Then check periodically
    geofencingInterval = setInterval(checkGeofences, CONFIG.geofencing.checkInterval);
}

function stopGeofencing() {
    if (geofencingInterval) {
        clearInterval(geofencingInterval);
        geofencingInterval = null;
    }
}

function checkGeofences() {
    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        
        STATE.userLocation = { lat: userLat, lon: userLon };
        
        // Check each high-priority areal
        STATE.areals
            .filter(a => a.kategorie === 'I.' && a.priorita >= 85)
            .forEach(areal => {
                const distance = calculateDistance(
                    userLat, userLon,
                    areal.lat, areal.lon
                );
                
                if (distance <= CONFIG.geofencing.radius) {
                    sendGeofenceNotification(areal, distance);
                }
            });
    }, error => {
        console.warn('Geolocation error:', error);
    });
}

function sendGeofenceNotification(areal, distance) {
    // Check if notification was already sent recently
    const key = `geofence_${areal.id}`;
    const lastNotif = localStorage.getItem(key);
    const now = Date.now();
    
    if (lastNotif && (now - parseInt(lastNotif)) < 3600000) {
        return; // Don't spam - wait 1 hour
    }
    
    // Send notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Přiblížení k areálu', {
            body: `Jste ${Math.round(distance)}m od ${areal.nazev} (Priorita: ${areal.priorita})`,
            icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%230055ff\'/%3E%3Ctext x=\'50\' y=\'65\' font-size=\'60\' fill=\'white\' text-anchor=\'middle\' font-weight=\'bold\'%3EJ%3C/text%3E%3C/svg%3E',
            tag: key
        });
    }
    
    // Show toast
    showToast(`📍 Blízko: ${areal.nazev} (${Math.round(distance)}m)`, 'warning');
    
    // Save timestamp
    localStorage.setItem(key, now.toString());
}

// =============================================
// WEATHER API (Open-Meteo)
// =============================================

async function loadWeather() {
    if (!STATE.userLocation) {
        // Use default location (České Budějovice)
        STATE.userLocation = { lat: 48.9745, lon: 14.4743 };
    }
    
    try {
        const url = `${CONFIG.api.openMeteo}?latitude=${STATE.userLocation.lat}&longitude=${STATE.userLocation.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=Europe/Prague`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const current = data.current;
        
        // Update UI
        document.getElementById('weatherTemp').textContent = `${Math.round(current.temperature_2m)}°C`;
        document.getElementById('weatherWind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        document.getElementById('weatherHumidity').textContent = `${current.relative_humidity_2m}%`;
        document.getElementById('weatherRain').textContent = `${current.precipitation} mm`;
        document.getElementById('weatherLocation').textContent = 'České Budějovice';
        
        // Weather icon and description
        const weatherInfo = getWeatherInfo(current.weather_code);
        document.getElementById('weatherIcon').textContent = weatherInfo.icon;
        document.getElementById('weatherDesc').textContent = weatherInfo.desc;
        
        console.log('✅ Weather loaded');
    } catch (error) {
        console.error('❌ Weather loading failed:', error);
        document.getElementById('weatherDesc').textContent = 'Nedostupné';
    }
}

function getWeatherInfo(code) {
    // WMO Weather interpretation codes
    const weatherCodes = {
        0: { icon: '☀️', desc: 'Jasno' },
        1: { icon: '🌤️', desc: 'Převážně jasno' },
        2: { icon: '⛅', desc: 'Polojasno' },
        3: { icon: '☁️', desc: 'Oblačno' },
        45: { icon: '🌫️', desc: 'Mlha' },
        48: { icon: '🌫️', desc: 'Námraza' },
        51: { icon: '🌦️', desc: 'Mrholení' },
        61: { icon: '🌧️', desc: 'Déšť' },
        71: { icon: '🌨️', desc: 'Sněžení' },
        95: { icon: '⛈️', desc: 'Bouřka' }
    };
    
    return weatherCodes[code] || { icon: '☁️', desc: 'Proměnlivé' };
}

// =============================================
// ROUTE OPTIMIZATION (OSRM)
// =============================================

const routePoints = [];

function addToRoute(arealId) {
    const areal = STATE.areals.find(a => a.id === arealId);
    if (!areal) return;
    
    if (routePoints.length >= 10) {
        showToast('Maximum 10 bodů v trase', 'warning');
        return;
    }
    
    if (routePoints.find(p => p.id === arealId)) {
        showToast('Areál již je v trase', 'info');
        return;
    }
    
    routePoints.push(areal);
    updateRouteUI();
    
    // Enable buttons
    document.getElementById('optimizeRoute').disabled = routePoints.length < 2;
    document.getElementById('clearRoute').disabled = false;
    
    showToast(`Přidáno: ${areal.nazev}`, 'success');
}

function updateRouteUI() {
    const container = document.getElementById('routePoints');
    
    if (routePoints.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-600">Vyberte areály pro optimalizaci trasy</p>';
        return;
    }
    
    container.innerHTML = routePoints.map((areal, index) => `
        <div class="flex items-center justify-between bg-gray-50 rounded-lg p-2 mb-2">
            <div class="flex items-center gap-2">
                <span class="font-bold text-primary">${index + 1}.</span>
                <span class="text-sm">${areal.nazev}</span>
            </div>
            <button onclick="removeFromRoute(${areal.id})" 
                    class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeFromRoute(arealId) {
    const index = routePoints.findIndex(p => p.id === arealId);
    if (index !== -1) {
        routePoints.splice(index, 1);
        updateRouteUI();
        
        document.getElementById('optimizeRoute').disabled = routePoints.length < 2;
        document.getElementById('clearRoute').disabled = routePoints.length === 0;
    }
}

async function optimizeRoute() {
    if (routePoints.length < 2) return;
    
    showToast('Optimalizuji trasu...', 'info');
    
    try {
        // Build coordinates string
        const coords = routePoints.map(p => `${p.lon},${p.lat}`).join(';');
        
        // Call OSRM API
        const url = `${CONFIG.api.osrm}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code !== 'Ok') throw new Error('OSRM routing failed');
        
        const route = data.routes[0];
        
        // Display route on map
        if (STATE.routeLayer) {
            STATE.map.removeLayer(STATE.routeLayer);
        }
        
        STATE.routeLayer = L.geoJSON(route.geometry, {
            style: {
                color: '#0055ff',
                weight: 4,
                opacity: 0.7
            }
        }).addTo(STATE.map);
        
        // Fit bounds
        STATE.map.fitBounds(STATE.routeLayer.getBounds(), { padding: [50, 50] });
        
        // Calculate savings (compare to naive route)
        const naiveDistance = calculateNaiveDistance(routePoints);
        const optimizedDistance = route.distance / 1000; // Convert to km
        const savings = ((naiveDistance - optimizedDistance) / naiveDistance * 100).toFixed(1);
        
        // Update UI
        document.getElementById('routeDistance').textContent = `${optimizedDistance.toFixed(1)} km`;
        document.getElementById('routeDuration').textContent = `${Math.round(route.duration / 60)} min`;
        document.getElementById('routeSavings').textContent = `${savings}% (${(naiveDistance - optimizedDistance).toFixed(1)} km)`;
        document.getElementById('routeResult').classList.remove('hidden');
        
        showToast('✅ Trasa optimalizována!', 'success');
        
    } catch (error) {
        console.error('Route optimization failed:', error);
        showToast('Chyba při optimalizaci trasy', 'error');
    }
}

function calculateNaiveDistance(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
        total += calculateDistance(
            points[i].lat, points[i].lon,
            points[i + 1].lat, points[i + 1].lon
        );
    }
    return total / 1000; // Convert to km
}

function clearRoute() {
    routePoints.length = 0;
    updateRouteUI();
    
    if (STATE.routeLayer) {
        STATE.map.removeLayer(STATE.routeLayer);
        STATE.routeLayer = null;
    }
    
    document.getElementById('routeResult').classList.add('hidden');
    document.getElementById('optimizeRoute').disabled = true;
    document.getElementById('clearRoute').disabled = true;
    
    showToast('Trasa vymazána', 'info');
}

// =============================================
// CHARTS (Chart.js)
// =============================================

function initChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    STATE.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Výměra (m²)',
                data: [],
                backgroundColor: 'rgba(0, 85, 255, 0.6)',
                borderColor: 'rgba(0, 85, 255, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Show area chart by default
    showChart('area');
}

function showChart(type) {
    if (!STATE.chart) return;
    
    let data, labels, label, color;
    
    // Get top 10 areals
    const topAreals = [...STATE.filteredAreals]
        .sort((a, b) => {
            if (type === 'area') return b.vymera - a.vymera;
            if (type === 'priority') return b.priorita - a.priorita;
            if (type === 'cost') return b.naklady - a.naklady;
            return 0;
        })
        .slice(0, 10);
    
    labels = topAreals.map(a => a.nazev.substring(0, 20));
    
    switch (type) {
        case 'area':
            data = topAreals.map(a => a.vymera);
            label = 'Výměra (m²)';
            color = 'rgba(0, 85, 255, 0.6)';
            break;
        case 'priority':
            data = topAreals.map(a => a.priorita);
            label = 'Priorita';
            color = 'rgba(245, 158, 11, 0.6)';
            break;
        case 'cost':
            data = topAreals.map(a => a.naklady);
            label = 'Náklady (Kč)';
            color = 'rgba(239, 68, 68, 0.6)';
            break;
    }
    
    STATE.chart.data.labels = labels;
    STATE.chart.data.datasets[0].data = data;
    STATE.chart.data.datasets[0].label = label;
    STATE.chart.data.datasets[0].backgroundColor = color;
    STATE.chart.data.datasets[0].borderColor = color.replace('0.6', '1');
    STATE.chart.update();
}

// =============================================
// FILTERS
// =============================================

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const district = document.getElementById('districtFilter').value;
    const catI = document.getElementById('catI').checked;
    const catII = document.getElementById('catII').checked;
    const catNone = document.getElementById('catNone').checked;
    
    STATE.filteredAreals = STATE.areals.filter(areal => {
        // Search filter
        if (search && !areal.nazev.toLowerCase().includes(search) && 
            !areal.okres.toLowerCase().includes(search)) {
            return false;
        }
        
        // District filter
        if (district && areal.okres !== district) {
            return false;
        }
        
        // Category filter
        if (areal.kategorie === 'I.' && !catI) return false;
        if (areal.kategorie === 'II.' && !catII) return false;
        if (!areal.kategorie && !catNone) return false;
        
        return true;
    });
    
    // Save to history
    saveToHistory();
    
    // Update UI
    renderAreals();
    updateMap();
    updateStatistics();
    showChart('area');
    
    showToast(`Zobrazeno ${STATE.filteredAreals.length} areálů`, 'success');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('districtFilter').value = '';
    document.getElementById('catI').checked = true;
    document.getElementById('catII').checked = true;
    document.getElementById('catNone').checked = true;
    
    applyFilters();
}

// =============================================
// DISTANCE SORTING
// =============================================

function sortByDistance() {
    if (!navigator.geolocation) {
        showToast('Geolokace není podporována', 'error');
        return;
    }
    
    showToast('Získávám polohu...', 'info');
    
    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        
        STATE.userLocation = { lat: userLat, lon: userLon };
        
        // Calculate distances
        STATE.filteredAreals.forEach(areal => {
            areal.distance = calculateDistance(
                userLat, userLon,
                areal.lat, areal.lon
            );
        });
        
        // Sort by distance
        STATE.filteredAreals.sort((a, b) => a.distance - b.distance);
        
        // Save to history
        saveToHistory();
        
        // Update UI
        renderAreals();
        
        showToast('Seřazeno podle vzdálenosti', 'success');
        
    }, error => {
        showToast('Chyba při získávání polohy', 'error');
        console.error('Geolocation error:', error);
    });
}

// =============================================
// UNDO/REDO HISTORY
// =============================================

function saveToHistory() {
    // Save current state
    const state = {
        filteredAreals: [...STATE.filteredAreals],
        timestamp: Date.now()
    };
    
    STATE.history.past.push(STATE.history.current);
    STATE.history.current = state;
    STATE.history.future = []; // Clear future on new action
    
    // Limit history size
    if (STATE.history.past.length > 20) {
        STATE.history.past.shift();
    }
    
    updateHistoryButtons();
}

function undo() {
    if (STATE.history.past.length === 0) return;
    
    STATE.history.future.push(STATE.history.current);
    STATE.history.current = STATE.history.past.pop();
    
    STATE.filteredAreals = [...STATE.history.current.filteredAreals];
    
    renderAreals();
    updateMap();
    updateStatistics();
    updateHistoryButtons();
    
    showToast('Akce vrácena zpět', 'info');
}

function redo() {
    if (STATE.history.future.length === 0) return;
    
    STATE.history.past.push(STATE.history.current);
    STATE.history.current = STATE.history.future.pop();
    
    STATE.filteredAreals = [...STATE.history.current.filteredAreals];
    
    renderAreals();
    updateMap();
    updateStatistics();
    updateHistoryButtons();
    
    showToast('Akce obnovena', 'info');
}

function updateHistoryButtons() {
    document.getElementById('undoBtn').disabled = STATE.history.past.length === 0;
    document.getElementById('redoBtn').disabled = STATE.history.future.length === 0;
}

// =============================================
// AREAL EDITING
// =============================================

function editAreal(arealId) {
    const areal = STATE.areals.find(a => a.id === arealId);
    if (!areal) return;
    
    // Populate form
    document.getElementById('editName').value = areal.nazev;
    document.getElementById('editDistrict').value = areal.okres;
    document.getElementById('editCategory').value = areal.kategorie || '';
    document.getElementById('editArea').value = areal.vymera;
    document.getElementById('editFence').value = areal.oploceni;
    document.getElementById('editLat').value = areal.lat;
    document.getElementById('editLon').value = areal.lon;
    document.getElementById('editPriority').value = areal.priorita;
    document.getElementById('priorityValue').textContent = areal.priorita;
    
    // Store current areal ID
    document.getElementById('editArealForm').dataset.arealId = arealId;
    
    // Show modal
    document.getElementById('editModal').classList.add('active');
}

function saveArealEdit(event) {
    event.preventDefault();
    
    const arealId = parseInt(document.getElementById('editArealForm').dataset.arealId);
    const areal = STATE.areals.find(a => a.id === arealId);
    if (!areal) return;
    
    // Get form values
    const updates = {
        nazev: document.getElementById('editName').value,
        okres: document.getElementById('editDistrict').value,
        kategorie: document.getElementById('editCategory').value,
        vymera: parseInt(document.getElementById('editArea').value),
        oploceni: parseInt(document.getElementById('editFence').value),
        lat: parseFloat(document.getElementById('editLat').value),
        lon: parseFloat(document.getElementById('editLon').value),
        priorita: parseInt(document.getElementById('editPriority').value)
    };
    
    // Validate
    if (!updates.nazev || !updates.okres || updates.vymera < 1) {
        showToast('Vyplňte všechna povinná pole', 'error');
        return;
    }
    
    // Update areal
    Object.assign(areal, updates);
    
    // Sync to Firebase
    if (db) {
        db.collection('areals').doc(arealId.toString()).set(areal)
            .then(() => console.log('✅ Synced to Firebase'))
            .catch(err => console.warn('⚠️ Firebase sync failed:', err));
    }
    
    // Save to history
    saveToHistory();
    
    // Update UI
    renderAreals();
    updateMap();
    updateStatistics();
    
    // Close modal
    closeModal('editModal');
    
    showToast('Areál aktualizován', 'success');
}

// =============================================
// UI RENDERING
// =============================================

function renderAreals() {
    const container = document.getElementById('arealsList');
    
    if (STATE.filteredAreals.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Žádné areály</p>';
        return;
    }
    
    container.innerHTML = STATE.filteredAreals.map(areal => `
        <div class="areal-item" onclick="focusAreal(${areal.id})" id="areal-${areal.id}">
            <div class="areal-name">${areal.nazev}</div>
            <div class="areal-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${areal.okres}</span>
                <span><i class="fas fa-ruler-combined"></i> ${areal.vymera.toLocaleString()} m²</span>
                ${areal.distance ? `<span><i class="fas fa-route"></i> ${(areal.distance / 1000).toFixed(1)} km</span>` : ''}
            </div>
            <div class="mt-2">
                <span class="areal-badge ${getBadgeClass(areal.kategorie)}">
                    ${areal.kategorie || 'Bez kategorie'}
                </span>
                <span class="areal-badge badge-${getPriorityLevel(areal.priorita)}">
                    Priorita: ${areal.priorita}
                </span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('arealsCount').textContent = STATE.filteredAreals.length;
}

function getBadgeClass(kategorie) {
    if (kategorie === 'I.') return 'badge-high';
    if (kategorie === 'II.') return 'badge-medium';
    return 'badge-low';
}

function getPriorityLevel(priorita) {
    if (priorita >= 85) return 'high';
    if (priorita >= 70) return 'medium';
    return 'low';
}

function focusAreal(arealId) {
    const areal = STATE.areals.find(a => a.id === arealId);
    if (!areal) return;
    
    STATE.map.setView([areal.lat, areal.lon], 14);
    STATE.selectedAreal = areal;
    
    // Find and open marker popup
    STATE.markers.eachLayer(layer => {
        if (layer.getLatLng().lat === areal.lat && layer.getLatLng().lng === areal.lon) {
            layer.openPopup();
        }
    });
}

function highlightArealInList(arealId) {
    // Remove previous highlight
    document.querySelectorAll('.areal-item').forEach(el => {
        el.style.borderColor = '#e2e8f0';
    });
    
    // Add highlight
    const element = document.getElementById(`areal-${arealId}`);
    if (element) {
        element.style.borderColor = '#0055ff';
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function updateStatistics() {
    const totalArea = STATE.filteredAreals.reduce((sum, a) => sum + a.vymera, 0);
    const totalFence = STATE.filteredAreals.reduce((sum, a) => sum + a.oploceni, 0);
    const avgPriority = Math.round(STATE.filteredAreals.reduce((sum, a) => sum + a.priorita, 0) / STATE.filteredAreals.length);
    const totalCost = STATE.filteredAreals.reduce((sum, a) => sum + (a.naklady || 0), 0);
    
    document.getElementById('totalArea').textContent = totalArea.toLocaleString();
    document.getElementById('totalFence').textContent = totalFence.toLocaleString();
    document.getElementById('avgPriority').textContent = avgPriority || 0;
    document.getElementById('totalCost').textContent = (totalCost / 1000000).toFixed(1) + 'M';
    
    // Category counts
    const catI = STATE.filteredAreals.filter(a => a.kategorie === 'I.').length;
    const catII = STATE.filteredAreals.filter(a => a.kategorie === 'II.').length;
    const catNone = STATE.filteredAreals.filter(a => !a.kategorie).length;
    
    document.getElementById('catICount').textContent = catI;
    document.getElementById('catIICount').textContent = catII;
    document.getElementById('noCatCount').textContent = catNone;
}

// =============================================
// EXPORT FUNCTIONS
// =============================================

function exportCSV() {
    const headers = ['ID', 'Název', 'Okres', 'Kategorie', 'Výměra (m²)', 'Oplocení (bm)', 'Latitude', 'Longitude', 'Priorita', 'Náklady (Kč)'];
    
    const rows = STATE.filteredAreals.map(a => [
        a.id,
        a.nazev,
        a.okres,
        a.kategorie || '',
        a.vymera,
        a.oploceni,
        a.lat,
        a.lon,
        a.priorita,
        a.naklady || 0
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    downloadFile(csv, 'jvs-arealy.csv', 'text/csv');
    showToast('CSV exportováno', 'success');
}

function exportGeoJSON() {
    const geojson = {
        type: 'FeatureCollection',
        features: STATE.filteredAreals.map(a => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [a.lon, a.lat]
            },
            properties: {
                id: a.id,
                nazev: a.nazev,
                okres: a.okres,
                kategorie: a.kategorie || '',
                vymera: a.vymera,
                oploceni: a.oploceni,
                priorita: a.priorita,
                naklady: a.naklady || 0
            }
        }))
    };
    
    downloadFile(JSON.stringify(geojson, null, 2), 'jvs-arealy.geojson', 'application/json');
    showToast('GeoJSON exportováno', 'success');
}

function exportPDF() {
    showToast('PDF export - funkce v přípravě', 'info');
    // TODO: Implement PDF export using jsPDF
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="flex-1">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// =============================================
// EVENT LISTENERS
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 JVS Enhanced v3.0 initializing...');
    
    // Initialize Firebase
    initFirebase();
    
    // Initialize map
    initMap();
    
    // Load data
    await loadData();
    
    // Load weather
    loadWeather();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
        const icon = document.querySelector('#sidebarToggle i');
        icon.className = document.getElementById('sidebar').classList.contains('collapsed') 
            ? 'fas fa-bars' 
            : 'fas fa-times';
    });
    
    // Filters
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('sortByDistance').addEventListener('click', sortByDistance);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    
    // History
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    
    // Route
    document.getElementById('optimizeRoute').addEventListener('click', optimizeRoute);
    document.getElementById('clearRoute').addEventListener('click', clearRoute);
    
    // Export
    document.getElementById('exportCSV').addEventListener('click', exportCSV);
    document.getElementById('exportGeoJSON').addEventListener('click', exportGeoJSON);
    document.getElementById('exportPDF').addEventListener('click', exportPDF);
    
    // FABs
    document.getElementById('heatmapToggle').addEventListener('click', toggleHeatmap);
    document.getElementById('geofenceToggle').addEventListener('click', toggleGeofencing);
    document.getElementById('locateMe').addEventListener('click', () => {
        if (!navigator.geolocation) {
            showToast('Geolokace není podporována', 'error');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(position => {
            STATE.map.setView([position.coords.latitude, position.coords.longitude], 13);
            showToast('Poloha nalezena', 'success');
        }, error => {
            showToast('Chyba při získávání polohy', 'error');
        });
    });
    
    // Edit form
    document.getElementById('editArealForm').addEventListener('submit', saveArealEdit);
    document.getElementById('editPriority').addEventListener('input', (e) => {
        document.getElementById('priorityValue').textContent = e.target.value;
    });
    
    // Close modal on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    console.log('✅ JVS Enhanced v3.0 ready!');
    showToast('Aplikace připravena', 'success');
});

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally accessible
window.editAreal = editAreal;
window.addToRoute = addToRoute;
window.removeFromRoute = removeFromRoute;
window.showChart = showChart;
window.closeModal = closeModal;