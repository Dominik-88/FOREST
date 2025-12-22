/**
 * JVS Management System - Enhanced Map Service
 * Leaflet with clustering and colored risk markers
 * Version: 2.0.0
 */

import { stateManager } from '../core/state.js';

class MapService {
    constructor() {
        this.map = null;
        this.markersLayer = null;
        this.markerClusterGroup = null;
        this.routeLayer = null;
        this.userLocationMarker = null;
        this.markers = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize map with Leaflet
     */
    async initialize(containerId) {
        try {
            console.log('[Map] Initializing...');
            
            // Wait for Leaflet to load
            await this.waitForLeaflet();
            
            // Create map instance
            this.map = L.map(containerId, {
                center: stateManager.get('map.center'),
                zoom: stateManager.get('map.zoom'),
                zoomControl: true,
                attributionControl: true
            });

            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Initialize marker cluster group
            await this.initializeClusterGroup();
            
            // Initialize layers
            this.routeLayer = L.layerGroup().addTo(this.map);
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('[Map] Initialized successfully');
            
            return true;
        } catch (error) {
            console.error('[Map] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for Leaflet library to load
     */
    async waitForLeaflet() {
        return new Promise((resolve, reject) => {
            if (typeof L !== 'undefined') {
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkInterval = setInterval(() => {
                attempts++;
                
                if (typeof L !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error('Leaflet failed to load'));
                }
            }, 100);
        });
    }

    /**
     * Initialize Leaflet MarkerCluster plugin
     */
    async initializeClusterGroup() {
        // Load MarkerCluster plugin
        await this.loadMarkerClusterPlugin();
        
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                let className = 'marker-cluster-';
                
                if (count < 10) {
                    className += 'small';
                } else if (count < 20) {
                    className += 'medium';
                } else {
                    className += 'large';
                }
                
                return L.divIcon({
                    html: `<div><span>${count}</span></div>`,
                    className: `marker-cluster ${className}`,
                    iconSize: L.point(40, 40)
                });
            }
        });
        
        this.map.addLayer(this.markerClusterGroup);
    }

    /**
     * Load MarkerCluster plugin dynamically
     */
    async loadMarkerClusterPlugin() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof L.markerClusterGroup !== 'undefined') {
                resolve();
                return;
            }
            
            // Load CSS
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css';
            document.head.appendChild(css);
            
            const cssDefault = document.createElement('link');
            cssDefault.rel = 'stylesheet';
            cssDefault.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.css';
            document.head.appendChild(cssDefault);
            
