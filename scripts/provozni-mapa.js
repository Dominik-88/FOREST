/**
 * JVS Provozní Mapa v4.0
 * Secure, Firebase-integrated, Mobile-optimized
 * 
 * @version 4.0.0
 * @date 2025-12-25
 */

// =============================================
// INITIAL DATA (41 areálů)
// =============================================
const initialAreas = [
  {id: 'vdj_amerika_ii', name:"VDJ Amerika II",district:"PI",lat:49.305131,lng:14.166126,area:3303,fence:293,cat:"I.", last_maintenance: '2025-05-15', is_maintained: false},
  {id: 'vdj_drahonice', name:"VDJ Drahonice",district:"ST",lat:49.202902,lng:14.063713,area:5953,fence:376,cat:"I.", last_maintenance: '2025-06-20', is_maintained: false},
  {id: 'vdj_vodnany', name:"VDJ Vodňany",district:"ST",lat:49.164550,lng:14.177836,area:1594,fence:252,cat:"I.", last_maintenance: '2025-06-25', is_maintained: false},
  {id: 'vdj_hlavatce', name:"VDJ Hlavatce",district:"CB",lat:49.063584,lng:14.267751,area:7968,fence:424,cat:"B", last_maintenance: '2025-04-10', is_maintained: false},
  {id: 'vdj_sibenicni_vrch_i', name:"VDJ Šibeniční vrch I",district:"PT",lat:49.025083,lng:13.994111,area:1835,fence:245,cat:"I.", last_maintenance: '2025-07-01', is_maintained: false},
  {id: 'uv_husinecka', name:"ÚV Husinecka přehrada",district:"PT",lat:49.034362,lng:13.996830,area:4908,fence:703,cat:"B", last_maintenance: '2025-05-01', is_maintained: false},
  {id: 'vdj_sibenicni_vrch_ii', name:"VDJ Šibeniční vrch II",district:"PT",lat:49.026710,lng:13.994001,area:3206,fence:340,cat:"I.", last_maintenance: '2025-06-05', is_maintained: false},
  {id: 'vdj_zaluzany', name:"VDJ Zálužany",district:"PI",lat:49.552857,lng:14.083381,area:2350,fence:299,cat:"B", last_maintenance: '2025-04-20', is_maintained: false},
  {id: 'vdj_ptacnik', name:"VDJ Ptáčník",district:"PT",lat:49.066147,lng:14.186844,area:1070,fence:239,cat:"II.", last_maintenance: '2025-07-10', is_maintained: false},
  {id: 'vdj_zdoba', name:"VDJ Zdoba",district:"CB",lat:49.212422,lng:14.338095,area:15523,fence:225,cat:"II.", last_maintenance: '2025-05-25', is_maintained: false},
  {id: 'vdj_domoradice', name:"VDJ Domoradice",district:"CK",lat:48.829651,lng:14.326564,area:4148,fence:450,cat:"I.", last_maintenance: '2025-06-01', is_maintained: false},
  {id: 'vdj_horni_brana', name:"VDJ Horní Brána",district:"CK",lat:48.807970,lng:14.329352,area:1665,fence:187,cat:"I.", last_maintenance: '2025-07-15', is_maintained: false},
  {id: 'vdj_netrebice', name:"VDJ Netřebice",district:"CK",lat:48.783277,lng:14.456447,area:877,fence:136,cat:"I.", last_maintenance: '2025-06-18', is_maintained: false},
  {id: 'vdj_plesivec', name:"VDJ Plešivec",district:"CK",lat:48.802231,lng:14.304933,area:975,fence:119,cat:"I.", last_maintenance: '2025-07-05', is_maintained: false},
  {id: 'vdj_doudleby', name:"VDJ Doudleby",district:"CB",lat:48.888896,lng:14.480271,area:413,fence:79,cat:"II.", last_maintenance: '2025-05-10', is_maintained: false},
  {id: 'vdj_jankov', name:"VDJ Jankov",district:"CB",lat:48.968747,lng:14.301697,area:784,fence:106,cat:"I.", last_maintenance: '2025-07-08', is_maintained: false},
  {id: 'vdj_hosin_ii', name:"VDJ Hosín II",district:"CB",lat:49.030641,lng:14.501012,area:4173,fence:399,cat:"I.", last_maintenance: '2025-06-12', is_maintained: false},
  {id: 'vdj_chlum', name:"VDJ Chlum",district:"CB",lat:49.096493,lng:14.388679,area:535,fence:63,cat:"II.", last_maintenance: '2025-07-03', is_maintained: false},
  {id: 'vdj_chotycany', name:"VDJ Chotýčany",district:"CB",lat:49.070748,lng:14.519460,area:4775,fence:338,cat:"II.", last_maintenance: '2025-05-22', is_maintained: false},
  {id: 'vdj_rudolfov_iii', name:"VDJ Rudolfov III",district:"CB",lat:48.986207,lng:14.547076,area:1868,fence:174,cat:"I.", last_maintenance: '2025-07-18', is_maintained: false},
  {id: 'vdj_rimov_vesce', name:"VDJ Rimov - Vesce",district:"CB",lat:48.847847,lng:14.466957,area:662,fence:99,cat:"I.", last_maintenance: '2025-06-08', is_maintained: false},
  {id: 'vdj_hosin', name:"VDJ Hosin",district:"CB",lat:49.033641,lng:14.492878,area:809,fence:125,cat:"II.", last_maintenance: '2025-05-05', is_maintained: false},
  {id: 'vdj_vcelna', name:"VDJ Včelná",district:"CB",lat:48.924663,lng:14.463506,area:8660,fence:476,cat:"II.", last_maintenance: '2025-07-20', is_maintained: false},
  {id: 'vdj_hury', name:"VDJ Húry",district:"CB",lat:49.006417,lng:14.549815,area:395,fence:0,cat:"I.", last_maintenance: '2025-06-15', is_maintained: false},
  {id: 'vdj_chlumec', name:"VDJ Chlumec",district:"CB",lat:49.124766,lng:14.431321,area:811,fence:110,cat:"II.", last_maintenance: '2025-07-12', is_maintained: false},
  {id: 'vdj_olesnik', name:"VDJ Olešník",district:"CB",lat:49.111103,lng:14.377766,area:380,fence:117,cat:"I.", last_maintenance: '2025-05-28', is_maintained: false},
  {id: 'cs_bukovec', name:"ČS Bukovec",district:"CB",lat:48.881608,lng:14.449233,area:4943,fence:300,cat:"I.", last_maintenance: '2025-06-03', is_maintained: false},
  {id: 'vdj_herman', name:"VDJ Heřman",district:"CB",lat:48.909479,lng:14.499876,area:982,fence:119,cat:"II.", last_maintenance: '2025-07-22', is_maintained: false},
  {id: 'cs_vidov', name:"ČS Vidov u řeky",district:"CB",lat:48.924157,lng:14.489619,area:2501,fence:212,cat:"II.", last_maintenance: '2025-05-18', is_maintained: false},
  {id: 'vrt_vidov', name:"Vrt Vidov",district:"CB",lat:48.924066,lng:14.489679,area:470,fence:164,cat:"II.", last_maintenance: '2025-07-25', is_maintained: false},
  {id: 'uv_plav', name:"ÚV Plav",district:"CB",lat:48.912611,lng:14.494018,area:74777,fence:1413,cat:"I.", last_maintenance: '2025-06-28', is_maintained: false},
  {id: 'vdj_cekanice', name:"VDJ Čekanice",district:"TA",lat:49.422197,lng:14.689896,area:6344,fence:450,cat:"I.", last_maintenance: '2025-05-09', is_maintained: false},
  {id: 'vdj_svata_anna', name:"VDJ Svatá Anna",district:"TA",lat:49.401133,lng:14.698640,area:4192,fence:264,cat:"I.", last_maintenance: '2025-07-06', is_maintained: false},
  {id: 'vdj_bezdecin', name:"VDJ Bezděčín",district:"TA",lat:49.323096,lng:14.628405,area:1996,fence:169,cat:"I.", last_maintenance: '2025-06-22', is_maintained: false},
  {id: 'vdj_milevsko', name:"VDJ Milevsko",district:"TA",lat:49.452521,lng:14.344102,area:823,fence:129,cat:"I.", last_maintenance: '2025-05-02', is_maintained: false},
  {id: 'vdj_hodusin', name:"VDJ Hodušín",district:"TA",lat:49.429670,lng:14.474214,area:1708,fence:205,cat:"II.", last_maintenance: '2025-07-09', is_maintained: false},
  {id: 'vdj_vsechov', name:"VDJ Všechov",district:"TA",lat:49.430159,lng:14.623205,area:1574,fence:199,cat:"I.", last_maintenance: '2025-06-16', is_maintained: false},
  {id: 'vdj_zlukov', name:"VDJ Zlukov",district:"TA",lat:49.196289,lng:14.736382,area:1520,fence:184,cat:"II.", last_maintenance: '2025-05-12', is_maintained: false},
  {id: 'uv_tabor', name:"ÚV Tábor",district:"TA",lat:49.422872,lng:14.666426,area:12262,fence:350,cat:"II.", last_maintenance: '2025-07-14', is_maintained: false},
  {id: 'cs_sudomerice', name:"ČS Sudoměřice",district:"TA",lat:49.286580,lng:14.547794,area:2508,fence:220,cat:"I.", last_maintenance: '2025-06-29', is_maintained: false},
  {id: 'vdj_provozni_tabor', name:"Provozní Vodojem Tábor",district:"TA",lat:49.424264,lng:14.666384,area:1853,fence:155,cat:"II.", last_maintenance: '2025-05-20', is_maintained: false}
];

