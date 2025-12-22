/**
 * JVS Management System - Map Service
 * Advanced Leaflet Integration with Custom Features
 * Version: 2.0.0
 */

// =============================================
// IMPORTS & DEPENDENCIES
// =============================================
import { dataService, CONFIG } from './data.service.js';

// =============================================
// MAP SERVICE CLASS
// =============================================

class MapService {
    constructor() {
        this.map = null;
        this.markersLayer = null;
        this.routeLayer = null;
        this.currentPopup = null;
        this.markers = new Map();
        this.isInitialized = false;
        
        // Map configuration
        this.config = {
            defaultCenter: CONFIG.defaultMapCenter,
            defaultZoom: CONFIG.defaultMapZoom,
            maxZoom: 18,
            minZoom: 7,
            zoomControl: true,
            attributionControl: true
        };
        
        // Marker configuration
        this.markerConfig = {
            radius: 8,
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'custom-marker'
        };
        
        // Event listeners
        this.listeners = {
            click: [],
            markerClick: [],
            popupOpen: [],
            popupClose: []
        };
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    /**
     * Initialize the map with Leaflet
     */
    async initialize(containerId = 'map') {
        try {
            if (this.isInitialized) {
                console.warn('[MapService] Already initialized');
                return this.map;
            }

            // Wait for Leaflet to be available
            await this.waitForLeaflet();

            // Create map instance
            this.map = L.map(containerId, {
                center: this.config.defaultCenter,
                zoom: this.config.defaultZoom,
                maxZoom: this.config.maxZoom,
                minZoom: this.config.minZoom,
                zoomControl: this.config.zoomControl,
                attributionControl: this.config.attributionControl,
                preferCanvas: true, // Better performance for many markers
                zoomAnimation: true,
                fadeAnimation: true,
                markerZoomAnimation: true
            });

            // Add tile layer
            this.addTileLayer();

            // Initialize layers
            this.initializeLayers();

            // Setup event handlers
            this.setupEventHandlers();

            // Custom controls
            this.addCustomControls();

            this.isInitialized = true;
            console.log('[MapService] Map initialized successfully');
            
            return this.map;
            
        } catch (error) {
            console.error('[MapService] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for Leaflet library to be loaded
     */
    async waitForLeaflet(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLeaflet = () => {
                if (typeof L !== 'undefined') {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Leaflet library failed to load'));
                } else {
                    setTimeout(checkLeaflet, 100);
                }
            };
            
            checkLeaflet();
        });
    }

    /**
     * Add tile layer to map
     */
    addTileLayer() {
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: this.config.maxZoom,
            tileSize: 256,
            zoomOffset: 0
        });

        tileLayer.addTo(this.map);
    }

    /**
     * Initialize map layers
     */
    initializeLayers() {
        // Markers layer group
        this.markersLayer = L.layerGroup().addTo(this.map);
        
        // Route layer group
        this.routeLayer = L.layerGroup().addTo(this.map);
    }

    /**
     * Setup map event handlers
     */
    setupEventHandlers() {
        // Map click event
        this.map.on('click', (e) => {
            this.closeCurrentPopup();
            this.notifyListeners('click', e);
        });

        // Map ready event
        this.map.whenReady(() => {
            console.log('[MapService] Map is ready');
            this.hideLoadingOverlay();
        });
    }

    /**
     * Add custom map controls
     */
    addCustomControls() {
        // Remove default zoom control (we'll add our own via UI)
        if (this.map.zoomControl) {
            this.map.removeControl(this.map.zoomControl);
        }
        
        // Customize attribution
        this.map.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
    }

    // =============================================
    // MARKERS MANAGEMENT
    // =============================================

    /**
     * Add or update markers on the map
     */
    updateMarkers(areals) {
        if (!this.isInitialized || !Array.isArray(areals)) {
            console.warn('[MapService] Map not initialized or invalid areals data');
            return;
        }

        // Clear existing markers
        this.clearMarkers();

        // Add new markers
        areals.forEach(areal => {
            this.addMarker(areal);
        });

        console.log(`[MapService] Updated ${areals.length} markers`);
    }