            // Load JS
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load MarkerCluster plugin'));
            document.head.appendChild(script);
        });
    }

    /**
     * Create colored marker icon based on risk category
     */
    createMarkerIcon(areal) {
        const riskColors = {
            'I.': '#ef4444',    // High risk - Red
            'II.': '#f59e0b',   // Medium risk - Orange
            '': '#10b981'       // Low risk - Green
        };
        
        const color = riskColors[areal.category || ''];
        const isCompleted = areal.is_completed;
        
        const iconHtml = `
            <div class="custom-marker" style="background-color: ${color};">
                <div class="marker-inner">
                    ${isCompleted ? '<i class="fas fa-check"></i>' : '<i class="fas fa-water"></i>'}
                </div>
                ${areal.category ? `<div class="marker-badge">${areal.category}</div>` : ''}
            </div>
        `;
        
        return L.divIcon({
            html: iconHtml,
            className: 'custom-marker-wrapper',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    }

    /**
     * Create popup content for marker
     */
    createPopupContent(areal) {
        const statusClass = areal.is_completed ? 'status-completed' : 'status-pending';
        const statusText = areal.is_completed ? 'Dokončeno' : 'Probíhá';
        
        return `
            <div class="marker-popup">
                <div class="popup-header">
                    <h3>${areal.name}</h3>
                    <span class="popup-status ${statusClass}">${statusText}</span>
                </div>
                <div class="popup-body">
                    <div class="popup-row">
                        <span class="popup-label">Okres:</span>
                        <span class="popup-value">${areal.district}</span>
                    </div>
                    ${areal.category ? `
                        <div class="popup-row">
                            <span class="popup-label">Kategorie:</span>
                            <span class="popup-value">${areal.category}</span>
                        </div>
                    ` : ''}
                    <div class="popup-row">
                        <span class="popup-label">Plocha:</span>
                        <span class="popup-value">${areal.area_sqm?.toLocaleString('cs-CZ') || 0} m²</span>
                    </div>
                    <div class="popup-row">
                        <span class="popup-label">Oplocení:</span>
                        <span class="popup-value">${areal.fence_length?.toLocaleString('cs-CZ') || 0} m</span>
                    </div>
                </div>
                <div class="popup-actions">
                    <button class="popup-btn" onclick="window.dispatchEvent(new CustomEvent('showArealDetails', { detail: { arealId: '${areal.id}' } }))">
                        <i class="fas fa-info-circle"></i> Detail
                    </button>
                    <button class="popup-btn" onclick="window.dispatchEvent(new CustomEvent('addToRoute', { detail: { arealId: '${areal.id}' } }))">
                        <i class="fas fa-plus"></i> Do trasy
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Update markers on map
     */
    updateMarkers(areals) {
        if (!this.isInitialized) {
            console.warn('[Map] Not initialized yet');
            return;
        }

        console.log(`[Map] Updating ${areals.length} markers`);
        
        // Clear existing markers
        this.markerClusterGroup.clearLayers();
        this.markers.clear();

        // Add new markers
        areals.forEach(areal => {
            if (areal.lat && areal.lng) {
                const marker = L.marker([areal.lat, areal.lng], {
                    icon: this.createMarkerIcon(areal)
                });
                
                marker.bindPopup(this.createPopupContent(areal), {
                    maxWidth: 300,
                    className: 'custom-popup'
                });
                
                marker.on('click', () => {
                    stateManager.set('selectedAreal', areal);
                });
                
                this.markerClusterGroup.addLayer(marker);
                this.markers.set(areal.id, marker);
            }
        });

        // Fit bounds if we have markers
        if (areals.length > 0 && areals.some(a => a.lat && a.lng)) {
            const bounds = this.markerClusterGroup.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }

    /**
     * Display route on map
     */
    displayRoute(routeData) {
        // Clear existing route
        this.routeLayer.clearLayers();

        if (!routeData || !routeData.coordinates || routeData.coordinates.length < 2) {
            return;
        }

        // Draw route polyline
        const polyline = L.polyline(routeData.coordinates, {
            color: '#0055ff',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        });
        
        this.routeLayer.addLayer(polyline);

        // Add numbered markers for route points
        routeData.coordinates.forEach((coord, index) => {
            const marker = L.marker(coord, {
                icon: L.divIcon({
                    html: `<div class="route-marker">${index + 1}</div>`,
                    className: 'route-marker-wrapper',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });
            this.routeLayer.addLayer(marker);
        });

        // Fit bounds to route
        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    /**
     * Clear route from map
     */
    clearRoute() {
        this.routeLayer.clearLayers();
    }

    /**
     * Show user location on map
     */
    showUserLocation(position) {
        const { latitude, longitude, accuracy } = position.coords;

        // Remove existing marker
        if (this.userLocationMarker) {
            this.map.removeLayer(this.userLocationMarker);
        }

        // Create location marker
        this.userLocationMarker = L.marker([latitude, longitude], {
            icon: L.divIcon({
                html: '<div class="user-location-marker"><div class="pulse"></div></div>',
                className: 'user-location-wrapper',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        });

        this.userLocationMarker.addTo(this.map);

        // Add accuracy circle
        if (accuracy) {
            L.circle([latitude, longitude], {
                radius: accuracy,
                color: '#0055ff',
                fillColor: '#0055ff',
                fillOpacity: 0.1,
                weight: 1
            }).addTo(this.map);
        }

        // Center map on user location
        this.map.setView([latitude, longitude], 14);
    }

    /**
     * Setup map event listeners
     */
    setupEventListeners() {
        this.map.on('click', (e) => {
            window.dispatchEvent(new CustomEvent('mapClick', {
                detail: { latlng: e.latlng }
            }));
        });

        this.map.on('zoomend', () => {
            stateManager.set('map.zoom', this.map.getZoom());
        });

        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            stateManager.set('map.center', [center.lat, center.lng]);
        });
    }

    /**
     * Invalidate map size (call after container resize)
     */
    invalidateSize() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }
}

// Export singleton instance
export const mapService = new MapService();
