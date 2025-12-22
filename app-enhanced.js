/**
 * JVS Management System - Enhanced Application
 * Complete integration of all modules and services
 * Version: 3.0.0
 */

// =============================================
// IMPORTS
// =============================================
import { firestoreService } from './src/services/firestore.service.enhanced.js';
import { aiService } from './src/services/ai.service.enhanced.js';
import { FiltersModuleEnhanced } from './src/modules/filters.module.enhanced.js';
import { BottomSheetComponent } from './src/components/bottomsheet.component.js';

/**
 * Enhanced JVS Application Class
 */
class JVSApplicationEnhanced {
    constructor() {
        this.isInitialized = false;
        this.currentAreals = [];
        this.filteredAreals = [];
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        
        // Module instances
        this.filtersModule = null;
        this.bottomSheet = null;
        
        // Firestore listener
        this.arealSubscription = null;
    }

    /**
     * Initialize the entire application
     */
    async initialize() {
        try {
            console.log('[JVSApp Enhanced] Starting initialization...');
            
            this.showLoader('Načítání aplikace...');
            
            // Step 1: Initialize Firestore
            await this.initializeFirestore();
            
            // Step 2: Initialize AI Service
            await this.initializeAI();
            
            // Step 3: Initialize Map
            await this.initializeMap();
            
            // Step 4: Initialize UI Components
            await this.initializeComponents();
            
            // Step 5: Initialize Modules
            await this.initializeModules();
            
            // Step 6: Setup Event Listeners
            this.setupEventListeners();
            
            // Step 7: Load Data
            await this.loadData();
            
            this.isInitialized = true;
            this.hideLoader();
            
            console.log('[JVSApp Enhanced] Application initialized successfully');
            
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('[JVSApp Enhanced] Initialization failed:', error);
            this.showError('Nepodařilo se inicializovat aplikaci: ' + error.message);
        }
    }

    /**
     * Initialize Firestore service
     */
    async initializeFirestore() {
        console.log('[JVSApp] Initializing Firestore...');
        await firestoreService.initialize();
    }

    /**
     * Initialize AI service
     */
    async initializeAI() {
        console.log('[JVSApp] Initializing AI...');
        await aiService.initialize();
    }

    /**
     * Initialize Leaflet map
     */
    async initializeMap() {
        console.log('[JVSApp] Initializing map...');
        
        // Initialize Leaflet map
        this.map = L.map('map', {
            center: [49.2, 14.4], // South Bohemia center
            zoom: 9,
            zoomControl: true,
            attributionControl: true
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });
        
        this.map.addLayer(this.markerClusterGroup);
        
        console.log('[JVSApp] Map initialized');
    }

    /**
     * Initialize UI components
     */
    async initializeComponents() {
        console.log('[JVSApp] Initializing components...');
        
        // Initialize bottom sheet
        this.bottomSheet = new BottomSheetComponent();
        await this.bottomSheet.initialize();
        window.bottomSheet = this.bottomSheet;
        
        console.log('[JVSApp] Components initialized');
    }

