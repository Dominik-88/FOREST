/**
 * JVS FOREST v4.0 - Main Application
 * Secure, modular, XSS-protected
 * 
 * @version 4.0.0
 * @date 2025-12-25
 */

// =============================================
// APPLICATION STATE (Encapsulated)
// =============================================
const app = {
    // Data
    areals: [],
    filteredAreals: [],
    selectedAreal: null,
    userLocation: null,
    
    // Map
    map: null,
    markers: null,
    heatmapLayer: null,
    
    // UI State
    sidebarCollapsed: false,
    aiPanelActive: false,
    
    // Route planning
    routePoints: [],
    routeLayer: null
};

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 JVS FOREST v4.0 initializing...');
    
    try {
        // Initialize map
        initMap();
        
        // Load data
        await loadData();
        
        // Setup event listeners (NO onclick in HTML!)
        setupEventListeners();
        
        // Initial render
        render();
        
        console.log('✅ Application ready!');
        showToast('Aplikace připravena', 'success');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        showToast('Chyba při inicializaci', 'error');
    }
});

// =============================================
// MAP INITIALIZATION
// =============================================
function initMap() {
    app.map = L.map('map', {
        center: [49.0, 14.5],
        zoom: 9,
        zoomControl: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 7
    }).addTo(app.map);
    
    L.control.zoom({
        position: 'bottomright'
    }).addTo(app.map);
    
    app.markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    app.map.addLayer(app.markers);
    
    console.log('✅ Map initialized');
}

// =============================================
// DATA LOADING
// =============================================
async function loadData() {
    try {
        const response = await fetch('./data/areals-2025-updated.json');
        if (!response.ok) throw new Error('Failed to load data');
        
        app.areals = await response.json();
        app.filteredAreals = [...app.areals];
        
        console.log(`✅ Loaded ${app.areals.length} areals`);
        
    } catch (error) {
        console.error('❌ Data loading failed:', error);
        throw error;
    }
}

// =============================================
// EVENT LISTENERS (Clean, no onclick!)
// =============================================
function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    
    // AI Bot
    document.getElementById('aiBot')?.addEventListener('click', toggleAIPanel);
    document.getElementById('closeAI')?.addEventListener('click', toggleAIPanel);
    document.getElementById('sendAI')?.addEventListener('click', sendAIMessage);
    document.getElementById('aiInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage();
        }
    });
    
    // Filters
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('districtFilter')?.addEventListener('change', applyFilters);
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    
    // FAB buttons
    document.getElementById('locateMe')?.addEventListener('click', locateUser);
    document.getElementById('heatmap')?.addEventListener('click', toggleHeatmap);
    document.getElementById('addAreal')?.addEventListener('click', () => showToast('Funkce v přípravě', 'info'));
    
    // Export buttons
    document.getElementById('exportCSV')?.addEventListener('click', exportCSV);
    document.getElementById('exportReport')?.addEventListener('click', exportReport);
    
    // Modal close buttons (using data attribute)
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.dataset.modal;
            if (modalId) closeModal(modalId);
        });
    });
    
    // Mowing form
    document.getElementById('mowingForm')?.addEventListener('submit', handleMowingSubmit);
}

// =============================================
// RENDERING (XSS-SAFE!)
// =============================================
function render() {
    renderAreals();
    renderMap();
    updateStatistics();
}

function renderAreals() {
    const container = document.getElementById('arealsList');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Render each areal (XSS-SAFE!)
    app.filteredAreals.forEach(areal => {
        const item = createArealItem(areal);
        container.appendChild(item);
    });
    
    // Update count
    const countEl = document.getElementById('arealCount');
    if (countEl) {
        countEl.textContent = app.filteredAreals.length.toString();
    }
}

// XSS-SAFE: Using createElement and textContent
function createArealItem(areal) {
    const div = document.createElement('div');
    div.className = 'areal-item';
    
    // Name (XSS-SAFE: textContent)
    const nameEl = document.createElement('div');
    nameEl.className = 'areal-name';
    nameEl.textContent = areal.nazev;
    
    // Meta (XSS-SAFE: textContent)
    const metaEl = document.createElement('div');
    metaEl.className = 'areal-meta';
    metaEl.textContent = `${areal.okres} • ${areal.vymera.toLocaleString()} m²`;
    
    // Badges
    const badgesEl = document.createElement('div');
    badgesEl.className = 'areal-badges';
    
    const status = getArealStatus(areal.id);
    const statusBadge = createStatusBadge(status);
    badgesEl.appendChild(statusBadge);
    
    div.appendChild(nameEl);
    div.appendChild(metaEl);
    div.appendChild(badgesEl);
    
    // Click handler (NO onclick in HTML!)
    div.addEventListener('click', () => selectAreal(areal));
    
    return div;
}

