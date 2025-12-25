/**
 * JVS Provozní Mapa v6.0
 * Clean, Simple, 100% Functional
 */

console.log('🚀 JVS Provozní Mapa v6.0 starting...');

// =============================================
// DATA - 41 AREÁLŮ
// =============================================
const areas = [
  {id:1,name:"VDJ Amerika II",district:"PI",lat:49.305131,lng:14.166126,area:3303,fence:293,cat:"I.",is_maintained:false},
  {id:2,name:"VDJ Drahonice",district:"ST",lat:49.202902,lng:14.063713,area:5953,fence:376,cat:"I.",is_maintained:false},
  {id:3,name:"VDJ Vodňany",district:"ST",lat:49.164550,lng:14.177836,area:1594,fence:252,cat:"I.",is_maintained:false},
  {id:4,name:"VDJ Hlavatce",district:"CB",lat:49.063584,lng:14.267751,area:7968,fence:424,cat:"B",is_maintained:false},
  {id:5,name:"VDJ Šibeniční vrch I",district:"PT",lat:49.025083,lng:13.994111,area:1835,fence:245,cat:"I.",is_maintained:false},
  {id:6,name:"ÚV Husinecka přehrada",district:"PT",lat:49.034362,lng:13.996830,area:4908,fence:703,cat:"B",is_maintained:false},
  {id:7,name:"VDJ Šibeniční vrch II",district:"PT",lat:49.026710,lng:13.994001,area:3206,fence:340,cat:"I.",is_maintained:false},
  {id:8,name:"VDJ Zálužany",district:"PI",lat:49.552857,lng:14.083381,area:2350,fence:299,cat:"B",is_maintained:false},
  {id:9,name:"VDJ Ptáčník",district:"PT",lat:49.066147,lng:14.186844,area:1070,fence:239,cat:"II.",is_maintained:false},
  {id:10,name:"VDJ Zdoba",district:"CB",lat:49.212422,lng:14.338095,area:15523,fence:225,cat:"II.",is_maintained:false},
  {id:11,name:"VDJ Domoradice",district:"CK",lat:48.829651,lng:14.326564,area:4148,fence:450,cat:"I.",is_maintained:false},
  {id:12,name:"VDJ Horní Brána",district:"CK",lat:48.807970,lng:14.329352,area:1665,fence:187,cat:"I.",is_maintained:false},
  {id:13,name:"VDJ Netřebice",district:"CK",lat:48.783277,lng:14.456447,area:877,fence:136,cat:"I.",is_maintained:false},
  {id:14,name:"VDJ Plešivec",district:"CK",lat:48.802231,lng:14.304933,area:975,fence:119,cat:"I.",is_maintained:false},
  {id:15,name:"VDJ Doudleby",district:"CB",lat:48.888896,lng:14.480271,area:413,fence:79,cat:"II.",is_maintained:false},
  {id:16,name:"VDJ Jankov",district:"CB",lat:48.968747,lng:14.301697,area:784,fence:106,cat:"I.",is_maintained:false},
  {id:17,name:"VDJ Hosín II",district:"CB",lat:49.030641,lng:14.501012,area:4173,fence:399,cat:"I.",is_maintained:false},
  {id:18,name:"VDJ Chlum",district:"CB",lat:49.096493,lng:14.388679,area:535,fence:63,cat:"II.",is_maintained:false},
  {id:19,name:"VDJ Chotýčany",district:"CB",lat:49.070748,lng:14.519460,area:4775,fence:338,cat:"II.",is_maintained:false},
  {id:20,name:"VDJ Rudolfov III",district:"CB",lat:48.986207,lng:14.547076,area:1868,fence:174,cat:"I.",is_maintained:false},
  {id:21,name:"VDJ Rimov - Vesce",district:"CB",lat:48.847847,lng:14.466957,area:662,fence:99,cat:"I.",is_maintained:false},
  {id:22,name:"VDJ Hosin",district:"CB",lat:49.033641,lng:14.492878,area:809,fence:125,cat:"II.",is_maintained:false},
  {id:23,name:"VDJ Včelná",district:"CB",lat:48.924663,lng:14.463506,area:8660,fence:476,cat:"II.",is_maintained:false},
  {id:24,name:"VDJ Húry",district:"CB",lat:49.006417,lng:14.549815,area:395,fence:0,cat:"I.",is_maintained:false},
  {id:25,name:"VDJ Chlumec",district:"CB",lat:49.124766,lng:14.431321,area:811,fence:110,cat:"II.",is_maintained:false},
  {id:26,name:"VDJ Olešník",district:"CB",lat:49.111103,lng:14.377766,area:380,fence:117,cat:"I.",is_maintained:false},
  {id:27,name:"ČS Bukovec",district:"CB",lat:48.881608,lng:14.449233,area:4943,fence:300,cat:"I.",is_maintained:false},
  {id:28,name:"VDJ Heřman",district:"CB",lat:48.909479,lng:14.499876,area:982,fence:119,cat:"II.",is_maintained:false},
  {id:29,name:"ČS Vidov u řeky",district:"CB",lat:48.924157,lng:14.489619,area:2501,fence:212,cat:"II.",is_maintained:false},
  {id:30,name:"Vrt Vidov",district:"CB",lat:48.924066,lng:14.489679,area:470,fence:164,cat:"II.",is_maintained:false},
  {id:31,name:"ÚV Plav",district:"CB",lat:48.912611,lng:14.494018,area:74777,fence:1413,cat:"I.",is_maintained:false},
  {id:32,name:"VDJ Čekanice",district:"TA",lat:49.422197,lng:14.689896,area:6344,fence:450,cat:"I.",is_maintained:false},
  {id:33,name:"VDJ Svatá Anna",district:"TA",lat:49.401133,lng:14.698640,area:4192,fence:264,cat:"I.",is_maintained:false},
  {id:34,name:"VDJ Bezděčín",district:"TA",lat:49.323096,lng:14.628405,area:1996,fence:169,cat:"I.",is_maintained:false},
  {id:35,name:"VDJ Milevsko",district:"TA",lat:49.452521,lng:14.344102,area:823,fence:129,cat:"I.",is_maintained:false},
  {id:36,name:"VDJ Hodušín",district:"TA",lat:49.429670,lng:14.474214,area:1708,fence:205,cat:"II.",is_maintained:false},
  {id:37,name:"VDJ Všechov",district:"TA",lat:49.430159,lng:14.623205,area:1574,fence:199,cat:"I.",is_maintained:false},
  {id:38,name:"VDJ Zlukov",district:"TA",lat:49.196289,lng:14.736382,area:1520,fence:184,cat:"II.",is_maintained:false},
  {id:39,name:"ÚV Tábor",district:"TA",lat:49.422872,lng:14.666426,area:12262,fence:350,cat:"II.",is_maintained:false},
  {id:40,name:"ČS Sudoměřice",district:"TA",lat:49.286580,lng:14.547794,area:2508,fence:220,cat:"I.",is_maintained:false},
  {id:41,name:"Provozní Vodojem Tábor",district:"TA",lat:49.424264,lng:14.666384,area:1853,fence:155,cat:"II.",is_maintained:false}
];