// =============================================
// APPLICATION STATE
// =============================================
const app = {
    arealData: [],
    filteredAreas: [],
    routePoints: [],
    map: null,
    clusterGroup: null,
    heatLayer: null,
    routingControl: null,
    drawingLayer: null,
    drawControl: null,
    isDrawing: false
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

function showToast(message, type = 'primary') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast p-3 rounded-lg shadow-lg text-white font-semibold mb-2`;
    
    // XSS-SAFE: textContent instead of innerHTML
    toast.textContent = message;
    
    // Color based on type
    const colors = {
        primary: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600'
    };
    toast.classList.add(colors[type] || colors.primary);
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function calculateRiskScore(area) {
    if (area.is_maintained) return 0;
    
    const lastMaintenance = new Date(area.last_maintenance);
    const today = new Date();
    const diffTime = Math.abs(today - lastMaintenance);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const maxRiskDays = 180;
    let timeScore = Math.min(1, diffDays / maxRiskDays);

    let catWeight = 0;
    if (area.cat === 'I.') catWeight = 1.0;
    else if (area.cat === 'II.') catWeight = 0.5;
    else catWeight = 0.2;

    return (timeScore * 0.6) + (catWeight * 0.4 * (1 - timeScore));
}

function getFirestorePath(collectionName) {
    const userId = window.userId || 'guest';
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    return `artifacts/${appId}/public/data/${userId}_${collectionName}`;
}

// =============================================
// FIREBASE SYNC
// =============================================

async function syncDataFromFirestore() {
    if (!window.db || !window.isAuthReady) {
        app.arealData = JSON.parse(localStorage.getItem('jvs_areal_data')) || initialAreas;
        showToast("Načteno z lokálního úložiště (offline)", 'warning');
        applyFilters();
        return;
    }

    const colRef = window.collection(window.db, getFirestorePath('areals'));
    
    window.onSnapshot(colRef, (snapshot) => {
        const firestoreAreas = snapshot.docs.map(doc => ({
            ...doc.data(),
            docId: doc.id,
            last_maintenance: doc.data().last_maintenance ? 
                doc.data().last_maintenance.toDate().toISOString().substring(0, 10) : 
                '2025-01-01',
            is_maintained: doc.data().is_maintained || false
        }));

        if (firestoreAreas.length === 0) {
            uploadInitialData(colRef);
            return;
        }

        app.arealData = firestoreAreas;
        localStorage.setItem('jvs_areal_data', JSON.stringify(app.arealData));
        showToast(`Načteno ${app.arealData.length} areálů z Firestore.`, 'success');
        applyFilters();
    }, (error) => {
        console.error("Chyba při načítání dat z Firestore:", error);
        showToast("Chyba synchronizace s Firestore. Používám lokální data.", 'danger');
        app.arealData = JSON.parse(localStorage.getItem('jvs_areal_data')) || initialAreas;
        applyFilters();
    });
}

function uploadInitialData(colRef) {
    initialAreas.forEach(async (area) => {
        area.is_maintained = Math.random() < 0.25;
        try {
            await window.addDoc(colRef, {
                ...area,
                lat: parseFloat(area.lat),
                lng: parseFloat(area.lng),
                area: parseFloat(area.area),
                fence: parseFloat(area.fence),
                last_maintenance: new Date(area.last_maintenance) 
            });
        } catch (e) {
            console.error("Chyba při nahrávání prvotních dat:", e);
        }
    });
    showToast("Prvotní data nahrána do Firestore. Počkejte na načtení.", 'warning');
}

async function saveAreaToFirestore(area, isNew) {
    if (!window.db || !area.docId) {
        showToast("Data uložena pouze lokálně (Offline/Host).", 'warning');
        localStorage.setItem('jvs_areal_data', JSON.stringify(app.arealData));
        applyFilters();
        return;
    }

    const areaRef = window.doc(window.db, getFirestorePath('areals'), area.docId);

    try {
        const updateData = {
            name: area.name,
            district: area.district,
            cat: area.cat,
            area: parseFloat(area.area),
            fence: parseFloat(area.fence),
            lat: parseFloat(area.lat),
            lng: parseFloat(area.lng),
            is_maintained: area.is_maintained || false
        };

        await window.setDoc(areaRef, updateData, { merge: true });
        showToast(`Areál '${area.name}' úspěšně uložen.`, 'success');
    } catch (e) {
        console.error("Chyba při ukládání areálu do Firestore:", e);
        showToast("Chyba: Změny nebyly synchronizovány s Firestore.", 'danger');
    }
}

async function toggleMaintenanceStatus(docId) {
    if (!window.db || !docId) {
        showToast("Offline: Status není synchronizován.", 'warning');
        return;
    }
    
    const area = app.arealData.find(a => a.docId === docId);
    if (!area) return;

    const areaRef = window.doc(window.db, getFirestorePath('areals'), docId);
    const newStatus = !area.is_maintained;
    
    try {
        await window.updateDoc(areaRef, {
            is_maintained: newStatus,
            last_maintenance: newStatus ? window.serverTimestamp() : area.last_maintenance 
        });
        showToast(`Stav údržby pro '${area.name}' aktualizován na: ${newStatus ? 'Hotovo ✅' : 'K údržbě 🛠️'}`, 'success');
    } catch (e) {
        console.error("Chyba při změně statusu údržby:", e);
        showToast("Chyba: Nelze aktualizovat status údržby.", 'danger');
    }
}

// =============================================
// MAP INITIALIZATION
// =============================================

function initMap() {
    app.map = L.map('map', {zoomControl: false}).setView([49.2, 14.5], 9);
    
    L.control.zoom({position: 'topright'}).addTo(app.map);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 19, 
        attribution: '© OSM' 
    });
    
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
        maxZoom: 19, 
        attribution: 'Tiles © Esri' 
    });
    
    osm.addTo(app.map);
    
    app.clusterGroup = L.markerClusterGroup({ disableClusteringAtZoom: 14 });
    app.heatLayer = L.heatLayer([], {
        radius: 40, 
        blur: 25, 
        maxZoom: 13, 
        gradient: {0.0: '#10b981', 0.5: '#f59e0b', 1.0: '#ef4444'}
    });
    
    app.drawingLayer = new L.FeatureGroup();
    
    app.map.addLayer(app.clusterGroup);
    app.map.addLayer(app.drawingLayer);
    
    const baseLayers = {
        "Základní (OSM)": osm, 
        "Satelitní (Esri)": satellite
    };
    
    const overlayLayers = {
        "Riziková Heatmapa": app.heatLayer, 
        "Areály": app.clusterGroup
    };
    
    L.control.layers(baseLayers, overlayLayers, { position: 'bottomright' }).addTo(app.map);
    
    // Draw Control
    app.drawControl = new L.Control.Draw({
        position: 'topleft',
        edit: { featureGroup: app.drawingLayer },
        draw: {
            polygon: { shapeOptions: { color: '#3b82f6' } },
            polyline: { shapeOptions: { color: '#f59e0b' } },
            rectangle: false, 
            circle: false, 
            circlemarker: false,
            marker: { 
                icon: L.icon({ 
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NmMTQyYSIgZD0iTTEyIDBDNi41IDAgMiA0LjUgMiAxMGMwIDcgNSA5IDAgMTEuNUwxMiAyNGwxMC01LjVDMjIgMjEuNSAxNy41IDE3IDIyIDEwQzIyIDQuNSAxNy41IDAgMTIgMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSIjRkZGIi8+PC9zdmc+Cg==', 
                    iconSize: [25, 41], 
                    iconAnchor: [12, 41], 
                    popupAnchor: [1, -34] 
                }) 
            }
        }
    });

    app.map.on(L.Draw.Event.Created, function (e) {
        const type = e.layerType;
        const layer = e.layer;
        app.drawingLayer.addLayer(layer);

        if (type === 'marker' && app.isDrawing) {
            addNewAreaForm(layer.getLatLng());
            app.isDrawing = false;
        }

        if (type === 'polygon') {
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            showToast(`Vypočtená plocha: ${(area / 10000).toFixed(2)} ha (${area.toFixed(0)} m²)`, 'primary');
        }
        
        if (type === 'polyline') {
            const distance = L.GeometryUtil.length(layer.getLatLngs());
            showToast(`Vypočtená vzdálenost: ${(distance / 1000).toFixed(2)} km (${distance.toFixed(0)} m)`, 'primary');
        }
    });

    app.map.on(L.Draw.Event.DrawStart, function(e) {
         if (e.layerType === 'marker') { app.isDrawing = true; }
    });

    app.map.on('moveend', updateWeather);
    
    setTimeout(() => app.map.invalidateSize(), 100);
}

// =============================================
// RENDER MARKERS (XSS-SAFE!)
// =============================================

function renderMarkers() {
    app.clusterGroup.clearLayers();
    
    const onlyRemaining = document.getElementById('maintainedToggle')?.checked || false;
    const dataToRender = app.filteredAreas.filter(a => !onlyRemaining || !a.is_maintained);

    app.heatLayer.setLatLngs([]);
    let remainingArea = 0;
    let totalArea = 0;
    let totalFence = 0;

    dataToRender.forEach(a => {
        const riskScore = calculateRiskScore(a);
        
        if (riskScore > 0) {
            app.heatLayer.addLatLng([a.lat, a.lng, riskScore * 10]); 
            remainingArea += a.area;
        }
        
        totalArea += a.area;
        totalFence += a.fence;
        
        let markerColor = a.is_maintained ? '#10b981' : '#f59e0b';
        if (riskScore > 0.6) markerColor = '#ef4444';

        // XSS-SAFE POPUP CREATION
        const popupDiv = document.createElement('div');
        popupDiv.className = 'popup space-y-2 text-sm';
        
        const title = document.createElement('h3');
        title.className = 'font-bold text-lg text-primary';
        title.textContent = a.name; // XSS-SAFE!
        popupDiv.appendChild(title);
        
        const info = document.createElement('p');
        info.textContent = `Okres: ${a.district} | Kategorie: ${a.cat || 'Bez'}`;
        popupDiv.appendChild(info);
        
        const details = document.createElement('p');
        details.textContent = `Plocha: ${a.area.toLocaleString('cs-CZ')} m² | Oplocení: ${a.fence} bm`;
        popupDiv.appendChild(details);
        
        const lastMaint = document.createElement('p');
        lastMaint.className = 'text-xs opacity-70';
        lastMaint.textContent = `Poslední údržba: ${a.last_maintenance}`;
        popupDiv.appendChild(lastMaint);
        
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'flex items-center justify-between pt-2';
        
        const routeBtn = document.createElement('button');
        routeBtn.className = 'bg-primary text-white p-2 rounded text-xs hover:bg-primary/90 transition-colors';
        routeBtn.innerHTML = '<i class="fas fa-route"></i> Trasa';
        routeBtn.addEventListener('click', () => addToRoute(a.docId));
        buttonDiv.appendChild(routeBtn);
        
        const statusBtn = document.createElement('button');
        statusBtn.className = `text-sm px-2 py-1 rounded-full ${a.is_maintained ? 'bg-success/50 text-success' : 'bg-danger/50 text-danger'}`;
        statusBtn.innerHTML = `<i class="fas ${a.is_maintained ? 'fa-check-circle' : 'fa-tools'}"></i> ${a.is_maintained ? 'Hotovo' : 'K údržbě'}`;
        statusBtn.addEventListener('click', () => toggleMaintenanceStatus(a.docId));
        buttonDiv.appendChild(statusBtn);
        
        popupDiv.appendChild(buttonDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'grid grid-cols-2 gap-2 mt-3';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-500';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Upravit';
        editBtn.addEventListener('click', () => editArea(a.docId));
        actionsDiv.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'bg-danger text-white py-1 rounded text-sm hover:bg-danger/90';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Smazat';
        deleteBtn.addEventListener('click', () => deleteArea(a.docId, a.name));
        actionsDiv.appendChild(deleteBtn);
        
        const mapsLink = document.createElement('a');
        mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}`;
        mapsLink.target = '_blank';
        mapsLink.className = 'text-center text-blue-400 text-sm col-span-2 mt-1';
        mapsLink.textContent = 'Otevřít v Google Maps';
        actionsDiv.appendChild(mapsLink);
        
        popupDiv.appendChild(actionsDiv);

        const marker = L.circleMarker([a.lat, a.lng], {
            radius: 8, 
            color: markerColor, 
            fillOpacity: 0.9,
            weight: 1
        }).bindPopup(popupDiv);
        
        marker.areaData = a;
        app.clusterGroup.addLayer(marker);
    });
    
    // Update statistics (XSS-SAFE with textContent)
    const totalAreaEl = document.getElementById('totalArea');
    if (totalAreaEl) {
        totalAreaEl.textContent = app.arealData.reduce((sum, a) => sum + a.area, 0).toLocaleString('cs-CZ');
    }
    
    const remainingAreaEl = document.getElementById('remainingArea');
    if (remainingAreaEl) {
        remainingAreaEl.textContent = app.arealData.filter(a => !a.is_maintained).reduce((sum, a) => sum + a.area, 0).toLocaleString('cs-CZ');
    }
    
    const totalFenceEl = document.getElementById('totalFence');
    if (totalFenceEl) {
        totalFenceEl.textContent = app.arealData.reduce((sum, a) => sum + a.fence, 0).toLocaleString('cs-CZ');
    }
    
    const objectCountEl = document.getElementById('objectCount');
    if (objectCountEl) {
        objectCountEl.textContent = dataToRender.length;
    }
}