// XSS-SAFE: Using createElement and textContent
function createStatusBadge(status) {
    const span = document.createElement('span');
    span.className = 'badge';
    
    switch (status) {
        case 'mowed':
            span.classList.add('badge-green');
            span.textContent = '✅ Posečeno';
            break;
        case 'overdue':
            span.classList.add('badge-red');
            span.textContent = '⚠️ Po termínu';
            break;
        default:
            span.classList.add('badge-yellow');
            span.textContent = '⏳ Čeká';
    }
    
    return span;
}

function renderMap() {
    if (!app.markers) return;
    
    app.markers.clearLayers();
    
    app.filteredAreals.forEach(areal => {
        const marker = createMarker(areal);
        app.markers.addLayer(marker);
    });
    
    if (app.filteredAreals.length > 0) {
        const bounds = app.markers.getBounds();
        if (bounds.isValid()) {
            app.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

function createMarker(areal) {
    const color = getMarkerColor(areal.kategorie);
    
    // XSS-SAFE: Using template literal with controlled data
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
    
    const marker = L.marker([areal.lat, areal.lon], { icon });
    
    // XSS-SAFE popup
    marker.on('click', () => {
        showArealPopup(areal);
    });
    
    return marker;
}

// XSS-SAFE: Using createElement and textContent
function showArealPopup(areal) {
    const popup = document.createElement('div');
    popup.style.padding = '12px';
    
    // Title
    const title = document.createElement('h3');
    title.style.cssText = 'font-size: 16px; font-weight: 700; margin-bottom: 8px;';
    title.textContent = areal.nazev;
    
    // Info
    const info = document.createElement('div');
    info.style.cssText = 'font-size: 13px; color: #64748b; margin-bottom: 12px;';
    
    const infoItems = [
        `Okres: ${areal.okres}`,
        `Výměra: ${areal.vymera.toLocaleString()} m²`,
        `Oplocení: ${areal.oploceni} bm`,
        `Priorita: ${areal.priorita}/100`
    ];
    
    infoItems.forEach(item => {
        const p = document.createElement('p');
        p.textContent = item;
        info.appendChild(p);
    });
    
    // Actions
    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 8px;';
    
    const mowBtn = document.createElement('button');
    mowBtn.textContent = '✅ Dokončit seč';
    mowBtn.style.cssText = 'flex: 1; padding: 8px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer;';
    mowBtn.addEventListener('click', () => openMowingModal(areal));
    
    const serviceBtn = document.createElement('button');
    serviceBtn.textContent = '📖 Servisní knížka';
    serviceBtn.style.cssText = 'flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;';
    serviceBtn.addEventListener('click', () => openServiceBook(areal));
    
    actions.appendChild(mowBtn);
    actions.appendChild(serviceBtn);
    
    popup.appendChild(title);
    popup.appendChild(info);
    popup.appendChild(actions);
    
    L.popup({
        maxWidth: 300,
        className: 'custom-popup'
    })
    .setLatLng([areal.lat, areal.lon])
    .setContent(popup)
    .openOn(app.map);
}

function updateStatistics() {
    const totalArea = app.filteredAreals.reduce((sum, a) => sum + a.vymera, 0);
    const totalFence = app.filteredAreals.reduce((sum, a) => sum + a.oploceni, 0);
    
    // Count mowed today
    const today = new Date().setHours(0, 0, 0, 0);
    let mowedToday = 0;
    
    app.filteredAreals.forEach(areal => {
        const lastMowing = localStorage.getItem(`jvs_mowing_${areal.id}`);
        if (lastMowing) {
            const mowingDate = new Date(parseInt(lastMowing));
            const mowingDay = mowingDate.setHours(0, 0, 0, 0);
            if (mowingDay === today) {
                mowedToday++;
            }
        }
    });
    
    const pending = app.filteredAreals.length - mowedToday;
    
    // Update UI (XSS-SAFE: textContent)
    const statArea = document.getElementById('statArea');
    const statFence = document.getElementById('statFence');
    const statMowed = document.getElementById('statMowed');
    const statPending = document.getElementById('statPending');
    
    if (statArea) statArea.textContent = (totalArea / 1000).toFixed(0) + 'k';
    if (statFence) statFence.textContent = (totalFence / 1000).toFixed(1) + 'k';
    if (statMowed) statMowed.textContent = mowedToday.toString();
    if (statPending) statPending.textContent = pending.toString();
}

// =============================================
// FILTERS
// =============================================
function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const district = document.getElementById('districtFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    app.filteredAreals = app.areals.filter(areal => {
        if (search && !areal.nazev.toLowerCase().includes(search)) {
            return false;
        }
        
        if (district && areal.okres !== district) {
            return false;
        }
        
        if (status) {
            const arealStatus = getArealStatus(areal.id);
            if (status !== arealStatus) {
                return false;
            }
        }
        
        return true;
    });
    
    render();
}

// =============================================
// OPERATIONS
// =============================================
function getArealStatus(arealId, frequency = 21) {
    const lastMowing = localStorage.getItem(`jvs_mowing_${arealId}`);
    
    if (!lastMowing) {
        return 'pending';
    }
    
    const daysSince = (Date.now() - parseInt(lastMowing)) / (1000 * 60 * 60 * 24);
    
    if (daysSince > frequency) {
        return 'overdue';
    }
    
    if (daysSince < frequency * 0.8) {
        return 'mowed';
    }
    
    return 'pending';
}

function openMowingModal(areal) {
    const modal = document.getElementById('mowingModal');
    const nameInput = document.getElementById('mowingArealName');
    
    if (nameInput) nameInput.value = areal.nazev;
    
    // Store areal ID for form submission
    modal.dataset.arealId = areal.id;
    
    modal?.classList.add('active');
}

function handleMowingSubmit(e) {
    e.preventDefault();
    
    const modal = document.getElementById('mowingModal');
    const arealId = parseInt(modal.dataset.arealId);
    const worker = document.getElementById('mowingWorker')?.value;
    const note = document.getElementById('mowingNote')?.value;
    
    if (!worker) {
        showToast('Vyplňte pracovníka/stroj', 'error');
        return;
    }
    
    // Save to localStorage (SCOPED!)
    localStorage.setItem(`jvs_mowing_${arealId}`, Date.now().toString());
    
    // Save to history
    const history = getServiceHistory(arealId);
    history.unshift({
        id: Date.now(),
        type: 'mowing',
        worker,
        note,
        date: new Date().toISOString()
    });
    
    // Keep only last 50 entries
    if (history.length > 50) {
        history.length = 50;
    }
    
    localStorage.setItem(`jvs_history_${arealId}`, JSON.stringify(history));
    
    closeModal('mowingModal');
    showToast('Seč dokončena', 'success');
    render();
}

function getServiceHistory(arealId) {
    const stored = localStorage.getItem(`jvs_history_${arealId}`);
    if (!stored) return [];
    
    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error parsing service history:', error);
        return [];
    }
}

