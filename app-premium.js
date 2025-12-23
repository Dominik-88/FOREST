/**
 * JVS Management Premium App
 * Complete UI/UX with XRot 95 EVO PRO Integration
 * Features: CRUD, Service Book, Photos, Notes, Route Planning
 */

import { AREALS_DATA, DATASET_STATS, CATEGORY_COLORS, DISTRICT_CODES } from './data/areals-complete.js';

class JVSPremiumApp {
    constructor() {
        this.map = null;
        this.gpsPickerMap = null;
        this.routePreviewMap = null;
        this.markers = [];
        this.markerClusterGroup = null;
        this.heatmapLayer = null;
        this.measureControl = null;
        this.drawControl = null;
        this.drawnItems = null;
        this.filteredData = [...AREALS_DATA];
        this.selectedAreals = [];
        this.machines = [];
        this.serviceRecords = [];
        this.darkMode = false;
        this.currentEditingAreal = null;
        this.uploadedPhotos = [];
        
        this.init();
    }

    async init() {
        console.log('[JVS Premium] Initializing...');
        
        // Load saved data
        this.loadSavedData();
        
        // Initialize map
        this.initializeMap();
        
        // Load markers
        this.loadMarkers();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Update statistics
        this.updateStatistics();
        
        // Check for dark mode preference
        this.checkDarkMode();
        
        // Load machines list
        this.loadMachinesList();
        
        console.log('[JVS Premium] Initialized successfully');
    }

    initializeMap() {
        // Initialize main map
        this.map = L.map('map', {
            zoomControl: false
        }).setView([49.0, 14.4], 9);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add zoom control
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

        // Initialize drawn items layer
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);