// =============================================
// FILTERS
// =============================================

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const districtFilter = document.getElementById('districtFilter');
    const maintainedToggle = document.getElementById('maintainedToggle');
    
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const district = districtFilter ? districtFilter.value : '';
    const onlyRemaining = maintainedToggle ? maintainedToggle.checked : false;

    app.filteredAreas = app.arealData.filter(a => 
        a.name.toLowerCase().includes(search) &&
        (!district || a.district === district)
    );

    renderMarkers();
}

// =============================================
// ROUTING
// =============================================

function addToRoute(docId) {
    const area = app.arealData.find(a => a.docId === docId);
    if (!area) return;
    
    if (!app.routePoints.some(p => p.docId === docId)) {
        app.routePoints.push(area);
        localStorage.setItem('jvs_route_points', JSON.stringify(app.routePoints));
        showToast(`Přidáno: ${area.name} do trasy.`, 'primary');
    }
    
    updateRoute();
}

function updateRoute() {
    if (app.routingControl) app.map.removeControl(app.routingControl);
    
    const waypoints = app.routePoints.map(p => L.latLng(p.lat, p.lng));
    const routeListEl = document.getElementById('routeList');
    const routeStatusEl = document.getElementById('routeStatus');
    
    if (routeListEl) routeListEl.innerHTML = '';

    if (waypoints.length < 2) {
        if (routeStatusEl) {
            routeStatusEl.textContent = 'Trasa není aktivní. Přidejte alespoň 2 areály.';
        }
        return;
    }
    
    // XSS-SAFE route list
    app.routePoints.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'bg-slate-700 p-2 rounded-lg flex items-center justify-between text-sm';
        
        const span = document.createElement('span');
        span.textContent = `${index + 1}. ${p.name}`; // XSS-SAFE!
        item.appendChild(span);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-danger ml-2';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => removeFromRoute(p.docId));
        item.appendChild(removeBtn);
        
        if (routeListEl) routeListEl.appendChild(item);
    });
    
    app.routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        show: false,
        lineOptions: {styles: [{color: '#3b82f6', weight: 6, opacity: 0.7}]},
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        autoRoute: true 
    }).on('routesfound', function(e) {
        const route = e.routes[0];
        const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
        const timeHours = (route.summary.totalTime / 3600).toFixed(1);
        
        if (routeStatusEl) {
            // XSS-SAFE with createElement
            routeStatusEl.innerHTML = '';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-check-circle text-success';
            routeStatusEl.appendChild(icon);
            
            const text = document.createTextNode(' Trasa nalezena! ');
            routeStatusEl.appendChild(text);
            
            const br1 = document.createElement('br');
            routeStatusEl.appendChild(br1);
            
            const distText = document.createTextNode(`Vzdálenost: ${distanceKm} km `);
            routeStatusEl.appendChild(distText);
            
            const br2 = document.createElement('br');
            routeStatusEl.appendChild(br2);
            
            const timeText = document.createTextNode(`Čas (jízda): ${timeHours} hodiny`);
            routeStatusEl.appendChild(timeText);
        }
        
        app.routePoints = route.waypoints.map(wp => {
            const original = app.routePoints.find(a => a.lat === wp.latLng.lat && a.lng === wp.latLng.lng);
            return original || { lat: wp.latLng.lat, lng: wp.latLng.lng, name: wp.name };
        });
        localStorage.setItem('jvs_route_points', JSON.stringify(app.routePoints));
        
    }).on('routingerror', function() {
        if (routeStatusEl) {
            routeStatusEl.textContent = 'Chyba při výpočtu trasy. Zkuste to znovu.';
        }
    }).addTo(app.map);
}