// =============================================
// STATE
// =============================================
let map = null;
let clusterGroup = null;
let filteredAreas = [...areas];

// =============================================
// UTILITY FUNCTIONS
// =============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function updateStats() {
    const total = filteredAreas.length;
    const remaining = filteredAreas.filter(a => !a.is_maintained).length;
    const totalArea = filteredAreas.reduce((sum, a) => sum + a.area, 0);
    const totalFence = filteredAreas.reduce((sum, a) => sum + a.fence, 0);
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('remainingCount').textContent = remaining;
    document.getElementById('totalArea').textContent = totalArea.toLocaleString('cs-CZ');
    document.getElementById('totalFence').textContent = totalFence.toLocaleString('cs-CZ');
}

// =============================================
// MAP FUNCTIONS
// =============================================

function initMap() {
    console.log('📍 Initializing map...');
    
    map = L.map('map').setView([49.15, 14.15], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    
    clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true
    });
    
    map.addLayer(clusterGroup);
    
    console.log('✅ Map initialized');
    renderMarkers();
}

function renderMarkers() {
    console.log(`📌 Rendering ${filteredAreas.length} markers...`);
    
    clusterGroup.clearLayers();
    
    filteredAreas.forEach(area => {
        const color = area.is_maintained ? '#10b981' : '#f59e0b';
        
        const marker = L.circleMarker([area.lat, area.lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'popup-content';
        
        const title = document.createElement('div');
        title.className = 'popup-title';
        title.textContent = area.name;
        popup.appendChild(title);
        
        const info = document.createElement('div');
        info.className = 'popup-info';
        info.innerHTML = `
            <div><strong>Okres:</strong> ${area.district}</div>
            <div><strong>Kategorie:</strong> ${area.cat}</div>
            <div><strong>Plocha:</strong> ${area.area.toLocaleString('cs-CZ')} m²</div>
            <div><strong>Oplocení:</strong> ${area.fence} bm</div>
        `;
        popup.appendChild(info);
        
        const btn = document.createElement('button');
        btn.className = `popup-btn ${area.is_maintained ? 'maintained' : 'not-maintained'}`;
        btn.textContent = area.is_maintained ? '✓ Hotovo' : '⚠ K údržbě';
        btn.onclick = () => toggleMaintenance(area.id);
        popup.appendChild(btn);
        
        marker.bindPopup(popup);
        clusterGroup.addLayer(marker);
    });
    
    console.log(`✅ Rendered ${filteredAreas.length} markers`);
    updateStats();
}

function toggleMaintenance(areaId) {
    const area = areas.find(a => a.id === areaId);
    if (area) {
        area.is_maintained = !area.is_maintained;
        applyFilters();
        showToast(
            `${area.name}: ${area.is_maintained ? 'Hotovo' : 'K údržbě'}`,
            area.is_maintained ? 'success' : 'warning'
        );
    }
}

// =============================================
// FILTERS
// =============================================

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const district = document.getElementById('districtFilter').value;
    const onlyRemaining = document.getElementById('maintainedToggle').checked;
    
    console.log(`🔍 Filters: search="${search}", district="${district}", onlyRemaining=${onlyRemaining}`);
    
    filteredAreas = areas.filter(area => {
        const matchesSearch = area.name.toLowerCase().includes(search);
        const matchesDistrict = !district || area.district === district;
        const matchesMaintenance = !onlyRemaining || !area.is_maintained;
        return matchesSearch && matchesDistrict && matchesMaintenance;
    });
    
    console.log(`✅ Filtered: ${filteredAreas.length}/${areas.length}`);
    renderMarkers();
}

// =============================================
// WEATHER
// =============================================

async function updateWeather() {
    if (!map) return;
    
    const center = map.getCenter();
    const weatherContent = document.getElementById('weatherContent');
    
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lng}&current=temperature_2m,precipitation,wind_speed_10m`
        );
        const data = await response.json();
        const current = data.current;
        
        weatherContent.innerHTML = `
            <div class="weather-temp">${current.temperature_2m}°C</div>
            <div class="weather-details">
                <div>☔ Srážky: ${current.precipitation} mm</div>
                <div>💨 Vítr: ${current.wind_speed_10m} km/h</div>
            </div>
        `;
    } catch (error) {
        console.error('Weather error:', error);
        weatherContent.innerHTML = '<div>Počasí nedostupné</div>';
    }
}

// =============================================
// EVENT LISTENERS
// =============================================

function setupEventListeners() {
    console.log('🎧 Setting up event listeners...');
    
    // Search
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // District filter
    document.getElementById('districtFilter').addEventListener('change', applyFilters);
    
    // Maintenance toggle
    document.getElementById('maintainedToggle').addEventListener('change', applyFilters);
    
    // Locate button
    document.getElementById('locateBtn').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    map.setView([pos.coords.latitude, pos.coords.longitude], 13);
                    showToast('Vaše poloha nalezena', 'success');
                },
                () => showToast('Geolokace selhala', 'danger')
            );
        }
    });
    
    // Panel toggle
    const panel = document.getElementById('panel');
    const panelHandle = document.getElementById('panelHandle');
    const toggleBtn = document.getElementById('togglePanelBtn');
    
    function togglePanel() {
        panel.classList.toggle('open');
    }
    
    panelHandle.addEventListener('click', togglePanel);
    toggleBtn.addEventListener('click', togglePanel);
    
    // Weather update on map move
    map.on('moveend', updateWeather);
    
    console.log('✅ Event listeners set up');
}

// =============================================
// INITIALIZATION
// =============================================

function populateDistricts() {
    const select = document.getElementById('districtFilter');
    const districts = [...new Set(areas.map(a => a.district))].sort();
    
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        select.appendChild(option);
    });
    
    console.log(`✅ Populated ${districts.length} districts`);
}

function init() {
    console.log('🎯 Initializing app...');
    
    try {
        initMap();
        populateDistricts();
        setupEventListeners();
        updateWeather();
        
        showToast('Aplikace načtena - 41 areálů', 'success');
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showToast('Chyba při načítání', 'danger');
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('✅ JVS Provozní Mapa v6.0 loaded');