function openServiceBook(areal) {
    const modal = document.getElementById('serviceModal');
    const content = document.getElementById('serviceBookContent');
    
    if (!content) return;
    
    content.innerHTML = '';
    
    const history = getServiceHistory(areal.id);
    
    if (history.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'text-align: center; color: #64748b; padding: 32px;';
        empty.textContent = 'Žádné záznamy';
        content.appendChild(empty);
    } else {
        history.forEach(entry => {
            const entryEl = createServiceEntry(entry);
            content.appendChild(entryEl);
        });
    }
    
    modal?.classList.add('active');
}

// XSS-SAFE: Using createElement and textContent
function createServiceEntry(entry) {
    const div = document.createElement('div');
    div.className = 'service-entry';
    
    const date = document.createElement('div');
    date.className = 'service-entry-date';
    date.textContent = new Date(entry.date).toLocaleString('cs-CZ');
    
    const worker = document.createElement('div');
    worker.className = 'service-entry-worker';
    worker.textContent = `Pracovník: ${entry.worker}`;
    
    div.appendChild(date);
    div.appendChild(worker);
    
    if (entry.note) {
        const note = document.createElement('div');
        note.className = 'service-entry-note';
        note.textContent = entry.note;
        div.appendChild(note);
    }
    
    return div;
}

// =============================================
// UI INTERACTIONS
// =============================================
function toggleSidebar() {
    app.sidebarCollapsed = !app.sidebarCollapsed;
    const sidebar = document.getElementById('sidebar');
    const icon = document.querySelector('#sidebarToggle i');
    
    sidebar?.classList.toggle('collapsed');
    
    if (icon) {
        icon.className = app.sidebarCollapsed ? 'fas fa-bars' : 'fas fa-times';
    }
}