        console.log('[Map] Initialized');
    }

    initializeGPSPicker() {
        const container = document.getElementById('gpsPicker');
        if (!container || this.gpsPickerMap) return;

        this.gpsPickerMap = L.map('gpsPicker').setView([49.0, 14.4], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(this.gpsPickerMap);

        let marker = null;

        this.gpsPickerMap.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                marker = L.marker([lat, lng]).addTo(this.gpsPickerMap);
            }

            document.getElementById('arealLat').value = lat.toFixed(6);
            document.getElementById('arealLng').value = lng.toFixed(6);
        });

        // If editing, show existing marker
        if (this.currentEditingAreal) {
            marker = L.marker([this.currentEditingAreal.lat, this.currentEditingAreal.lng])
                .addTo(this.gpsPickerMap);
            this.gpsPickerMap.setView([this.currentEditingAreal.lat, this.currentEditingAreal.lng], 15);
        }

        setTimeout(() => {
            this.gpsPickerMap.invalidateSize();
        }, 100);
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
        
        // Get photos for this areal
        const photos = areal.photos || [];
        const photosHTML = photos.length > 0 ? `
            <div class="photo-gallery">
                ${photos.slice(0, 3).map(photo => `
                    <div class="photo-item" onclick="app.viewPhoto('${photo}')">
                        <img src="${photo}" alt="Foto areálu">
                    </div>
                `).join('')}
                ${photos.length > 3 ? `
                    <div class="photo-item" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); font-weight: 700;">
                        +${photos.length - 3}
                    </div>
                ` : ''}
            </div>
        ` : '';

        // Get notes for this areal
        const notes = areal.notes || [];
        const notesHTML = notes.length > 0 ? `
            <div class="notes-section">
                <div class="filter-label" style="margin-bottom: 0.75rem;">Poznámky</div>
                ${notes.slice(0, 2).map(note => `
                    <div class="note-item">
                        <div class="note-header">
                            <span class="note-date">${new Date(note.date).toLocaleDateString('cs-CZ')}</span>
                        </div>
                        <div class="note-text">${note.text}</div>
                    </div>
                `).join('')}
                ${notes.length > 2 ? `
                    <div style="text-align: center; margin-top: 0.5rem;">
                        <a href="#" onclick="app.viewAllNotes('${areal.id}')" style="font-size: 0.75rem; color: var(--primary);">
                            Zobrazit všechny poznámky (${notes.length})
                        </a>
                    </div>
                ` : ''}
            </div>
        ` : '';
        
        return `
            <div class="custom-popup">
                <div class="popup-header">
                    <div>
                        <div class="popup-title">${areal.name}</div>
                        <div class="popup-subtitle">${areal.district_name || DISTRICT_CODES[areal.district]}</div>
                    </div>
                    <span class="category-badge ${categoryClass}">${categoryText}</span>
                </div>

                ${photosHTML}

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

                ${notesHTML}

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="app.editAreal('${areal.id}')" style="width: 100%;">
                        <i class="fas fa-edit"></i>
                        Upravit
                    </button>
                    <button class="btn btn-secondary" onclick="app.addNote('${areal.id}')" style="width: 100%;">
                        <i class="fas fa-sticky-note"></i>
                        Poznámka
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
                    maxWidth: 450,
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
            areal.updated_at = new Date();
            
            this.showToast(
                areal.is_completed ? 'Areál označen jako dokončený' : 'Areál označen jako nedokončený',
                'success'
            );
            this.updateStatistics();
            this.saveData();
            
            // Reload markers to update popup
            this.loadMarkers();
        }
    }

    openAddArealModal() {
        this.currentEditingAreal = null;
        document.getElementById('arealModalTitle').textContent = 'Přidat Nový Areál';
        document.getElementById('deleteArealBtn').style.display = 'none';
        document.getElementById('arealForm').reset();
        this.uploadedPhotos = [];
        document.getElementById('imagePreviewGrid').innerHTML = '';
        
        this.openModal('arealModal');
        
        // Initialize GPS picker after modal is visible
        setTimeout(() => {
            this.initializeGPSPicker();
        }, 100);
    }

    editAreal(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (!areal) return;

        this.currentEditingAreal = areal;
        document.getElementById('arealModalTitle').textContent = 'Upravit Areál';
        document.getElementById('deleteArealBtn').style.display = 'inline-flex';
        
        // Fill form
        document.getElementById('arealName').value = areal.name;
        document.getElementById('arealType').value = areal.type;
        document.getElementById('arealDistrict').value = areal.district;
        document.getElementById('arealCategory').value = areal.category || '';
        document.getElementById('arealArea').value = areal.area_sqm;
        document.getElementById('arealFence').value = areal.fence_length_m;
        document.getElementById('arealLat').value = areal.lat;
        document.getElementById('arealLng').value = areal.lng;
        document.getElementById('arealNotes').value = areal.description || '';
        
        // Load photos
        this.uploadedPhotos = areal.photos || [];
        this.updatePhotoPreview();
        
        this.openModal('arealModal');
        
        setTimeout(() => {
            this.initializeGPSPicker();
        }, 100);
    }

    saveAreal() {
        const form = document.getElementById('arealForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const arealData = {
            name: document.getElementById('arealName').value,
            type: document.getElementById('arealType').value,
            district: document.getElementById('arealDistrict').value,
            district_name: DISTRICT_CODES[document.getElementById('arealDistrict').value],
            category: document.getElementById('arealCategory').value || null,
            area_sqm: parseInt(document.getElementById('arealArea').value),
            fence_length_m: parseInt(document.getElementById('arealFence').value) || 0,
            lat: parseFloat(document.getElementById('arealLat').value),
            lng: parseFloat(document.getElementById('arealLng').value),
            description: document.getElementById('arealNotes').value,
            photos: this.uploadedPhotos,
            notes: [],
            is_completed: false,
            created_at: new Date(),
            updated_at: new Date()
        };

        if (this.currentEditingAreal) {
            // Update existing
            const index = AREALS_DATA.findIndex(a => a.id === this.currentEditingAreal.id);
            if (index !== -1) {
                AREALS_DATA[index] = {
                    ...this.currentEditingAreal,
                    ...arealData,
                    id: this.currentEditingAreal.id,
                    notes: this.currentEditingAreal.notes,
                    created_at: this.currentEditingAreal.created_at
                };
                this.showToast('Areál úspěšně aktualizován', 'success');
            }
        } else {
            // Add new
            arealData.id = this.generateId('areal');
            AREALS_DATA.push(arealData);
            this.showToast('Nový areál úspěšně přidán', 'success');
        }

        this.saveData();
        this.applyFilters();
        this.closeModal('arealModal');
        this.currentEditingAreal = null;
    }

    deleteAreal() {
        if (!this.currentEditingAreal) return;

        if (confirm(`Opravdu chcete smazat areál "${this.currentEditingAreal.name}"?`)) {
            const index = AREALS_DATA.findIndex(a => a.id === this.currentEditingAreal.id);
            if (index !== -1) {
                AREALS_DATA.splice(index, 1);
                this.showToast('Areál úspěšně smazán', 'success');
                this.saveData();
                this.applyFilters();
                this.closeModal('arealModal');
                this.currentEditingAreal = null;
            }
        }
    }

    addNote(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (!areal) return;

        const noteText = prompt('Zadejte poznámku:');
        if (noteText && noteText.trim()) {
            if (!areal.notes) areal.notes = [];
            
            areal.notes.push({
                id: this.generateId('note'),
                text: noteText.trim(),
                date: new Date(),
                author: 'Uživatel'
            });

            this.showToast('Poznámka přidána', 'success');
            this.saveData();
            this.loadMarkers(); // Reload to update popup
        }
    }

    viewAllNotes(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (!areal || !areal.notes) return;

        // TODO: Open notes modal
        alert(`Zobrazení všech poznámek pro ${areal.name}\n\n${areal.notes.map(n => `${new Date(n.date).toLocaleDateString()}: ${n.text}`).join('\n\n')}`);
    }

    viewPhoto(photoUrl) {
        // TODO: Open lightbox
        window.open(photoUrl, '_blank');
    }

    handlePhotoUpload(files, targetGrid) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedPhotos.push(e.target.result);
                    this.updatePhotoPreview(targetGrid);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updatePhotoPreview(gridId = 'imagePreviewGrid') {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = this.uploadedPhotos.map((photo, index) => `
            <div class="image-preview">
                <img src="${photo}" alt="Preview">
                <button class="image-preview-remove" onclick="app.removePhoto(${index}, '${gridId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    removePhoto(index, gridId) {
        this.uploadedPhotos.splice(index, 1);
        this.updatePhotoPreview(gridId);
    }

    addToRoute(arealId) {
        const areal = AREALS_DATA.find(a => a.id === arealId);
        if (areal && !this.selectedAreals.find(a => a.id === arealId)) {
            this.selectedAreals.push(areal);
            this.showToast(`${areal.name} přidán do trasy`, 'success');
            this.updateRouteList();
        } else if (this.selectedAreals.find(a => a.id === arealId)) {
            this.showToast('Areál již je v trase', 'warning');
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

        // Update count
        document.getElementById('arealCount').textContent = this.selectedAreals.length;

        // Add drag & drop
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
                    
                    const temp = this.selectedAreals[fromIndex];
                    this.selectedAreals[fromIndex] = this.selectedAreals[toIndex];
                    this.selectedAreals[toIndex] = temp;
                    
                    this.updateRouteList();
                }
            });
        });
    }

    optimizeRoute() {
        if (this.selectedAreals.length < 2) {
            this.showToast('Vyberte alespoň 2 areály pro optimalizaci', 'warning');
            return;
        }

        const optimized = this.nearestNeighborTSP(this.selectedAreals);
        this.selectedAreals = optimized;
        this.updateRouteList();
        
        const stats = this.calculateRouteStats(optimized);
        document.getElementById('totalDistance').textContent = stats.distance.toFixed(1) + ' km';
        document.getElementById('estimatedTime').textContent = stats.time.toFixed(1) + ' h';
        document.getElementById('fuelConsumption').textContent = stats.fuel.toFixed(1) + ' L';
        
        this.showToast('Trasa optimalizována pomocí AI!', 'success');
        this.drawRouteOnMap();
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
        const R = 6371;
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
        
        const drivingTime = totalDistance / 8;
        const workTime = areals.reduce((sum, a) => sum + (a.area_sqm / 4000), 0);
        const totalTime = drivingTime + workTime;
        const fuel = totalTime * 3.5;
        
        return { distance: totalDistance, time: totalTime, fuel };
    }

    drawRouteOnMap() {
        // TODO: Draw polyline on route preview map
        console.log('[Route] Drawing route on map');
    }

    exportGPX() {
        if (this.selectedAreals.length === 0) {
            this.showToast('Nejdřív vyberte areály do trasy', 'warning');
            return;
        }

        const gpx = this.generateGPX(this.selectedAreals);
        this.downloadFile(gpx, 'jvs-route.gpx', 'application/gpx+xml');
        this.showToast('GPX soubor stažen', 'success');
    }

    generateGPX(areals) {
        const waypoints = areals.map((areal, index) => `
    <wpt lat="${areal.lat}" lon="${areal.lng}">
        <name>${index + 1}. ${areal.name}</name>
        <desc>${areal.type} | ${areal.area_sqm} m²</desc>
    </wpt>`).join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="JVS Management">
    <metadata>
        <name>JVS Route - ${new Date().toLocaleDateString('cs-CZ')}</name>
        <desc>Optimalizovaná trasa pro ${areals.length} areálů</desc>
        <time>${new Date().toISOString()}</time>
    </metadata>
${waypoints}
</gpx>`;
    }

    exportCSV() {
        const headers = ['Název', 'Okres', 'Kategorie', 'Typ', 'Výměra (m²)', 'Oplocení (m)', 'Latitude', 'Longitude', 'Dokončeno'];
        const rows = this.filteredData.map(a => [
            a.name,
            a.district_name || DISTRICT_CODES[a.district],
            a.category || 'Bez kategorie',
            a.type,
            a.area_sqm,
            a.fence_length_m,
            a.lat,
            a.lng,
            a.is_completed ? 'Ano' : 'Ne'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        this.downloadFile(csv, 'jvs-arealy.csv', 'text/csv');
        this.showToast('CSV soubor stažen', 'success');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Service Book Functions
    loadMachinesList() {
        const container = document.getElementById('machinesList');
        if (!container) return;

        if (this.machines.length === 0) {
            // Add default XRot 95
            this.machines.push({
                id: 'xrot-95-001',
                name: 'XRot 95 #1',
                model: 'XRot 95 EVO PRO',
                serial: 'RC62H00***',
                year: 2024,
                hours: 245,
                status: 'active',
                fuel_consumption: 0,
                created_at: new Date()
            });
        }

        container.innerHTML = this.machines.map(machine => `
            <div class="machine-card">
                <div class="machine-header">
                    <div>
                        <div class="machine-name">${machine.name}</div>
                        <div class="machine-model">${machine.model}</div>
                    </div>
                    <span class="machine-status ${machine.status}">${this.getMachineStatusText(machine.status)}</span>
                </div>
                <div class="machine-stats">
                    <div class="machine-stat">
                        <div class="machine-stat-value">${machine.hours}</div>
                        <div class="machine-stat-label">Motohodiny</div>
                    </div>
                    <div class="machine-stat">
                        <div class="machine-stat-value">${machine.fuel_consumption || 0}</div>
                        <div class="machine-stat-label">Spotřeba (L)</div>
                    </div>
                    <div class="machine-stat">
                        <div class="machine-stat-value">${machine.year}</div>
                        <div class="machine-stat-label">Rok výroby</div>
                    </div>
                    <div class="machine-stat">
                        <div class="machine-stat-value">${this.getServiceCount(machine.id)}</div>
                        <div class="machine-stat-label">Servisy</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getMachineStatusText(status) {
        const texts = {
            active: 'Aktivní',
            maintenance: 'V servisu',
            inactive: 'Neaktivní'
        };
        return texts[status] || status;
    }

    getServiceCount(machineId) {
        return this.serviceRecords.filter(r => r.machine_id === machineId).length;
    }

    loadServiceRecords() {
        const container = document.getElementById('serviceRecordsList');
        if (!container) return;

        if (this.serviceRecords.length === 0) {
            container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">Žádné servisní záznamy</p>';
            return;
        }

        container.innerHTML = this.serviceRecords
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(record => {
                const machine = this.machines.find(m => m.id === record.machine_id);
                return `
                    <div class="service-item">
                        <div class="service-header">
                            <div>
                                <div class="service-title">${record.type}</div>
                                <div class="service-date">${new Date(record.date).toLocaleDateString('cs-CZ')} • ${machine?.name || 'Neznámý stroj'}</div>
                            </div>
                            <span class="service-type">${record.type}</span>
                        </div>
                        <div class="service-description">${record.description}</div>
                        <div class="service-meta">
                            <div class="service-meta-item">
                                <i class="fas fa-clock"></i>
                                ${record.hours} mth
                            </div>
                            ${record.cost ? `
                                <div class="service-meta-item">
                                    <i class="fas fa-money-bill"></i>
                                    ${record.cost.toLocaleString()} Kč
                                </div>
                            ` : ''}
                            ${record.technician ? `
                                <div class="service-meta-item">
                                    <i class="fas fa-user"></i>
                                    ${record.technician}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
    }

    openAddMachineModal() {
        this.openModal('addMachineModal');
    }

    saveMachine() {
        const machineData = {
            id: this.generateId('machine'),
            name: document.getElementById('machineName').value,
            model: document.getElementById('machineModel').value,
            serial: document.getElementById('machineSerial').value,
            year: parseInt(document.getElementById('machineYear').value) || new Date().getFullYear(),
            hours: parseInt(document.getElementById('machineHours').value) || 0,
            status: document.getElementById('machineStatus').value,
            notes: document.getElementById('machineNotes').value,
            fuel_consumption: 0,
            created_at: new Date()
        };

        this.machines.push(machineData);
        this.saveData();
        this.loadMachinesList();
        this.closeModal('addMachineModal');
        this.showToast('Stroj úspěšně přidán', 'success');
    }

    openServiceRecordModal() {
        // Populate machines dropdown
        const select = document.getElementById('serviceMachine');
        if (select) {
            select.innerHTML = '<option value="">Vyberte stroj</option>' +
                this.machines.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
        }

        // Set today's date
        document.getElementById('serviceDate').valueAsDate = new Date();
        
        this.uploadedPhotos = [];
        document.getElementById('serviceImagePreviewGrid').innerHTML = '';
        
        this.openModal('serviceRecordModal');
    }

    saveServiceRecord() {
        const form = document.getElementById('serviceRecordForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const recordData = {
            id: this.generateId('service'),
            machine_id: document.getElementById('serviceMachine').value,
            date: document.getElementById('serviceDate').value,
            type: document.getElementById('serviceType').value,
            hours: parseInt(document.getElementById('serviceHours').value) || 0,
            cost: parseFloat(document.getElementById('serviceCost').value) || 0,
            technician: document.getElementById('serviceTechnician').value,
            description: document.getElementById('serviceDescription').value,
            parts: document.getElementById('serviceParts').value,
            photos: this.uploadedPhotos,
            created_at: new Date()
        };

        this.serviceRecords.push(recordData);
        this.saveData();
        this.loadServiceRecords();
        this.closeModal('serviceRecordModal');
        this.showToast('Servisní záznam uložen', 'success');
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
            if (search && !areal.name.toLowerCase().includes(search) && 
                !areal.district.toLowerCase().includes(search) &&
                !areal.type.toLowerCase().includes(search)) {
                return false;
            }

            if (district && areal.district !== district) return false;
            
            if (category) {
                if (category === 'null' && areal.category !== null) return false;
                if (category !== 'null' && areal.category !== category) return false;
            }

            if (type && areal.type !== type) return false;
            if (status === 'completed' && !areal.is_completed) return false;
            if (status === 'pending' && areal.is_completed) return false;
            if (areal.area_sqm < minArea || areal.area_sqm > maxArea) return false;

            return true;
        });

        this.loadMarkers();
        this.updateStatistics();
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
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());

        // Filters
        ['districtFilter', 'categoryFilter', 'typeFilter', 'statusFilter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.applyFilters());
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
            minRange.value = 395;
            maxRange.value = 74777;
            minValue.textContent = '395';
            maxValue.textContent = '74,777';
            
            document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
            
            this.applyFilters();
            this.showToast('Filtry resetovány', 'info');
        });

        // Quick filters
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                
                document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
                e.target.classList.add('active');
                
                document.getElementById('searchInput').value = '';
                document.getElementById('districtFilter').value = '';
                document.getElementById('categoryFilter').value = '';
                document.getElementById('typeFilter').value = '';
                document.getElementById('statusFilter').value = '';
                
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

        // Dark mode
        document.getElementById('toggleDarkMode').addEventListener('click', () => this.toggleDarkMode());

        // Sidebar toggle
        document.getElementById('toggleSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // Modals
        document.getElementById('routePlannerBtn').addEventListener('click', () => {
            this.openModal('routePlannerModal');
            this.updateRouteList();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.openModal('analyticsModal');
            setTimeout(() => this.initializeCharts(), 100);
        });

        document.getElementById('serviceBookBtn').addEventListener('click', () => {
            this.openModal('serviceBookModal');
            this.loadMachinesList();
            this.loadServiceRecords();
        });

        // Map controls
        document.getElementById('toggleClustering').addEventListener('click', () => this.toggleClustering());
        document.getElementById('toggleHeatmap').addEventListener('click', () => this.toggleHeatmap());
        document.getElementById('measureTool').addEventListener('click', () => this.toggleMeasureTool());
        document.getElementById('drawPolygon').addEventListener('click', () => this.toggleDrawPolygon());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                const parent = e.target.closest('.modal-body') || document.body;
                
                parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                parent.querySelector(`#tab-${tabName}`).classList.add('active');
            });
        });

        // FAB Menu
        document.getElementById('fabBtn').addEventListener('click', () => {
            document.getElementById('fabMenu').classList.toggle('active');
        });

        // Close FAB menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab') && !e.target.closest('.fab-menu')) {
                document.getElementById('fabMenu').classList.remove('active');
            }
        });

        // Save areal
        document.getElementById('saveArealBtn').addEventListener('click', () => this.saveAreal());
        
        // Delete areal
        document.getElementById('deleteArealBtn').addEventListener('click', () => this.deleteAreal());

        // Photo upload
        const photoUploadArea = document.getElementById('photoUploadArea');
        const photoInput = document.getElementById('photoInput');
        
        photoUploadArea.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files, 'imagePreviewGrid');
        });

        // Service photo upload
        const servicePhotoArea = document.getElementById('servicePhotoUploadArea');
        const servicePhotoInput = document.getElementById('servicePhotoInput');
        
        if (servicePhotoArea && servicePhotoInput) {
            servicePhotoArea.addEventListener('click', () => servicePhotoInput.click());
            servicePhotoInput.addEventListener('change', (e) => {
                this.handlePhotoUpload(e.target.files, 'serviceImagePreviewGrid');
            });
        }

        // Save machine
        const saveMachineBtn = document.getElementById('saveMachineBtn');
        if (saveMachineBtn) {
            saveMachineBtn.addEventListener('click', () => this.saveMachine());
        }

        // Save service record
        const saveServiceBtn = document.getElementById('saveServiceRecordBtn');
        if (saveServiceBtn) {
            saveServiceBtn.addEventListener('click', () => this.saveServiceRecord());
        }

        // Optimize route
        const optimizeBtn = document.getElementById('optimizeRouteBtn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => this.optimizeRoute());
        }

        // Export buttons
        const exportGPXBtn = document.getElementById('exportGPXBtn');
        if (exportGPXBtn) {
            exportGPXBtn.addEventListener('click', () => this.exportGPX());
        }

        const exportCSVBtn = document.getElementById('exportCSVBtn');
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => this.exportCSV());
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
        this.showToast('Heatmapa bude brzy k dispozici', 'info');
    }

    toggleMeasureTool() {
        this.showToast('Nástroj měření bude brzy k dispozici', 'info');
    }

    toggleDrawPolygon() {
        const btn = document.getElementById('drawPolygon');
        
        if (!this.drawControl) {
            this.drawControl = new L.Control.Draw({
                draw: {
                    polygon: true,
                    polyline: false,
                    rectangle: true,
                    circle: false,
                    marker: false,
                    circlemarker: false
                },
                edit: {
                    featureGroup: this.drawnItems
                }
            });
            
            this.map.addControl(this.drawControl);
            
            this.map.on('draw:created', (e) => {
                const layer = e.layer;
                this.drawnItems.addLayer(layer);
                
                // Calculate area
                if (e.layerType === 'polygon' || e.layerType === 'rectangle') {
                    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                    this.showToast(`Změřená plocha: ${Math.round(area)} m²`, 'success');
                }
            });
            
            btn.classList.add('active');
        } else {
            this.map.removeControl(this.drawControl);
            this.drawControl = null;
            this.drawnItems.clearLayers();
            btn.classList.remove('active');
        }
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
        
        // Clean up GPS picker map
        if (modalId === 'arealModal' && this.gpsPickerMap) {
            this.gpsPickerMap.remove();
            this.gpsPickerMap = null;
        }
    }

    initializeCharts() {
        this.createDistrictChart();
        this.createCategoryChart();
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
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const catData = { 'I.': 0, 'II.': 0, 'null': 0 };
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
                    legend: { position: 'bottom' }
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
                    legend: { display: false }
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

    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    saveData() {
        const data = {
            areals: AREALS_DATA,
            machines: this.machines,
            serviceRecords: this.serviceRecords,
            lastUpdated: new Date()
        };
        localStorage.setItem('jvs_premium_data', JSON.stringify(data));
        console.log('[Data] Saved to localStorage');
    }

    loadSavedData() {
        const saved = localStorage.getItem('jvs_premium_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Merge areals data
                if (data.areals) {
                    data.areals.forEach(savedAreal => {
                        const areal = AREALS_DATA.find(a => a.id === savedAreal.id);
                        if (areal) {
                            Object.assign(areal, savedAreal);
                        }
                    });
                }
                
                this.machines = data.machines || [];
                this.serviceRecords = data.serviceRecords || [];
                
                console.log('[Data] Loaded from localStorage');
            } catch (e) {
                console.error('[Data] Error loading saved data:', e);
            }
        }
    }
}

// Global functions
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new JVSPremiumApp();
    window.app = app;
});

export default JVSPremiumApp;