function removeFromRoute(docId) {
    app.routePoints = app.routePoints.filter(p => p.docId !== docId);
    localStorage.setItem('jvs_route_points', JSON.stringify(app.routePoints));
    showToast('Areál odstraněn z trasy.', 'warning');
    updateRoute();
}

function resetRoute() {
    app.routePoints = [];
    localStorage.removeItem('jvs_route_points');
    if (app.routingControl) app.map.removeControl(app.routingControl);
    
    const routeStatusEl = document.getElementById('routeStatus');
    if (routeStatusEl) {
        routeStatusEl.textContent = 'Trasa není aktivní. Přidejte alespoň 2 areály.';
    }
    
    showToast('Trasa byla resetována.', 'warning');
    updateRoute();
}

// =============================================
// MODALS (XSS-SAFE!)
// =============================================

function addNewAreaInit() {
    if (!app.map.hasControl(app.drawControl)) {
        app.map.addControl(app.drawControl);
    }
    
    const markerButton = document.querySelector('.leaflet-draw-draw-marker');
    if (markerButton) {
        markerButton.click();
        showToast("Klikněte na mapu pro umístění nového areálu.", 'primary');
    }
}

function addNewAreaForm(latLng) {
    if (app.map.hasControl(app.drawControl)) app.map.removeControl(app.drawControl);
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Přidat nový areál'; // XSS-SAFE!
    }
    
    const form = document.getElementById('areaForm');
    if (form) form.reset();
    
    const areaIndex = document.getElementById('areaIndex');
    if (areaIndex) areaIndex.value = '';
    
    const areaLat = document.getElementById('areaLat');
    if (areaLat) areaLat.value = latLng.lat;
    
    const areaLng = document.getElementById('areaLng');
    if (areaLng) areaLng.value = latLng.lng;

    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('hidden');
}

