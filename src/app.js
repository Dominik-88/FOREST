/**
 * JVS FOREST v4.0 - Main Application
 * Clean, modular, secure architecture
 * 
 * @version 4.0.0
 * @date 2025-12-25
 */

// =============================================
// IMPORTS
// =============================================
import { WeatherService } from './services/weather.service.js';
import { AIService } from './services/ai.service.js';
import { DataService } from './services/data.service.js';
import { MapService } from './services/map.service.js';
import { OperationsService } from './services/operations.service.js';
import { ReportingService } from './services/reporting.service.js';

// =============================================
// APPLICATION CLASS
// =============================================
class JVSApp {
    constructor() {
        this.services = {
            weather: new WeatherService(),
            ai: new AIService(),
            data: new DataService(),
            map: new MapService(),
            operations: new OperationsService(),
            reporting: new ReportingService()
        };
        
        this.state = {
            areals: [],
            filteredAreals: [],
            selectedAreal: null,
            userLocation: null
        };
        
        this.ui = {
            sidebar: null,
            aiPanel: null,
            map: null
        };
    }
    
    // =============================================
    // INITIALIZATION
    // =============================================
    async init() {
        try {
            console.log('🚀 JVS FOREST v4.0 initializing...');
            
            // Initialize UI references
            this.initUIReferences();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadData();
            
            // Initialize services
            await this.initializeServices();
            
            // Render initial state
            this.render();
            
            console.log('✅ Application ready!');
            this.showToast('Aplikace připravena', 'success');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showToast('Chyba při inicializaci', 'error');
        }
    }
    
