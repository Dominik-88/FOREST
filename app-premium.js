/**
 * JVS Management Premium App
 * Complete UI/UX with XRot 95 EVO PRO Integration
 */

import { AREALS_DATA, DATASET_STATS, CATEGORY_COLORS, DISTRICT_CODES } from './data/areals-complete.js';

class JVSPremiumApp {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        this.heatmapLayer = null;
        this.measureControl = null;
        this.filteredData = [...AREALS_DATA];
        this.selectedAreals = [];
        this.darkMode = false;
        
        this.init();
    }

    async init() {
        console.log('[JVS Premium] Initializing...');
        
        // Initialize map
        this.initializeMap();
        
        // Load data
        this.loadMarkers();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Update statistics
        this.updateStatistics();
        
        // Check for dark mode preference
        this.checkDarkMode();
        
        console.log('[JVS Premium] Initialized successfully');
    }

    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('map', {
            zoomControl: false
        }).setView([49.0, 14.4], 9);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add zoom control to top right
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });

        this.map.addLayer(this.markerClusterGroup);

        console.log('[Map] Initialized');
    }

    createCustomIcon(category) {
        const colors = {
            'I.': '#dc3545',
            'II.': '#fd7e14',
            'null': '#007bff'
        };

        const color = colors[category] || colors['null'];

        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="custom-marker marker-cat-${category === 'I.' ? '1' : category === 'II.' ? '2' : 'none'}" 
                     style="background: ${color};">
                    <i class="fas fa-water"></i>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    }

    createPopupContent(areal) {
        const categoryClass = areal.category === 'I.' ? 'cat-1' : 
                             areal.category === 'II.' ? 'cat-2' : 'cat-none';
        
        const categoryText = areal.category || 'Bez kategorie';
        
        return `
            <div class="custom-popup">
                <div class="popup-header">
                    <div>
                        <div class="popup-title">${areal.name}</div>
                        <div class="popup-subtitle">${areal.district_name || DISTRICT_CODES[areal.district]}</div>
                    </div>
                    <span class="category-badge ${categoryClass}">${categoryText}</span>
                </div>

                <div class="popup-info">
                    <div class="info-item">
                        <span class="info-label">Výměra</span>
                        <span class="info-value">${areal.area_sqm.toLocaleString()} m²</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Oplocení</span>
                        <span class="info-value">${areal.fence_length_m.toLocaleString()} m</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Typ</span>
                        <span class="info-value">${areal.type}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Okres</span>
                        <span class="info-value">${areal.district}</span>
                    </div>
                </div>

                <div class="popup-actions">
                    <div class="action-btn" onclick="app.navigateTo('${areal.lat}', '${areal.lng}', 'google')">
                        <i class="fab fa-google"></i>
                        Google Maps
                    </div>
                    <div class="action-btn" onclick="app.navigateTo('${areal.lat}', '${areal.lng}', 'mapy')">
                        <i class="fas fa-map"></i>
                        Mapy.cz
                    </div>
                    <div class="action-btn" onclick="app.navigateTo('${areal.lat}', '${areal.lng}', 'waze')">
                        <i class="fab fa-waze"></i>
                        Waze
                    </div>
                </div>

                <div class="popup-status">
                    <input type="checkbox" class="status-checkbox" id="status-${areal.id}" 
                           ${areal.is_completed ? 'checked' : ''} 
                           onchange="app.toggleCompletion('${areal.id}')">
                    <label for="status-${areal.id}" class="status-text">
                        ${areal.is_completed ? '✅ Dokončeno' : '⏳ Nedokončeno'}
                    </label>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="app.editAreal('${areal.id}')" style="width: 100%;">
                        <i class="fas fa-edit"></i>
                        Upravit
                    </button>
                    <button class="btn btn-primary" onclick="app.addToRoute('${areal.id}')" style="width: 100%;">
                        <i class="fas fa-plus"></i>
                        Do Trasy
                    </button>
                </div>
            </div>
        `;
    }

    loadMarkers() {
        // Clear existing markers
        this.markerClusterGroup.clearLayers();
        this.markers = [];

        // Add markers for filtered data
        this.filteredData.forEach(areal => {
            const icon = this.createCustomIcon(areal.category);
            
            const marker = L.marker([areal.lat, areal.lng], { icon })
                .bindPopup(this.createPopupContent(areal), {
                    maxWidth: 400,
                    className: 'custom-popup-wrapper'
                });

            this.markers.push({ marker, data: areal });
            this.markerClusterGroup.addLayer(marker);
        });

        console.log(`[Map] Loaded ${this.markers.length} markers`);
    }

    navigateTo(lat, lng, service) {
        const urls = {
            google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
            mapy: `https://mapy.cz/zakladni?q=${lat},${lng}`,
            waze: `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`
        };

        window.open(urls[service], '_blank');
    }

    toggleCompletion(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (areal) {
            areal.is_completed = !areal.is_completed;
            this.showToast(
                areal.is_completed ? 'Areál označen jako dokončený' : 'Areál označen jako nedokončený',
                'success'
            );
            this.updateStatistics();
            
            // Save to localStorage
            this.saveData();
        }
    }

    editAreal(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (areal) {
            // TODO: Open edit modal
            this.showToast('Funkce editace bude brzy k dispozici', 'info');
        }
    }

    addToRoute(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (areal && !this.selectedAreals.find(a => a.id === arealId)) {
            this.selectedAreals.push(areal);
            this.showToast(`${areal.name} přidán do trasy`, 'success');
            this.updateRouteList();
        }
    }

    updateRouteList() {
        const routeList = document.getElementById('routeList');
        if (!routeList) return;

        if (this.selectedAreals.length === 0) {
            routeList.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">Žádné areály v trase</p>';
            return;
        }

        routeList.innerHTML = this.selectedAreals.map((areal, index) => `
            <div class="route-item" draggable="true" data-index="${index}">
                <div class="route-number">${index + 1}</div>
                <div class="route-info">
                    <div class="route-name">${areal.name}</div>
                    <div class="route-meta">${areal.area_sqm.toLocaleString()} m² • ${areal.district_name || DISTRICT_CODES[areal.district]}</div>
                </div>
                <button class="route-remove" onclick="app.removeFromRoute(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Add drag & drop functionality
        this.initializeDragDrop();
    }

    removeFromRoute(index) {
        const removed = this.selectedAreals.splice(index, 1)[0];
        this.showToast(`${removed.name} odebrán z trasy`, 'info');
        this.updateRouteList();
    }

    initializeDragDrop() {
        const items = document.querySelectorAll('.route-item');
        let draggedItem = null;

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem !== item) {
                    const fromIndex = parseInt(draggedItem.dataset.index);
                    const toIndex = parseInt(item.dataset.index);
                    
                    // Swap items
                    const temp = this.selectedAreals[fromIndex];
                    this.selectedAreals[fromIndex] = this.selectedAreals[toIndex];
                    this.selectedAreals[toIndex] = temp;
                    
                    this.updateRouteList();
                }
            });
        });
    }

    applyFilters() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const district = document.getElementById('districtFilter').value;
        const category = document.getElementById('categoryFilter').value;
        const type = document.getElementById('typeFilter').value;
        const status = document.getElementById('statusFilter').value;
        const minArea = parseInt(document.getElementById('minAreaRange').value);
        const maxArea = parseInt(document.getElementById('maxAreaRange').value);

        this.filteredData = AREALS_DATA.filter(areal => {
            // Search filter
            if (search && !areal.name.toLowerCase().includes(search) && 
                !areal.district.toLowerCase().includes(search) &&
                !areal.type.toLowerCase().includes(search)) {
                return false;
            }

            // District filter
            if (district && areal.district !== district) {
                return false;
            }

            // Category filter
            if (category) {
                if (category === 'null' && areal.category !== null) return false;
                if (category !== 'null' && areal.category !== category) return false;
            }

            // Type filter
            if (type && areal.type !== type) {
                return false;
            }

            // Status filter
            if (status === 'completed' && !areal.is_completed) return false;
            if (status === 'pending' && areal.is_completed) return false;

            // Area range filter
            if (areal.area_sqm < minArea || areal.area_sqm > maxArea) {
                return false;
            }

            return true;
        });

        this.loadMarkers();
        this.updateStatistics();
        
        console.log(`[Filters] Applied - ${this.filteredData.length} areals match`);
    }

    updateStatistics() {
        const total = this.filteredData.length;
        const totalArea = this.filteredData.reduce((sum, a) => sum + a.area_sqm, 0);
        const completed = this.filteredData.filter(a => a.is_completed).length;
        const highRisk = this.filteredData.filter(a => a.category === 'I.').length;

        document.getElementById('totalAreals').textContent = total;
        document.getElementById('totalArea').textContent = (totalArea / 1000).toFixed(0) + 'k';
        document.getElementById('completedAreals').textContent = completed;
        document.getElementById('highRisk').textContent = highRisk;
    }

    initializeEventListeners() {
        // Search
        document.getElementById('searchInput').addEventListener('input', () => {
            this.applyFilters();
        });

        // Filters
        ['districtFilter', 'categoryFilter', 'typeFilter', 'statusFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Range sliders
        const minRange = document.getElementById('minAreaRange');
        const maxRange = document.getElementById('maxAreaRange');
        const minValue = document.getElementById('minAreaValue');
        const maxValue = document.getElementById('maxAreaValue');

        minRange.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            minValue.textContent = value.toLocaleString();
            if (value > parseInt(maxRange.value)) {
                maxRange.value = value;
                maxValue.textContent = value.toLocaleString();
            }
            this.applyFilters();
        });

        maxRange.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            maxValue.textContent = value.toLocaleString();
            if (value < parseInt(minRange.value)) {
                minRange.value = value;
                minValue.textContent = value.toLocaleString();
            }
            this.applyFilters();
        });

        // Reset filters
        document.getElementById('resetFilters').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('districtFilter').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('typeFilter').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('minAreaRange').value = 395;
            document.getElementById('maxAreaRange').value = 74777;
            document.getElementById('minAreaValue').textContent = '395';
            document.getElementById('maxAreaValue').textContent = '74,777';
            
            // Remove active class from quick filters
            document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
            
            this.applyFilters();
            this.showToast('Filtry resetovány', 'info');
        });

        // Quick filters
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                
                // Remove active from all
                document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                
                // Reset other filters
                document.getElementById('searchInput').value = '';
                document.getElementById('districtFilter').value = '';
                document.getElementById('categoryFilter').value = '';
                document.getElementById('typeFilter').value = '';
                document.getElementById('statusFilter').value = '';
                
                // Apply quick filter
                switch(filterType) {
                    case 'all':
                        this.filteredData = [...AREALS_DATA];
                        break;
                    case 'cat-1':
                        document.getElementById('categoryFilter').value = 'I.';
                        break;
                    case 'cat-2':
                        document.getElementById('categoryFilter').value = 'II.';
                        break;
                    case 'top10':
                        this.filteredData = [...AREALS_DATA]
                            .sort((a, b) => b.area_sqm - a.area_sqm)
                            .slice(0, 10);
                        this.loadMarkers();
                        this.updateStatistics();
                        return;
                    case 'uncompleted':
                        document.getElementById('statusFilter').value = 'pending';
                        break;
                }
                
                this.applyFilters();
            });
        });

        // Dark mode toggle
        document.getElementById('toggleDarkMode').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Sidebar toggle (mobile)
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // Route planner
        document.getElementById('routePlannerBtn').addEventListener('click', () => {
            this.openModal('routePlannerModal');
            this.updateRouteList();
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.openModal('analyticsModal');
            this.initializeCharts();
        });

        // Map controls
        document.getElementById('toggleClustering').addEventListener('click', () => {
            this.toggleClustering();
        });

        document.getElementById('toggleHeatmap').addEventListener('click', () => {
            this.toggleHeatmap();
        });

        document.getElementById('measureTool').addEventListener('click', () => {
            this.toggleMeasureTool();
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Optimize route
        const optimizeBtn = document.getElementById('optimizeRouteBtn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeRoute();
            });
        }
    }

    toggleClustering() {
        const btn = document.getElementById('toggleClustering');
        if (this.map.hasLayer(this.markerClusterGroup)) {
            this.map.removeLayer(this.markerClusterGroup);
            this.markers.forEach(m => this.map.addLayer(m.marker));
            btn.classList.remove('active');
        } else {
            this.markers.forEach(m => this.map.removeLayer(m.marker));
            this.map.addLayer(this.markerClusterGroup);
            btn.classList.add('active');
        }
    }

    toggleHeatmap() {
        const btn = document.getElementById('toggleHeatmap');
        // TODO: Implement heatmap with Leaflet.heat
        this.showToast('Heatmapa bude brzy k dispozici', 'info');
        btn.classList.toggle('active');
    }

    toggleMeasureTool() {
        const btn = document.getElementById('measureTool');
        // TODO: Implement measure tool
        this.showToast('Nástroj měření bude brzy k dispozici', 'info');
        btn.classList.toggle('active');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('dark-mode');
        
        const icon = document.querySelector('#toggleDarkMode i');
        icon.className = this.darkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        localStorage.setItem('darkMode', this.darkMode);
        
        // Update map tiles for dark mode
        if (this.darkMode) {
            // TODO: Switch to dark map tiles
        }
    }

    checkDarkMode() {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            this.toggleDarkMode();
        }
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    switchTab(tabName) {
        // Remove active from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active to selected
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    }

    optimizeRoute() {
        if (this.selectedAreals.length < 2) {
            this.showToast('Vyberte alespoň 2 areály pro optimalizaci', 'warning');
            return;
        }

        // Simple TSP using nearest neighbor
        const optimized = this.nearestNeighborTSP(this.selectedAreals);
        this.selectedAreals = optimized;
        this.updateRouteList();
        
        // Calculate statistics
        const stats = this.calculateRouteStats(optimized);
        document.getElementById('totalDistance').textContent = stats.distance.toFixed(1) + ' km';
        document.getElementById('estimatedTime').textContent = stats.time.toFixed(1) + ' h';
        document.getElementById('fuelConsumption').textContent = stats.fuel.toFixed(1) + ' L';
        document.getElementById('arealCount').textContent = optimized.length;
        
        this.showToast('Trasa optimalizována!', 'success');
    }

    nearestNeighborTSP(areals) {
        if (areals.length <= 1) return areals;
        
        const result = [areals[0]];
        const remaining = areals.slice(1);
        
        while (remaining.length > 0) {
            const current = result[result.length - 1];
            let nearest = 0;
            let minDist = Infinity;
            
            remaining.forEach((areal, index) => {
                const dist = this.calculateDistance(current, areal);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = index;
                }
            });
            
            result.push(remaining[nearest]);
            remaining.splice(nearest, 1);
        }
        
        return result;
    }

    calculateDistance(a, b) {
        const R = 6371; // Earth radius in km
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLon = (b.lng - a.lng) * Math.PI / 180;
        const lat1 = a.lat * Math.PI / 180;
        const lat2 = b.lat * Math.PI / 180;

        const x = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
        
        return R * c;
    }

    calculateRouteStats(areals) {
        let totalDistance = 0;
        
        for (let i = 0; i < areals.length - 1; i++) {
            totalDistance += this.calculateDistance(areals[i], areals[i + 1]);
        }
        
        // Time calculation
        const drivingTime = totalDistance / 8; // 8 km/h average
        const workTime = areals.reduce((sum, a) => sum + (a.area_sqm / 4000), 0); // 4000 m²/h capacity
        const totalTime = drivingTime + workTime;
        
        // Fuel calculation (3.5 L/h)
        const fuel = totalTime * 3.5;
        
        return {
            distance: totalDistance,
            time: totalTime,
            fuel: fuel
        };
    }

    initializeCharts() {
        // District Chart
        this.createDistrictChart();
        
        // Category Chart
        this.createCategoryChart();
        
        // Top Areals Chart
        this.createTopArealChart();
    }

    createDistrictChart() {
        const ctx = document.getElementById('districtChart');
        if (!ctx) return;

        const districtData = {};
        this.filteredData.forEach(areal => {
            if (!districtData[areal.district]) {
                districtData[areal.district] = 0;
            }
            districtData[areal.district] += areal.area_sqm;
        });

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(districtData).map(d => DISTRICT_CODES[d]),
                datasets: [{
                    data: Object.values(districtData),
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', 
                        '#ef4444', '#8b5cf6', '#ec4899'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const catData = {
            'I.': 0,
            'II.': 0,
            'null': 0
        };

        this.filteredData.forEach(areal => {
            const cat = areal.category || 'null';
            catData[cat] += areal.area_sqm;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Kategorie I.', 'Kategorie II.', 'Bez kategorie'],
                datasets: [{
                    data: [catData['I.'], catData['II.'], catData['null']],
                    backgroundColor: ['#dc3545', '#fd7e14', '#007bff']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createTopArealChart() {
        const ctx = document.getElementById('topArealChart');
        if (!ctx) return;

        const top10 = [...this.filteredData]
            .sort((a, b) => b.area_sqm - a.area_sqm)
            .slice(0, 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map(a => a.name),
                datasets: [{
                    label: 'Výměra (m²)',
                    data: top10.map(a => a.area_sqm),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    saveData() {
        localStorage.setItem('jvs_areals_data', JSON.stringify(AREALS_DATA));
    }

    loadData() {
        const saved = localStorage.getItem('jvs_areals_data');
        if (saved) {
            const data = JSON.parse(saved);
            // Merge saved data with AREALS_DATA
            data.forEach(savedAreal => {
                const areal = AREALS_DATA.find(a => a.id === savedAreal.id);
                if (areal) {
                    areal.is_completed = savedAreal.is_completed;
                }
            });
        }
    }
}

// Global functions for inline onclick handlers
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new JVSPremiumApp();
    window.app = app; // Make globally accessible
});

export default JVSPremiumApp;