function editArea(docId) {
    const area = app.arealData.find(a => a.docId === docId);
    if (!area) return;

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = `Upravit: ${area.name}`; // XSS-SAFE!
    }
    
    const areaIndex = document.getElementById('areaIndex');
    if (areaIndex) areaIndex.value = docId;
    
    const areaName = document.getElementById('areaName');
    if (areaName) areaName.value = area.name;
    
    const areaDistrict = document.getElementById('areaDistrict');
    if (areaDistrict) areaDistrict.value = area.district;
    
    const areaCategory = document.getElementById('areaCategory');
    if (areaCategory) areaCategory.value = area.cat || '';
    
    const areaArea = document.getElementById('areaArea');
    if (areaArea) areaArea.value = area.area;
    
    const areaFence = document.getElementById('areaFence');
    if (areaFence) areaFence.value = area.fence;
    
    const areaLat = document.getElementById('areaLat');
    if (areaLat) areaLat.value = area.lat;
    
    const areaLng = document.getElementById('areaLng');
    if (areaLng) areaLng.value = area.lng;
    
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('hidden');
}

function deleteArea(docId, name) {
    const doDelete = confirm(`Opravdu chcete smazat areál '${name}'? Tato akce je nevratná.`);
    
    if (doDelete) {
        const index = app.arealData.findIndex(a => a.docId === docId);
        if (index > -1) {
            app.arealData.splice(index, 1);
            deleteAreaFromFirestore(docId, name);
        }
    }
}