function toggleAIPanel() {
    app.aiPanelActive = !app.aiPanelActive;
    const panel = document.getElementById('aiPanel');
    panel?.classList.toggle('active');
}

function selectAreal(areal) {
    app.selectedAreal = areal;
    app.map.setView([areal.lat, areal.lon], 14);
    showArealPopup(areal);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal?.classList.remove('active');
}

// =============================================
// AI ASSISTANT
// =============================================
function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input?.value.trim();
    
    if (!message) return;
    
    // Add user message (XSS-SAFE!)
    addAIMessage(message, 'user');
    
    // Clear input
    if (input) input.value = '';
    
    // Simple AI response (can be enhanced with actual AI service)
    setTimeout(() => {
        const response = getAIResponse(message);
        addAIMessage(response, 'bot');
    }, 500);
}

// XSS-SAFE: Using createElement and textContent
function addAIMessage(text, type) {
    const container = document.getElementById('aiMessages');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = `ai-message ai-message-${type}`;
    
    const p = document.createElement('p');
    p.className = 'ai-message-text';
    p.textContent = text;
    
    div.appendChild(p);
    container.appendChild(div);
    
    container.scrollTop = container.scrollHeight;
}

function getAIResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('seč') || lower.includes('posečen')) {
        const needMowing = app.areals.filter(a => getArealStatus(a.id) !== 'mowed');
        return `Nalezeno ${needMowing.length} areálů, které potřebují seč.`;
    }
    
    if (lower.includes('statistik') || lower.includes('přehled')) {
        return `Celkem ${app.areals.length} areálů, ${app.filteredAreals.length} zobrazeno.`;
    }
    
    return 'Rád vám pomohu! Zkuste se zeptat na:\n• Které areály potřebují seč?\n• Jaké jsou statistiky?';
}

// =============================================
// UTILITIES
// =============================================
function getMarkerColor(kategorie) {
    switch (kategorie) {
        case 'I.': return '#ef4444';
        case 'II.': return '#f59e0b';
        default: return '#10b981';
    }
}

function locateUser() {
    if (!navigator.geolocation) {
        showToast('Geolokace není podporována', 'error');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            app.userLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            app.map.setView([app.userLocation.lat, app.userLocation.lon], 13);
            showToast('Poloha nalezena', 'success');
        },
        (error) => {
            showToast('Chyba při získávání polohy', 'error');
        }
    );
}

function toggleHeatmap() {
    if (app.heatmapLayer) {
        app.map.removeLayer(app.heatmapLayer);
        app.heatmapLayer = null;
        showToast('Heatmapa vypnuta', 'info');
        return;
    }
    
    const heatData = app.filteredAreals.map(areal => {
        let intensity = 0.3;
        if (areal.kategorie === 'I.') intensity = 1.0;
        else if (areal.kategorie === 'II.') intensity = 0.6;
        intensity *= (areal.priorita / 100);
        return [areal.lat, areal.lon, intensity];
    });
    
    app.heatmapLayer = L.heatLayer(heatData, {
        radius: 30,
        blur: 25,
        maxZoom: 13,
        max: 1.0,
        gradient: {
            0.0: '#4ade80',
            0.5: '#fbbf24',
            1.0: '#f87171'
        }
    }).addTo(app.map);
    
    showToast('Heatmapa aktivována', 'success');
}

function exportCSV() {
    const headers = ['ID', 'Název', 'Okres', 'Výměra', 'Oplocení', 'Priorita'];
    const rows = app.filteredAreals.map(a => [
        a.id,
        a.nazev,
        a.okres,
        a.vymera,
        a.oploceni,
        a.priorita
    ]);
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    downloadFile(csv, 'jvs-arealy.csv', 'text/csv');
    showToast('CSV exportováno', 'success');
}

function exportReport() {
    showToast('Report export - funkce v přípravě', 'info');
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

// XSS-SAFE: Using createElement and textContent
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    
    const iconMap = {
        success: '<i class="fas fa-check"></i>',
        error: '<i class="fas fa-times"></i>',
        warning: '<i class="fas fa-exclamation"></i>',
        info: '<i class="fas fa-info"></i>'
    };
    
    icon.innerHTML = iconMap[type] || iconMap.info;
    
    const text = document.createElement('div');
    text.className = 'toast-text';
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}