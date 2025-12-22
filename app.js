/**
 * JVS Management System - Main Application
 * Entry point and orchestration of all modules
 * Version: 2.0.0
 */

// =============================================
// IMPORTS
// =============================================
import { dataService, CONFIG } from './services/data.service.js';
import { mapService } from './services/map.service.js';
import { aiService } from './services/ai.service.js';
import { FiltersModule } from './modules/filters.module.js';
import { RoutesModule } from './modules/routes.module.js';
import { UIModule } from './modules/ui.module.js';
import { ModalComponent } from './components/modal.component.js';
import { ToastComponent } from './components/toast.component.js';

// =============================================
// APPLICATION CLASS
// =============================================

class JVSApplication {
    constructor() {
        this.isInitialized = false;
        this.currentAreals = [];
        this.filteredAreals = [];
        this.currentStats = null;
        
        // Module instances
        this.filtersModule = null;
        this.routesModule = null;
        this.uiModule = null;
        this.modalComponent = null;
        this.toastComponent = null;
        
        // Data subscription
        this.arealSubscription = null;
        
        // Event handlers
        this.eventHandlers = {
            'addToRoute': this.handleAddToRoute.bind(this),
            'showArealDetails': this.handleShowArealDetails.bind(this),
            'filterChanged': this.handleFiltersChanged.bind(this),
            'routeUpdated': this.handleRouteUpdated.bind(this),
            'exportData': this.handleExportData.bind(this)
        };
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    /**
     * Initialize the entire application
     */
    async initialize() {
        try {
            console.log('[JVSApp] Starting initialization...');
            
            this.showGlobalLoader('Načítání aplikace...');
            
            // Step 1: Initialize core services
            await this.initializeServices();
            
            // Step 2: Initialize UI components
            await this.initializeComponents();
            
            // Step 3: Initialize modules
            await this.initializeModules();
            
            // Step 4: Setup event listeners
            this.setupEventListeners();
            
            // Step 5: Load initial data
            await this.loadInitialData();
            
            // Step 6: Final setup
            this.finalizeInitialization();
            
            this.isInitialized = true;
            this.hideGlobalLoader();
            
            console.log('[JVSApp] Application initialized successfully');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('[JVSApp] Initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize core services
     */
    async initializeServices() {
        console.log('[JVSApp] Initializing services...');
        
        try {
            // Initialize data service
            await dataService.initialize();
            
            // Initialize map service  
            await mapService.initialize('map');
            
            // Initialize AI service
            await aiService.initialize();
            
            console.log('[JVSApp] Services initialized');
        } catch (error) {
            console.error('[JVSApp] Service initialization failed:', error);
            throw new Error('Nepodařilo se inicializovat základní služby');
        }
    }

    /**
     * Initialize UI components
     */
    async initializeComponents() {
        console.log('[JVSApp] Initializing components...');
        
        try {
            // Initialize modal component
            this.modalComponent = new ModalComponent();
            await this.modalComponent.initialize();
            
            // Initialize toast component
            this.toastComponent = new ToastComponent();
            await this.toastComponent.initialize();
            
            console.log('[JVSApp] Components initialized');
        } catch (error) {
            console.error('[JVSApp] Component initialization failed:', error);
            throw new Error('Nepodařilo se inicializovat UI komponenty');
        }
    }

    /**
     * Initialize functional modules
     */
    async initializeModules() {
        console.log('[JVSApp] Initializing modules...');
        
        try {
            // Initialize filters module
            this.filtersModule = new FiltersModule();
            await this.filtersModule.initialize();
            
            // Initialize routes module
            this.routesModule = new RoutesModule();
            await this.routesModule.initialize();
            
            // Initialize UI module
            this.uiModule = new UIModule();
            await this.uiModule.initialize();
            
            console.log('[JVSApp] Modules initialized');
        } catch (error) {
            console.error('[JVSApp] Module initialization failed:', error);
            throw new Error('Nepodařilo se inicializovat funkční moduly');
        }
    }

    /**
     * Setup application event listeners
     */
    setupEventListeners() {
        console.log('[JVSApp] Setting up event listeners...');
        
        // Global event listeners
        Object.entries(this.eventHandlers).forEach(([event, handler]) => {
            window.addEventListener(event, handler);
        });
        
        // Map service events
        mapService.addEventListener('markerClick', this.handleMarkerClick.bind(this));
        mapService.addEventListener('click', this.handleMapClick.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('online', () => {
            this.toastComponent.show('Připojení obnoveno', 'success');
        });
        window.addEventListener('offline', () => {
            this.toastComponent.show('Ztráta připojení - pracuji offline', 'warning');
        });
        
        console.log('[JVSApp] Event listeners setup complete');
    }

    /**
     * Load initial application data
     */
    async loadInitialData() {
        console.log('[JVSApp] Loading initial data...');
        
        try {
            // Subscribe to areals data
            this.arealSubscription = dataService.subscribeToAreals((areals) => {
                this.handleAreaalsUpdate(areals);
            }, {
                sortBy: 'area_desc',
                limit: 100
            });
            
            console.log('[JVSApp] Initial data loaded');
        } catch (error) {
            console.error('[JVSApp] Failed to load initial data:', error);
            throw new Error('Nepodařilo se načíst základní data');
        }
    }

    /**
     * Finalize initialization
     */
    finalizeInitialization() {
        // Update UI state
        this.uiModule.updateConnectionStatus(navigator.onLine);
        
        // Setup periodic tasks
        this.setupPeriodicTasks();
        
        // Mark app as ready
        document.body.classList.add('app-ready');
        
        console.log('[JVSApp] Initialization finalized');
    }

    // =============================================
    // DATA HANDLING
    // =============================================

    /**
     * Handle areals data update
     */
    handleAreaalsUpdate(areals) {
        console.log(`[JVSApp] Received ${areals.length} areals`);
        
        this.currentAreals = areals;
        this.currentStats = dataService.calculateStats(areals);
        
        // Update map
        mapService.updateMarkers(areals);
        
        // Update UI
        this.uiModule.updateStats(this.currentStats);
        this.uiModule.updateArealsList(areals);
        
        // Update filters
        this.filtersModule.setAreals(areals);
        
        // Apply current filters
        this.applyCurrentFilters();
    }

    /**
     * Apply current filter state
     */
    applyCurrentFilters() {
        const filterCriteria = this.filtersModule.getCurrentCriteria();
        this.filteredAreals = dataService.filterAreals(this.currentAreals, filterCriteria);
        
        // Update displays
        this.uiModule.updateFilteredArealsList(this.filteredAreals);
        this.uiModule.updateArealCount(this.filteredAreals.length);
        
        // Update map if needed
        if (filterCriteria.hasActiveFilters) {
            mapService.updateMarkers(this.filteredAreals);
        }
    }

    // =============================================
    // EVENT HANDLERS
    // =============================================

    /**
     * Handle add areal to route
     */
    handleAddToRoute(event) {
        const { arealId } = event.detail;
        const areal = this.currentAreals.find(a => a.id === arealId);
        
        if (areal) {
            const result = this.routesModule.addPoint(areal);
            
            if (result.success) {
                this.toastComponent.show(`Areál ${areal.name} přidán do trasy`, 'success');
            } else {
                this.toastComponent.show(result.message, 'error');
            }
        }
    }

    /**
     * Handle show areal details
     */
    handleShowArealDetails(event) {
        const { arealId } = event.detail;
        const areal = this.currentAreals.find(a => a.id === arealId);
        
        if (areal) {
            this.modalComponent.showArealDetails(areal);
        }
    }

    /**
     * Handle filters changed
     */
    handleFiltersChanged(event) {
        console.log('[JVSApp] Filters changed:', event.detail);
        this.applyCurrentFilters();
    }

    /**
     * Handle route updated
     */
    handleRouteUpdated(event) {
        const { route } = event.detail;
        
        // Update map with route
        if (route && route.coordinates) {
            mapService.displayRoute(route);
        } else {
            mapService.clearRoute();
        }
        
        // Update UI
        this.uiModule.updateRouteInfo(route);
    }

    /**
     * Handle export data
     */
    handleExportData(event) {
        const { format, data } = event.detail;
        
        try {
            this.exportData(format, data || this.currentAreals);
            this.toastComponent.show(`Data exportována ve formátu ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('[JVSApp] Export failed:', error);
            this.toastComponent.show('Chyba při exportu dat', 'error');
        }
    }

    /**
     * Handle marker click
     */
    handleMarkerClick(data) {
        const { areal } = data;
        console.log('[JVSApp] Marker clicked:', areal.name);
        
        // Update selection state
        this.uiModule.highlightAreal(areal.id);
    }

    /**
     * Handle map click
     */
    handleMapClick(event) {
        // Clear areal selection
        this.uiModule.clearArealHighlight();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Invalidate map size
        if (mapService.map) {
            setTimeout(() => {
                mapService.map.invalidateSize();
            }, 100);
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        // Save any pending data
        this.saveApplicationState();
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    /**
     * Export data in specified format
     */
    exportData(format, data) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `jvs-arealy-${timestamp}`;
        
        switch (format) {
            case 'csv':
                this.exportAsCSV(data, filename);
                break;
            case 'geojson':
                this.exportAsGeoJSON(data, filename);
                break;
            case 'json':
                this.exportAsJSON(data, filename);
                break;
            default:
                throw new Error(`Nepodporovaný formát exportu: ${format}`);
        }
    }

    /**
     * Export as CSV
     */
    exportAsCSV(data, filename) {
        const headers = ['ID', 'Název', 'Okres', 'Kategorie', 'Plocha (m²)', 'Oplocení (m)', 'Dokončeno', 'Poslední údržba', 'Poznámky'];
        const rows = data.map(areal => [
            areal.id,
            areal.name,
            areal.district,
            areal.category || 'Bez kategorie',
            areal.area_sqm || 0,
            areal.fence_length || 0,
            areal.is_completed ? 'Ano' : 'Ne',
            areal.last_maintenance ? new Date(dataService.timestampToDate(areal.last_maintenance)).toLocaleDateString('cs-CZ') : '',
            (areal.notes || '').replace(/"/g, '""')
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        
        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    }

    /**
     * Export as GeoJSON
     */
    exportAsGeoJSON(data, filename) {
        const features = data
            .filter(areal => areal.lat && areal.lng)
            .map(areal => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [areal.lng, areal.lat]
                },
                properties: {
                    id: areal.id,
                    name: areal.name,
                    district: areal.district,
                    category: areal.category || null,
                    area_sqm: areal.area_sqm || 0,
                    fence_length: areal.fence_length || 0,
                    is_completed: areal.is_completed,
                    last_maintenance: areal.last_maintenance ? dataService.timestampToDate(areal.last_maintenance).toISOString() : null,
                    notes: areal.notes || null
                }
            }));
        
        const geoJSON = {
            type: 'FeatureCollection',
            features: features
        };
        
        this.downloadFile(JSON.stringify(geoJSON, null, 2), `${filename}.geojson`, 'application/json');
    }

    /**
     * Export as JSON
     */
    exportAsJSON(data, filename) {
        const exportData = {
            export_timestamp: new Date().toISOString(),
            total_areals: data.length,
            statistics: this.currentStats,
            areals: data
        };
        
        this.downloadFile(JSON.stringify(exportData, null, 2), `${filename}.json`, 'application/json');
    }

    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Setup periodic background tasks
     */
    setupPeriodicTasks() {
        // Update statistics every 5 minutes
        setInterval(() => {
            if (this.currentAreals.length > 0) {
                this.currentStats = dataService.calculateStats(this.currentAreals);
                this.uiModule.updateStats(this.currentStats);
            }
        }, 5 * 60 * 1000);
        
        // Check connection status every minute
        setInterval(() => {
            this.uiModule.updateConnectionStatus(navigator.onLine);
        }, 60 * 1000);
    }

    /**
     * Save application state
     */
    saveApplicationState() {
        try {
            const state = {
                timestamp: new Date().toISOString(),
                filters: this.filtersModule?.getCurrentCriteria(),
                route: this.routesModule?.getCurrentRoute(),
                mapCenter: mapService?.getCenter(),
                mapZoom: mapService?.getZoom()
            };
            
            localStorage.setItem('jvs_app_state', JSON.stringify(state));
        } catch (error) {
            console.warn('[JVSApp] Failed to save state:', error);
        }
    }

    /**
     * Load application state
     */
    loadApplicationState() {
        try {
            const savedState = localStorage.getItem('jvs_app_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Restore filters
                if (state.filters && this.filtersModule) {
                    this.filtersModule.applyCriteria(state.filters);
                }
                
                // Restore route
                if (state.route && this.routesModule) {
                    this.routesModule.restoreRoute(state.route);
                }
                
                // Restore map view
                if (state.mapCenter && state.mapZoom && mapService.map) {
                    mapService.map.setView([state.mapCenter.lat, state.mapCenter.lng], state.mapZoom);
                }
                
                console.log('[JVSApp] Application state restored');
            }
        } catch (error) {
            console.warn('[JVSApp] Failed to load state:', error);
        }
    }

    // =============================================
    // UI HELPERS
    // =============================================

    /**
     * Show global loading indicator
     */
    showGlobalLoader(message = 'Načítání...') {
        const loader = document.getElementById('globalLoader');
        const loaderText = document.getElementById('loaderText');
        
        if (loader) {
            loader.classList.remove('hidden');
            if (loaderText && message) {
                loaderText.textContent = message;
            }
        }
    }

    /**
     * Hide global loading indicator
     */
    hideGlobalLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.classList.add('hidden');
                loader.classList.remove('fade-out');
            }, 500);
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const isFirstVisit = !localStorage.getItem('jvs_visited');
        
        if (isFirstVisit) {
            setTimeout(() => {
                this.toastComponent.show('Vítejte v JVS Management System! 👋', 'info', 5000);
                localStorage.setItem('jvs_visited', 'true');
            }, 1000);
        }
    }

    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        this.hideGlobalLoader();
        
        // Show error message
        const errorMessage = error.message || 'Nastala neočekávaná chyba při načítání aplikace';
        
        document.body.innerHTML = `
            <div class="error-container">
                <div class="error-content">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1>Chyba při načítání</h1>
                    <p>${errorMessage}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i>
                        Znovu načíst
                    </button>
                </div>
            </div>
            
            <style>
                .error-container {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: Inter, system-ui, sans-serif;
                }
                .error-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
                    text-align: center;
                    max-width: 400px;
                    margin: 1rem;
                }
                .error-icon {
                    font-size: 3rem;
                    color: #ef4444;
                    margin-bottom: 1rem;
                }
                .error-content h1 {
                    margin: 0 0 1rem 0;
                    color: #1e293b;
                }
                .error-content p {
                    margin: 0 0 2rem 0;
                    color: #64748b;
                }
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    background: #0055ff;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn:hover {
                    background: #0044cc;
                    transform: translateY(-1px);
                }
            </style>
        `;
        
        console.error('[JVSApp] Critical initialization error:', error);
    }

    // =============================================
    // CLEANUP
    // =============================================

    /**
     * Cleanup application
     */
    destroy() {
        console.log('[JVSApp] Cleaning up application...');
        
        // Unsubscribe from data
        if (this.arealSubscription) {
            this.arealSubscription();
        }
        
        // Remove event listeners
        Object.entries(this.eventHandlers).forEach(([event, handler]) => {
            window.removeEventListener(event, handler);
        });
        
        // Cleanup modules
        this.filtersModule?.destroy();
        this.routesModule?.destroy();
        this.uiModule?.destroy();
        this.modalComponent?.destroy();
        this.toastComponent?.destroy();
        
        // Cleanup services
        dataService.cleanup();
        mapService.destroy();
        aiService.destroy();
        
        // Save final state
        this.saveApplicationState();
        
        this.isInitialized = false;
        console.log('[JVSApp] Cleanup complete');
    }
}

// =============================================
// APPLICATION INITIALIZATION
// =============================================

// Global application instance
let app = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

/**
 * Initialize the application
 */
async function initializeApplication() {
    try {
        console.log('[JVSApp] Starting JVS Management System...');
        
        app = new JVSApplication();
        await app.initialize();
        
        // Make app globally available for debugging
        window.jvsApp = app;
        
        console.log('[JVSApp] JVS Management System ready! 🚀');
        
    } catch (error) {
        console.error('[JVSApp] Failed to initialize application:', error);
    }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app && app.isInitialized) {
        app.destroy();
    }
});

// Export for modules that need it
export { app };
export default JVSApplication;