    /**
     * Initialize modules
     */
    async initializeModules() {
        console.log('[JVSApp] Initializing modules...');
        
        // Initialize filters module
        this.filtersModule = new FiltersModuleEnhanced();
        await this.filtersModule.initialize();
        
        // Set filter change callback
        this.filtersModule.setOnFilterChange((filtered, filters) => {
            this.handleFilterChange(filtered, filters);
        });
        
        console.log('[JVSApp] Modules initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('[JVSApp] Setting up event listeners...');
        
        // AI Chat events
        const aiInput = document.getElementById('ai-input');
        const aiSendBtn = document.getElementById('ai-send');
        
        if (aiInput && aiSendBtn) {
            aiSendBtn.addEventListener('click', () => this.handleAIQuery());
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleAIQuery();
                }
            });
        }
        
        // Navigation events
        window.addEventListener('navigateToAreal', (e) => {
            this.navigateToAreal(e.detail.areal);
        });
        
        // Route events
        window.addEventListener('addToRoute', (e) => {
            this.addToRoute(e.detail.arealId);
        });
        
        // Export events
        window.addEventListener('exportData', (e) => {
            this.exportData(e.detail.format, e.detail.data);
        });
        
        // Connection status
        window.addEventListener('online', () => {
            this.showToast('Připojení obnoveno', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showToast('Pracuji offline', 'warning');
        });
        
        console.log('[JVSApp] Event listeners setup complete');
    }

    /**
     * Load data from Firestore
     */
    async loadData() {
        console.log('[JVSApp] Loading data...');
        
        // Subscribe to areals with real-time updates
        this.arealSubscription = firestoreService.subscribeToAreals(
            (areals) => {
                this.handleAreaalsUpdate(areals);
            },
            {
                sortBy: 'name',
                sortDirection: 'asc',
                limitCount: 100
            }
        );
        
        console.log('[JVSApp] Data subscription active');
    }

    /**
     * Handle areals data update
     */
    handleAreaalsUpdate(areals) {
        console.log(`[JVSApp] Received ${areals.length} areals`);
        
        this.currentAreals = areals;
        
        // Update filters module
        this.filtersModule.setAreals(areals);
        
        // Update map markers
        this.updateMapMarkers(areals);
        
        // Update stats
        this.updateGlobalStats(areals);
    }

    /**
     * Update map markers
     */
    updateMapMarkers(areals) {
        // Clear existing markers
        this.markerClusterGroup.clearLayers();
        this.markers = [];
        
        // Add new markers
        areals.forEach(areal => {
            if (areal.lat && areal.lng) {
                const marker = this.createMarker(areal);
                this.markers.push(marker);
                this.markerClusterGroup.addLayer(marker);
            }
        });
        
        console.log(`[JVSApp] Updated ${this.markers.length} markers`);
    }

    /**
     * Create marker for areal
     */
    createMarker(areal) {
        // Determine marker color based on risk
        const riskLevel = this.calculateRiskLevel(areal);
        const color = this.getRiskColor(riskLevel);
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            ">${areal.category || '•'}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Create marker
        const marker = L.marker([areal.lat, areal.lng], { icon });
        
        // Create popup
        const popupContent = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px; font-size: 16px;">${areal.name}</h3>
                <p style="margin: 0 0 4px; font-size: 12px; color: #666;">
                    ${areal.id.toUpperCase()} • ${this.getDistrictName(areal.district)}
                </p>
                <div style="margin: 8px 0;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; 
                                 background: ${color}; color: white; font-size: 11px;">
                        ${this.getRiskLabel(riskLevel)}
                    </span>
                </div>
                <button onclick="window.app.showArealDetails('${areal.id}')" 
                        style="width: 100%; padding: 8px; margin-top: 8px; 
                               background: #007bff; color: white; border: none; 
                               border-radius: 4px; cursor: pointer;">
                    Zobrazit detail
                </button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Store areal reference
        marker.arealId = areal.id;
        
        return marker;
    }

    /**
     * Calculate risk level
     */
    calculateRiskLevel(areal) {
        let score = 0;
        
        if (areal.category === 'I.') score += 40;
        else if (areal.category === 'II.') score += 20;
        
        if (areal.last_maintenance) {
            const maintenanceDate = areal.last_maintenance.toDate ? 
                areal.last_maintenance.toDate() : 
                new Date(areal.last_maintenance);
            const monthsSince = Math.floor((Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            
            if (monthsSince > 12) score += 40;
            else if (monthsSince > 6) score += 25;
            else if (monthsSince > 3) score += 10;
        } else {
            score += 50;
        }
        
        if (!areal.is_completed) score += 20;
        
        if (score >= 70) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 30) return 'medium';
        return 'low';
    }

    /**
     * Get risk color
     */
    getRiskColor(level) {
        const colors = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#28a745'
        };
        return colors[level] || colors.low;
    }

    /**
     * Get risk label
     */
    getRiskLabel(level) {
        const labels = {
            critical: 'Kritické',
            high: 'Vysoké',
            medium: 'Střední',
            low: 'Nízké'
        };
        return labels[level] || labels.low;
    }

    /**
     * Get district name
     */
    getDistrictName(code) {
        const districts = {
            'CB': 'České Budějovice',
            'TA': 'Tábor',
            'PT': 'Prachatice',
            'CK': 'Český Krumlov',
            'PI': 'Písek',
            'ST': 'Strakonice'
        };
        return districts[code] || code;
    }

    /**
     * Handle filter change
     */
    handleFilterChange(filtered, filters) {
        console.log(`[JVSApp] Filters changed: ${filtered.length} areals`);
        
        this.filteredAreals = filtered;
        
        // Update map if filters are active
        if (filters.hasActiveFilters) {
            this.updateMapMarkers(filtered);
        } else {
            this.updateMapMarkers(this.currentAreals);
        }
    }

    /**
     * Show areal details
     */
    showArealDetails(arealId) {
        const areal = this.currentAreals.find(a => a.id === arealId);
        if (areal) {
            this.bottomSheet.show(areal);
        }
    }

    /**
     * Navigate to areal
     */
    navigateToAreal(areal) {
        if (areal.lat && areal.lng) {
            this.map.setView([areal.lat, areal.lng], 15);
            
            // Find and open marker popup
            const marker = this.markers.find(m => m.arealId === areal.id);
            if (marker) {
                marker.openPopup();
            }
            
            this.showToast(`Navigace k ${areal.name}`, 'info');
        }
    }

    /**
     * Add to route
     */
    addToRoute(arealId) {
        const areal = this.currentAreals.find(a => a.id === arealId);
        if (areal) {
            // TODO: Implement route management
            this.showToast(`${areal.name} přidán do trasy`, 'success');
        }
    }

    /**
     * Handle AI query
     */
    async handleAIQuery() {
        const input = document.getElementById('ai-input');
        const chatMessages = document.getElementById('ai-chat-messages');
        
        if (!input || !chatMessages) return;
        
        const query = input.value.trim();
        if (!query) return;
        
        // Add user message
        this.addChatMessage(query, 'user');
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process query
            const result = await aiService.processQuery(query, this.currentAreals);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addChatMessage(result.response, 'assistant');
            
            // Handle special actions
            if (result.data && result.data.results) {
                // Apply filters if AI returned filter results
                this.updateMapMarkers(result.data.results);
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addChatMessage('Omlouvám se, došlo k chybě při zpracování dotazu.', 'assistant');
            console.error('[AI] Query failed:', error);
        }
    }

    /**
     * Add chat message
     */
    addChatMessage(text, role) {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message chat-message-${role}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${this.formatMarkdown(text)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Format markdown text
     */
    formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'chat-message chat-message-assistant';
        indicator.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Update global stats
     */
    updateGlobalStats(areals) {
        const total = areals.length;
        const totalArea = areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
        const completed = areals.filter(a => a.is_completed).length;
        
        // Update UI elements if they exist
        const totalEl = document.getElementById('global-stats-total');
        const areaEl = document.getElementById('global-stats-area');
        const completedEl = document.getElementById('global-stats-completed');
        
        if (totalEl) totalEl.textContent = total;
        if (areaEl) areaEl.textContent = `${totalArea.toLocaleString('cs-CZ')} m²`;
        if (completedEl) completedEl.textContent = `${completed} (${Math.round((completed/total)*100)}%)`;
    }

    /**
     * Export data
     */
    exportData(format, data) {
        // TODO: Implement export functionality
        console.log(`[JVSApp] Exporting ${data.length} areals as ${format}`);
        this.showToast(`Export ${format.toUpperCase()} připraven`, 'success');
    }

    /**
     * Show loader
     */
    showLoader(message) {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'flex';
            const loaderText = loader.querySelector('.loader-text');
            if (loaderText) loaderText.textContent = message;
        }
    }

    /**
     * Hide loader
     */
    hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Show error
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        this.showToast('JVS Management System připraven', 'success');
    }
}

// =============================================
// APPLICATION INITIALIZATION
// =============================================

// Create global app instance
window.app = new JVSApplicationEnhanced();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.initialize();
    });
} else {
    window.app.initialize();
}

// Export for module usage
export { JVSApplicationEnhanced };
