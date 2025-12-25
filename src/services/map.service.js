/**
 * Map Service - Leaflet map management
 * 
 * @version 4.0.0
 */

export class MapService {
    constructor() {
        this.map = null;
        this.markers = null;
        this.heatmapLayer = null;
        this.currentPopup = null;
    }
    
    /**
     * Initialize map
     */
    async init(containerId) {
        try {
            // Create map
            this.map = L.map(containerId, {
                center: [49.0, 14.5],
                zoom: 9,
                zoomControl: false
            });
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
                minZoom: 7
            }).addTo(this.map);
            
            // Add zoom control to bottom right
            L.control.zoom({
                position: 'bottomright'
            }).addTo(this.map);
            
            // Initialize marker cluster
            this.markers = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true
            });
            
            this.map.addLayer(this.markers);
            
            console.log('✅ Map initialized');
            
        } catch (error) {
            console.error('❌ Map initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Update markers on map
     */
    updateMarkers(areals) {
        if (!this.markers) return;
        
        // Clear existing markers
        this.markers.clearLayers();
        
        // Add new markers
        areals.forEach(areal => {
            const marker = this.createMarker(areal);
            this.markers.addLayer(marker);
        });
        
        // Fit bounds if markers exist
        if (areals.length > 0) {
            const bounds = this.markers.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }
    
    /**
     * Create marker for areal
     */
    createMarker(areal) {
        const color = this.getMarkerColor(areal.kategorie);
        
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
        
        // Store areal data
        marker.arealData = areal;
        
        return marker;
    }
    
    /**
     * Get marker color based on category
     */
    getMarkerColor(kategorie) {
        switch (kategorie) {
            case 'I.': return '#ef4444'; // Red - High risk
            case 'II.': return '#f59e0b'; // Orange - Medium risk
            default: return '#10b981'; // Green - Low risk
        }
    }
    
    /**
     * Show popup for areal
     */
    showPopup(areal, content) {
        if (!this.map) return;
        
        // Close current popup
        if (this.currentPopup) {
            this.map.closePopup(this.currentPopup);
        }
        
        // Create popup
        this.currentPopup = L.popup({
            maxWidth: 300,
            className: 'custom-popup'
        })
        .setLatLng([areal.lat, areal.lon])
        .setContent(content)
        .openOn(this.map);
    }
    
    /**
     * Focus on areal
     */
    focusAreal(areal) {
        if (!this.map) return;
        
        this.map.setView([areal.lat, areal.lon], 14, {
            animate: true,
            duration: 0.5
        });
    }
    
    /**
     * Set map view
     */
    setView(lat, lon, zoom = 13) {
        if (!this.map) return;
        
        this.map.setView([lat, lon], zoom, {
            animate: true,
            duration: 0.5
        });
    }
    
    /**
     * Toggle heatmap
     */
    toggleHeatmap(areals) {
        if (!this.map) return;
        
        if (this.heatmapLayer) {
            this.map.removeLayer(this.heatmapLayer);
            this.heatmapLayer = null;
            return false;
        }
        
        // Create heatmap data
        const heatData = areals.map(areal => {
            let intensity = 0.3;
            
            if (areal.kategorie === 'I.') intensity = 1.0;
            else if (areal.kategorie === 'II.') intensity = 0.6;
            
            intensity *= (areal.priorita / 100);
            
            return [areal.lat, areal.lon, intensity];
        });
        
        // Create heatmap layer
        this.heatmapLayer = L.heatLayer(heatData, {
            radius: 30,
            blur: 25,
            maxZoom: 13,
            max: 1.0,
            gradient: {
                0.0: '#4ade80',
                0.5: '#fbbf24',
                1.0: '#f87171'
            }
        }).addTo(this.map);
        
        return true;
    }
    
    /**
     * Get map instance
     */
    getMap() {
        return this.map;
    }
}