async function deleteAreaFromFirestore(docId, name) {
    if (!window.db || !docId) {
        showToast("Smazáno pouze lokálně. Offline mód.", 'warning');
        localStorage.setItem('jvs_areal_data', JSON.stringify(app.arealData));
        applyFilters();
        return;
    }
    
    const areaRef = window.doc(window.db, getFirestorePath('areals'), docId);
    try {
        await window.deleteDoc(areaRef);
        showToast(`Areál '${name}' smazán.`, 'danger');
    } catch (e) {
        console.error("Chyba při mazání areálu:", e);
        showToast("Chyba: Areál nebyl smazán z Firestore.", 'danger');
    }
}

function hideModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
}

// =============================================
// WEATHER
// =============================================

async function updateWeather() {
    const center = app.map.getCenter();
    const weatherContent = document.getElementById('weatherContent');
    if (!weatherContent) return;
    
    weatherContent.innerHTML = '<div class="spinner"></div>';
    
    try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lng}&current=temperature_2m,precipitation,wind_speed_10m,cloud_cover,is_day&hourly=pm10,pm2_5&forecast_days=1`);
        const d = await r.json();
        const c = d.current;
        const h = d.hourly;
        
        const nowHourIndex = new Date().getHours();
        const pm10 = h.pm10[nowHourIndex];
        const pm25 = h.pm2_5[nowHourIndex];
        
        // XSS-SAFE weather display
        weatherContent.innerHTML = '';
        
        const temp = document.createElement('div');
        temp.className = 'text-3xl font-bold mb-1';
        temp.textContent = `${c.temperature_2m} °C`;
        weatherContent.appendChild(temp);
        
        const details = document.createElement('div');
        details.className = 'flex justify-center gap-4 text-sm';
        details.innerHTML = `
            <span class="opacity-80"><i class="fas fa-umbrella"></i> ${c.precipitation} mm</span>
            <span class="opacity-80"><i class="fas fa-wind"></i> ${c.wind_speed_10m} km/h</span>
            <span class="opacity-80"><i class="fas fa-cloud"></i> ${c.cloud_cover}%</span>
        `;
        weatherContent.appendChild(details);
        
        const quality = document.createElement('div');
        quality.className = 'mt-2 text-xs';
        quality.innerHTML = `Kvalita vzduchu (PM): <span class="font-semibold">${pm10} µg/m³ PM10 / ${pm25} µg/m³ PM2.5</span>`;
        weatherContent.appendChild(quality);
        
    } catch(e) {
        console.error("Chyba při načítání počasí:", e);
        weatherContent.textContent = 'Počasí nedostupné';
    }
}

// =============================================
// PANEL TOGGLE
// =============================================

function togglePanel() {
    const panel = document.getElementById('panel');
    const icon = document.getElementById('panelHandleIcon');
    if (!panel || !icon) return;
    
    const isOpen = panel.style.transform === 'translateY(0px)';
    
    if (isOpen) {
        panel.style.transform = 'translateY(calc(100% - 70px))';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        panel.style.transform = 'translateY(0px)';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
    
    setTimeout(() => app.map.invalidateSize(), 350);
}

// =============================================
// EVENT LISTENERS (NO INLINE ONCLICK!)
// =============================================

function setupEventListeners() {
    // Search and filters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    const districtFilter = document.getElementById('districtFilter');
    if (districtFilter) {
        districtFilter.addEventListener('change', applyFilters);
    }
    
    const maintainedToggle = document.getElementById('maintainedToggle');
    if (maintainedToggle) {
        maintainedToggle.addEventListener('change', applyFilters);
    }
    
    const heatmapToggle = document.getElementById('heatmapToggle');
    if (heatmapToggle) {
        heatmapToggle.addEventListener('change', () => {
            if (heatmapToggle.checked) {
                app.map.addLayer(app.heatLayer);
            } else {
                app.map.removeLayer(app.heatLayer);
            }
        });
    }
    
    // Buttons
    const locateBtn = document.getElementById('locateBtn');
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(p => {
                app.map.setView([p.coords.latitude, p.coords.longitude], 15);
                showToast('Vaše poloha nalezena.', 'primary');
            }, () => showToast('Geolokace selhala: Zkontrolujte oprávnění.', 'danger'));
        });
    }
    
    const togglePanelBtn = document.getElementById('togglePanelBtn');
    if (togglePanelBtn) {
        togglePanelBtn.addEventListener('click', togglePanel);
    }
    
    const panelHandle = document.getElementById('panelHandle');
    if (panelHandle) {
        panelHandle.addEventListener('click', togglePanel);
    }
    
    const resetRouteBtn = document.getElementById('resetRouteBtn');
    if (resetRouteBtn) {
        resetRouteBtn.addEventListener('click', resetRoute);
    }
    
    const addNewAreaBtn = document.getElementById('addNewAreaBtn');
    if (addNewAreaBtn) {
        addNewAreaBtn.addEventListener('click', addNewAreaInit);
    }
    
    const resetAllDataBtn = document.getElementById('resetAllDataBtn');
    if (resetAllDataBtn) {
        resetAllDataBtn.addEventListener('click', () => {
            const doReset = confirm("Tato akce vymaže veškerá data (areály, trasu) lokálně! OPRAVDU CHCETE POKRAČOVAT?");
            if (doReset) {
                localStorage.clear();
                showToast("Lokální data vymazána. Pro globální reset restartujte aplikaci.", 'danger');
                window.location.reload(); 
            }
        });
    }
    
    // Modal
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', hideModal);
    }
    
    const areaForm = document.getElementById('areaForm');
    if (areaForm) {
        areaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideModal();
            
            const docId = document.getElementById('areaIndex')?.value;
            const name = document.getElementById('areaName')?.value;
            const district = document.getElementById('areaDistrict')?.value;
            const cat = document.getElementById('areaCategory')?.value.toUpperCase();
            const area = parseFloat(document.getElementById('areaArea')?.value);
            const fence = parseFloat(document.getElementById('areaFence')?.value);
            const lat = parseFloat(document.getElementById('areaLat')?.value);
            const lng = parseFloat(document.getElementById('areaLng')?.value);

            const isNew = !docId;
            let newArea = { 
                name, 
                district, 
                cat, 
                area, 
                fence, 
                lat, 
                lng, 
                is_maintained: false, 
                last_maintenance: new Date().toISOString().substring(0, 10) 
            };

            if (isNew) {
                if (window.db) {
                    const colRef = window.collection(window.db, getFirestorePath('areals'));
                    const docRef = await window.addDoc(colRef, { 
                        ...newArea, 
                        last_maintenance: new Date(newArea.last_maintenance) 
                    });
                    newArea.docId = docRef.id;
                } else {
                    newArea.docId = crypto.randomUUID();
                    app.arealData.push(newArea);
                }
            } else {
                const index = app.arealData.findIndex(a => a.docId === docId);
                if (index > -1) {
                    const existingArea = app.arealData[index];
                    existingArea.name = name;
                    existingArea.district = district;
                    existingArea.cat = cat;
                    existingArea.area = area;
                    existingArea.fence = fence;
                    existingArea.lat = lat;
                    existingArea.lng = lng;
                    newArea = existingArea;
                }
            }

            await saveAreaToFirestore(newArea, isNew);
        });
    }
}

// =============================================
// INITIALIZATION
// =============================================

window.initApp = () => {
    if (!app.map) {
        initMap();
        app.map.fitBounds(initialAreas.map(a => [a.lat, a.lng]));
        app.map.setMinZoom(8);
        app.map.setMaxZoom(19);
    }
    
    // Populate district filter
    const districts = [...new Set(initialAreas.map(a => a.district))].sort();
    const districtSelect = document.getElementById('districtFilter');
    if (districtSelect && districtSelect.options.length === 1) {
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d; // XSS-SAFE!
            districtSelect.appendChild(opt);
        });
    }

    // Load route from localStorage
    app.routePoints = JSON.parse(localStorage.getItem('jvs_route_points')) || [];
    
    // Setup event listeners
    setupEventListeners();
    
    // Sync data
    syncDataFromFirestore();
    
    // Update route
    updateRoute();

    // Fix map size
    setTimeout(() => {
        app.map.invalidateSize();
        if (window.innerWidth < 768) {
            togglePanel();
        }
    }, 500);
    
    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrován'))
            .catch(error => console.warn('Service Worker selhal:', error));
    }
    
    // Periodic weather updates
    setInterval(updateWeather, 600000);
};

// Start app when auth is ready
if (window.isAuthReady) {
    window.initApp();
}

// iOS fixes
window.addEventListener('orientationchange', () => setTimeout(() => app.map.invalidateSize(), 500));
window.addEventListener('resize', () => setTimeout(() => app.map.invalidateSize(), 500));