    initUIReferences() {
        this.ui = {
            sidebar: document.getElementById('sidebar'),
            aiPanel: document.getElementById('aiPanel'),
            map: document.getElementById('map'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            aiBot: document.getElementById('aiBot'),
            closeAI: document.getElementById('closeAI'),
            searchInput: document.getElementById('searchInput'),
            districtFilter: document.getElementById('districtFilter'),
            statusFilter: document.getElementById('statusFilter'),
            arealsList: document.getElementById('arealsList'),
            aiMessages: document.getElementById('aiMessages'),
            aiInput: document.getElementById('aiInput'),
            sendAI: document.getElementById('sendAI')
        };
    }
    
    setupEventListeners() {
        // Sidebar toggle
        this.ui.sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        
        // AI Bot
        this.ui.aiBot?.addEventListener('click', () => this.toggleAIPanel());
        this.ui.closeAI?.addEventListener('click', () => this.toggleAIPanel());
        
        // Filters
        this.ui.searchInput?.addEventListener('input', () => this.applyFilters());
        this.ui.districtFilter?.addEventListener('change', () => this.applyFilters());
        this.ui.statusFilter?.addEventListener('change', () => this.applyFilters());
        
        // AI Input
        this.ui.sendAI?.addEventListener('click', () => this.sendAIMessage());
        this.ui.aiInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAIMessage();
            }
        });
        
        // FAB buttons
        document.getElementById('locateMe')?.addEventListener('click', () => this.locateUser());
        document.getElementById('heatmap')?.addEventListener('click', () => this.toggleHeatmap());
        document.getElementById('addAreal')?.addEventListener('click', () => this.addAreal());
        
        // Export buttons
        document.getElementById('exportCSV')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('exportReport')?.addEventListener('click', () => this.exportReport());
    }
    
    async initializeServices() {
        // Initialize map
        await this.services.map.init('map');
        
        // Load weather
        await this.services.weather.loadWeather();
        this.updateWeatherUI();
        
        // Initialize AI
        await this.services.ai.init(this.state.areals);
    }
    
    // =============================================
    // DATA MANAGEMENT
    // =============================================
    async loadData() {
        try {
            this.state.areals = await this.services.data.loadAreals();
            this.state.filteredAreals = [...this.state.areals];
            console.log(`✅ Loaded ${this.state.areals.length} areals`);
        } catch (error) {
            console.error('❌ Data loading failed:', error);
            throw error;
        }
    }
    
    applyFilters() {
        const search = this.ui.searchInput?.value.toLowerCase() || '';
        const district = this.ui.districtFilter?.value || '';
        const status = this.ui.statusFilter?.value || '';
        
        this.state.filteredAreals = this.state.areals.filter(areal => {
            // Search filter
            if (search && !areal.nazev.toLowerCase().includes(search)) {
                return false;
            }
            
            // District filter
            if (district && areal.okres !== district) {
                return false;
            }
            
            // Status filter
            if (status) {
                const arealStatus = this.services.operations.getArealStatus(areal.id);
                if (status !== arealStatus) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.render();
    }
    
    // =============================================
    // RENDERING
    // =============================================
    render() {
        this.renderAreals();
        this.renderMap();
        this.updateStatistics();
    }
    
    renderAreals() {
        if (!this.ui.arealsList) return;
        
        // Clear list
        this.ui.arealsList.innerHTML = '';
        
        // Render each areal
        this.state.filteredAreals.forEach(areal => {
            const item = this.createArealItem(areal);
            this.ui.arealsList.appendChild(item);
        });
        
        // Update count
        const countEl = document.getElementById('arealCount');
        if (countEl) {
            countEl.textContent = this.state.filteredAreals.length.toString();
        }
    }
    
    createArealItem(areal) {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer';
        
        // Use textContent for security (XSS protection)
        const nameEl = document.createElement('div');
        nameEl.className = 'font-semibold text-gray-900';
        nameEl.textContent = areal.nazev;
        
        const metaEl = document.createElement('div');
        metaEl.className = 'text-xs text-gray-600 mt-1';
        metaEl.textContent = `${areal.okres} • ${areal.vymera.toLocaleString()} m²`;
        
        const statusEl = document.createElement('div');
        statusEl.className = 'mt-2 flex gap-2';
        
        const status = this.services.operations.getArealStatus(areal.id);
        const statusBadge = this.createStatusBadge(status);
        statusEl.appendChild(statusBadge);
        
        div.appendChild(nameEl);
        div.appendChild(metaEl);
        div.appendChild(statusEl);
        
        // Click handler
        div.addEventListener('click', () => this.selectAreal(areal));
        
        return div;
    }
    
    createStatusBadge(status) {
        const span = document.createElement('span');
        span.className = 'px-2 py-1 rounded text-xs font-semibold';
        
        switch (status) {
            case 'mowed':
                span.className += ' bg-green-100 text-green-700';
                span.textContent = '✅ Posečeno';
                break;
            case 'overdue':
                span.className += ' bg-red-100 text-red-700';
                span.textContent = '⚠️ Po termínu';
                break;
            default:
                span.className += ' bg-yellow-100 text-yellow-700';
                span.textContent = '⏳ Čeká';
        }
        
        return span;
    }
    
    renderMap() {
        this.services.map.updateMarkers(this.state.filteredAreals);
    }
    
    updateStatistics() {
        const stats = this.services.data.calculateStats(this.state.filteredAreals);
        
        const statArea = document.getElementById('statArea');
        const statFence = document.getElementById('statFence');
        const statMowed = document.getElementById('statMowed');
        const statPending = document.getElementById('statPending');
        
        if (statArea) statArea.textContent = (stats.totalArea / 1000).toFixed(0) + 'k';
        if (statFence) statFence.textContent = (stats.totalFence / 1000).toFixed(1) + 'k';
        if (statMowed) statMowed.textContent = stats.mowedToday.toString();
        if (statPending) statPending.textContent = stats.pending.toString();
    }
    
    updateWeatherUI() {
        const weather = this.services.weather.getCurrentWeather();
        if (!weather) return;
        
        const tempEl = document.getElementById('weatherTemp');
        const descEl = document.getElementById('weatherDesc');
        const iconEl = document.getElementById('weatherIcon');
        const windEl = document.getElementById('weatherWind');
        const humidityEl = document.getElementById('weatherHumidity');
        const rainEl = document.getElementById('weatherRain');
        
        if (tempEl) tempEl.textContent = `${Math.round(weather.temp)}°C`;
        if (descEl) descEl.textContent = weather.description;
        if (iconEl) iconEl.textContent = weather.icon;
        if (windEl) windEl.textContent = `${Math.round(weather.wind)} km/h`;
        if (humidityEl) humidityEl.textContent = `${weather.humidity}%`;
        if (rainEl) rainEl.textContent = `${weather.rain} mm`;
    }
    
    // =============================================
    // UI INTERACTIONS
    // =============================================
    toggleSidebar() {
        this.ui.sidebar?.classList.toggle('collapsed');
        const icon = this.ui.sidebarToggle?.querySelector('i');
        if (icon) {
            icon.className = this.ui.sidebar?.classList.contains('collapsed') 
                ? 'fas fa-bars text-xl' 
                : 'fas fa-times text-xl';
        }
    }
    
    toggleAIPanel() {
        this.ui.aiPanel?.classList.toggle('active');
    }
    
    selectAreal(areal) {
        this.state.selectedAreal = areal;
        this.services.map.focusAreal(areal);
        this.showArealPopup(areal);
    }
    
    showArealPopup(areal) {
        // Create popup content securely
        const popup = document.createElement('div');
        popup.className = 'p-4';
        
        const title = document.createElement('h3');
        title.className = 'text-lg font-bold mb-2';
        title.textContent = areal.nazev;
        
        const info = document.createElement('div');
        info.className = 'text-sm text-gray-600 space-y-1 mb-3';
        
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
        
        const actions = document.createElement('div');
        actions.className = 'flex gap-2';
        
        const mowBtn = document.createElement('button');
        mowBtn.className = 'flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition';
        mowBtn.textContent = '✅ Dokončit seč';
        mowBtn.addEventListener('click', () => this.openMowingModal(areal));
        
        const serviceBtn = document.createElement('button');
        serviceBtn.className = 'flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition';
        serviceBtn.textContent = '📖 Servisní knížka';
        serviceBtn.addEventListener('click', () => this.openServiceBook(areal));
        
        actions.appendChild(mowBtn);
        actions.appendChild(serviceBtn);
        
        popup.appendChild(title);
        popup.appendChild(info);
        popup.appendChild(actions);
        
        this.services.map.showPopup(areal, popup);
    }
    
    openMowingModal(areal) {
        const modal = document.getElementById('mowingModal');
        const nameInput = document.getElementById('mowingArealName');
        
        if (nameInput) nameInput.value = areal.nazev;
        
        modal?.classList.add('active');
        
        // Setup form handler
        const form = document.getElementById('mowingForm');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.completeMowing(areal);
        }, { once: true });
    }
    
    completeMowing(areal) {
        const worker = (document.getElementById('mowingWorker') as HTMLInputElement)?.value;
        const note = (document.getElementById('mowingNote') as HTMLTextAreaElement)?.value;
        
        if (!worker) {
            this.showToast('Vyplňte pracovníka/stroj', 'error');
            return;
        }
        
        this.services.operations.completeMowing(areal.id, worker, note);
        
        this.closeModal('mowingModal');
        this.showToast('Seč dokončena', 'success');
        this.render();
    }
    
    openServiceBook(areal) {
        const modal = document.getElementById('serviceModal');
        const content = document.getElementById('serviceBookContent');
        
        if (!content) return;
        
        // Clear content
        content.innerHTML = '';
        
        // Get service history
        const history = this.services.operations.getServiceHistory(areal.id);
        
        if (history.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'text-center text-gray-500 py-8';
            empty.textContent = 'Žádné záznamy';
            content.appendChild(empty);
        } else {
            history.forEach(entry => {
                const entryEl = this.createServiceEntry(entry);
                content.appendChild(entryEl);
            });
        }
        
        modal?.classList.add('active');
    }
    
    createServiceEntry(entry) {
        const div = document.createElement('div');
        div.className = 'service-entry';
        
        const date = document.createElement('div');
        date.className = 'font-semibold text-sm';
        date.textContent = new Date(entry.date).toLocaleString('cs-CZ');
        
        const worker = document.createElement('div');
        worker.className = 'text-sm text-gray-600';
        worker.textContent = `Pracovník: ${entry.worker}`;
        
        if (entry.note) {
            const note = document.createElement('div');
            note.className = 'text-sm text-gray-600 mt-1';
            note.textContent = entry.note;
            div.appendChild(note);
        }
        
        div.appendChild(date);
        div.appendChild(worker);
        
        return div;
    }
    
    // =============================================
    // AI ASSISTANT
    // =============================================
    async sendAIMessage() {
        const input = this.ui.aiInput?.value.trim();
        if (!input) return;
        
        // Add user message
        this.addAIMessage(input, 'user');
        
        // Clear input
        if (this.ui.aiInput) this.ui.aiInput.value = '';
        
        // Get AI response
        try {
            const response = await this.services.ai.query(input, this.state.areals);
            this.addAIMessage(response, 'bot');
        } catch (error) {
            this.addAIMessage('Omlouvám se, došlo k chybě. Zkuste to prosím znovu.', 'bot');
        }
    }
    
    addAIMessage(text, type) {
        if (!this.ui.aiMessages) return;
        
        const div = document.createElement('div');
        div.className = `ai-message ${type}`;
        
        const p = document.createElement('p');
        p.className = 'text-sm';
        p.textContent = text;
        
        div.appendChild(p);
        this.ui.aiMessages.appendChild(div);
        
        // Scroll to bottom
        this.ui.aiMessages.scrollTop = this.ui.aiMessages.scrollHeight;
    }
    
    // =============================================
    // UTILITIES
    // =============================================
    locateUser() {
        if (!navigator.geolocation) {
            this.showToast('Geolokace není podporována', 'error');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.state.userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                this.services.map.setView(this.state.userLocation.lat, this.state.userLocation.lon, 13);
                this.showToast('Poloha nalezena', 'success');
            },
            (error) => {
                this.showToast('Chyba při získávání polohy', 'error');
            }
        );
    }
    
    toggleHeatmap() {
        this.services.map.toggleHeatmap(this.state.filteredAreals);
    }
    
    addAreal() {
        this.showToast('Funkce v přípravě', 'info');
    }
    
    exportCSV() {
        this.services.reporting.exportCSV(this.state.filteredAreals);
        this.showToast('CSV exportováno', 'success');
    }
    
    exportReport() {
        this.services.reporting.exportReport(this.state.filteredAreals);
        this.showToast('Report exportován', 'success');
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal?.classList.remove('active');
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const icon = document.createElement('div');
        icon.className = 'w-6 h-6 rounded-full flex items-center justify-center';
        
        switch (type) {
            case 'success':
                icon.className += ' bg-green-100 text-green-600';
                icon.innerHTML = '<i class="fas fa-check text-sm"></i>';
                break;
            case 'error':
                icon.className += ' bg-red-100 text-red-600';
                icon.innerHTML = '<i class="fas fa-times text-sm"></i>';
                break;
            case 'warning':
                icon.className += ' bg-yellow-100 text-yellow-600';
                icon.innerHTML = '<i class="fas fa-exclamation text-sm"></i>';
                break;
            default:
                icon.className += ' bg-blue-100 text-blue-600';
                icon.innerHTML = '<i class="fas fa-info text-sm"></i>';
        }
        
        const text = document.createElement('div');
        text.className = 'flex-1 text-sm font-medium';
        text.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(text);
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// =============================================
// GLOBAL FUNCTIONS (for inline handlers)
// =============================================
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    modal?.classList.remove('active');
};

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const app = new JVSApp();
    app.init();
    
    // Make app globally accessible for debugging
    window.jvsApp = app;
});

export default JVSApp;