    /**
     * Add single marker to map
     */
    addMarker(areal) {
        if (!areal.lat || !areal.lng) {
            console.warn(`[MapService] Invalid coordinates for areal ${areal.id}`);
            return null;
        }

        const marker = L.circleMarker([areal.lat, areal.lng], {
            ...this.markerConfig,
            ...this.getMarkerStyle(areal)
        });

        // Add popup
        const popupContent = this.createPopupContent(areal);
        marker.bindPopup(popupContent, {
            maxWidth: 320,
            className: 'custom-popup',
            closeButton: true,
            closeOnClick: false
        });

        // Add event listeners
        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            this.handleMarkerClick(areal, marker);
        });

        marker.on('popupopen', () => {
            this.currentPopup = marker.getPopup();
            this.notifyListeners('popupOpen', areal);
        });

        marker.on('popupclose', () => {
            this.currentPopup = null;
            this.notifyListeners('popupClose', areal);
        });

        // Add to layer and cache
        marker.addTo(this.markersLayer);
        this.markers.set(areal.id, marker);

        return marker;
    }

    /**
     * Get marker style based on areal properties
     */
    getMarkerStyle(areal) {
        const riskLevel = this.getRiskLevel(areal);
        const isCompleted = areal.is_completed;
        
        let color, className;

        if (isCompleted) {
            color = '#64748b'; // Gray for completed
            className = 'custom-marker marker-completed';
        } else {
            switch (riskLevel) {
                case 'high':
                    color = '#ef4444'; // Red
                    className = 'custom-marker marker-high-risk';
                    break;
                case 'medium':
                    color = '#f59e0b'; // Orange
                    className = 'custom-marker marker-medium-risk';
                    break;
                default:
                    color = '#10b981'; // Green
                    className = 'custom-marker marker-low-risk';
            }
        }

        return {
            color: color,
            fillColor: color,
            className: className,
            radius: isCompleted ? 6 : this.markerConfig.radius
        };
    }

    /**
     * Get risk level from areal data
     */
    getRiskLevel(areal) {
        if (areal.category === 'I.') return 'high';
        if (areal.category === 'II.') return 'medium';
        return 'low';
    }

    /**
     * Create popup content for marker
     */
    createPopupContent(areal) {
        const riskLevel = this.getRiskLevel(areal);
        const riskColor = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        }[riskLevel];

        const statusClass = areal.is_completed ? 'completed' : 'active';
        const statusText = areal.is_completed ? 'Dokončeno' : 'Aktivní';
        
        const maintenanceDate = this.formatDate(areal.last_maintenance);
        const completionDate = this.formatDate(areal.completion_date);

        return `
            <div class="popup-content">
                <div class="popup-header">
                    <h4 class="popup-title">${areal.name}</h4>
                    <div class="popup-badges">
                        <span class="district-badge">${areal.district}</span>
                        ${areal.category ? `<span class="category-badge category-${riskLevel}" style="border-color: ${riskColor}; color: ${riskColor};">
                            ${areal.category}
                        </span>` : ''}
                    </div>
                </div>
                
                <div class="popup-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Plocha</span>
                            <span class="info-value">${this.formatNumber(areal.area_sqm)} m²</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Oplocení</span>
                            <span class="info-value">${this.formatNumber(areal.fence_length)} m</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Stav</span>
                            <span class="info-value status-${statusClass}">${statusText}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Riziko</span>
                            <span class="info-value risk-${riskLevel}" style="color: ${riskColor};">
                                ${dataService.calculateArealRisk(areal)}%
                            </span>
                        </div>
                    </div>
                    
                    ${maintenanceDate ? `
                        <div class="maintenance-info">
                            <i class="fas fa-wrench"></i>
                            <span>Poslední údržba: ${maintenanceDate}</span>
                        </div>
                    ` : ''}
                    
                    ${completionDate ? `
                        <div class="completion-info">
                            <i class="fas fa-check-circle"></i>
                            <span>Dokončeno: ${completionDate}</span>
                        </div>
                    ` : ''}
                    
                    ${areal.notes ? `
                        <div class="notes-info">
                            <i class="fas fa-sticky-note"></i>
                            <span>${areal.notes}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="popup-actions">
                    <button class="popup-btn" onclick="mapService.focusAreal('${areal.id}')">
                        <i class="fas fa-crosshairs"></i>
                        Centrovat
                    </button>
                    <button class="popup-btn" onclick="mapService.addToRoute('${areal.id}')">
                        <i class="fas fa-plus-circle"></i>
                        Do trasy
                    </button>
                    <button class="popup-btn" onclick="mapService.showArealDetails('${areal.id}')">
                        <i class="fas fa-info-circle"></i>
                        Detail
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Handle marker click event
     */
    handleMarkerClick(areal, marker) {
        // Close other popups
        this.closeCurrentPopup();
        
        // Open this popup
        marker.openPopup();
        
        // Notify listeners
        this.notifyListeners('markerClick', { areal, marker });
    }

    /**
     * Clear all markers from map
     */
    clearMarkers() {
        this.markersLayer.clearLayers();
        this.markers.clear();
    }

    /**
     * Focus on specific areal
     */
    focusAreal(arealId) {
        const marker = this.markers.get(arealId);
        if (marker) {
            const latlng = marker.getLatLng();
            this.map.setView(latlng, 15, {
                animate: true,
                duration: 1
            });
            
            // Open popup after zoom
            setTimeout(() => {
                marker.openPopup();
            }, 500);
        }
    }

    /**
     * Fit map to show all markers
     */
    fitToMarkers() {
        if (this.markers.size === 0) {
            this.resetView();
            return;
        }

        const group = new L.featureGroup(Array.from(this.markers.values()));
        this.map.fitBounds(group.getBounds().pad(0.1), {
            animate: true,
            duration: 1
        });
    }

    // =============================================
    // ROUTE MANAGEMENT
    // =============================================

    /**
     * Display route on map
     */
    displayRoute(routeData) {
        // Clear existing route
        this.clearRoute();

        if (!routeData || !routeData.coordinates || routeData.coordinates.length < 2) {
            return;
        }

        // Create route line
        const routeLine = L.polyline(routeData.coordinates, {
            color: '#0055ff',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
            className: 'route-line'
        });

        // Add route to layer
        routeLine.addTo(this.routeLayer);

        // Add route waypoints
        routeData.waypoints?.forEach((waypoint, index) => {
            const waypointMarker = L.circleMarker(waypoint, {
                radius: 10,
                weight: 3,
                color: '#ffffff',
                fillColor: '#0055ff',
                fillOpacity: 1,
                className: 'route-waypoint'
            });

            // Add number label
            const numberIcon = L.divIcon({
                html: `<div class="route-number">${index + 1}</div>`,
                className: 'route-number-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const numberMarker = L.marker(waypoint, { icon: numberIcon });
            
            waypointMarker.addTo(this.routeLayer);
            numberMarker.addTo(this.routeLayer);
        });

        // Fit map to route
        this.map.fitBounds(routeLine.getBounds().pad(0.1), {
            animate: true,
            duration: 1
        });

        console.log('[MapService] Route displayed');
    }

    /**
     * Clear route from map
     */
    clearRoute() {
        this.routeLayer.clearLayers();
    }

    // =============================================
    // USER LOCATION
    // =============================================

    /**
     * Get user's current location
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ lat: latitude, lng: longitude });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    /**
     * Center map on user's location
     */
    async centerOnUser() {
        try {
            const location = await this.getUserLocation();
            this.map.setView([location.lat, location.lng], 12, {
                animate: true,
                duration: 1
            });

            // Add temporary marker for user location
            const userMarker = L.circleMarker([location.lat, location.lng], {
                radius: 8,
                weight: 3,
                color: '#ffffff',
                fillColor: '#4285f4',
                fillOpacity: 1,
                className: 'user-location-marker'
            });

            userMarker.addTo(this.map);
            userMarker.bindPopup('Vaše poloha').openPopup();

            // Remove marker after 5 seconds
            setTimeout(() => {
                this.map.removeLayer(userMarker);
            }, 5000);

            return location;
        } catch (error) {
            console.error('[MapService] Failed to get user location:', error);
            throw error;
        }
    }

    // =============================================
    // MAP CONTROLS
    // =============================================

    /**
     * Reset map to default view
     */
    resetView() {
        this.map.setView(this.config.defaultCenter, this.config.defaultZoom, {
            animate: true,
            duration: 1
        });
    }

    /**
     * Zoom in
     */
    zoomIn() {
        this.map.zoomIn();
    }

    /**
     * Zoom out
     */
    zoomOut() {
        this.map.zoomOut();
    }

    /**
     * Close current popup
     */
    closeCurrentPopup() {
        if (this.currentPopup) {
            this.map.closePopup(this.currentPopup);
            this.currentPopup = null;
        }
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    /**
     * Hide map loading overlay
     */
    hideLoadingOverlay() {
        const loadingEl = document.getElementById('mapLoading');
        if (loadingEl) {
            loadingEl.classList.add('fade-out');
            setTimeout(() => {
                loadingEl.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Format date for display
     */
    formatDate(timestamp) {
        if (!timestamp) return null;
        
        const date = dataService.timestampToDate(timestamp);
        if (!date) return null;
        
        return date.toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Format number with locale
     */
    formatNumber(num) {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString('cs-CZ');
    }

    /**
     * Add event listener
     */
    addEventListener(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Notify event listeners
     */
    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[MapService] Listener error for event ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get map bounds
     */
    getBounds() {
        return this.map.getBounds();
    }

    /**
     * Get map center
     */
    getCenter() {
        const center = this.map.getCenter();
        return { lat: center.lat, lng: center.lng };
    }

    /**
     * Get current zoom level
     */
    getZoom() {
        return this.map.getZoom();
    }

    /**
     * Check if coordinates are in current view
     */
    isInView(lat, lng) {
        const bounds = this.getBounds();
        return bounds.contains([lat, lng]);
    }

    // =============================================
    // EXTERNAL INTEGRATION METHODS
    // =============================================

    /**
     * Add areal to route (called from popup)
     */
    addToRoute(arealId) {
        // This will be handled by the routes module
        window.dispatchEvent(new CustomEvent('addToRoute', {
            detail: { arealId }
        }));
    }

    /**
     * Show areal details (called from popup)
     */
    showArealDetails(arealId) {
        // This will be handled by the modal component
        window.dispatchEvent(new CustomEvent('showArealDetails', {
            detail: { arealId }
        }));
    }

    // =============================================
    // CLEANUP
    // =============================================

    /**
     * Cleanup method
     */
    destroy() {
        if (this.map) {
            this.clearMarkers();
            this.clearRoute();
            this.map.remove();
            this.map = null;
        }
        
        this.markers.clear();
        this.listeners = {};
        this.isInitialized = false;
        
        console.log('[MapService] Destroyed');
    }
}

// =============================================
// SINGLETON EXPORT
// =============================================

export const mapService = new MapService();

// Make it globally available for popup callbacks
window.mapService = mapService;

export default mapService;

