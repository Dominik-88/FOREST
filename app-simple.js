/**
 * JVS Management System - Simplified Version
 * Uses compat Firebase SDK for maximum browser compatibility
 * Version: 3.2.0
 */

import { firestoreService } from './src/services/firestore.service.compat.js';
import { aiService } from './src/services/ai.service.compat.js';

/**
 * Simple JVS Application
 */
class JVSApp {
    constructor() {
        this.areals = [];
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
    }

    /**
     * Initialize application
     */
    async initialize() {
        try {
            console.log('[JVS App] Starting initialization...');
            
            this.showLoader('Načítání aplikace...');
            
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Initialize services
            await firestoreService.initialize();
            await aiService.initialize();
            
            // Initialize map
            this.initializeMap();
            
            // Setup UI event listeners
            this.setupEventListeners();
            
            // Load data
            this.loadData();
            
            this.hideLoader();
            
            console.log('[JVS App] Initialization complete');
            this.showToast('Aplikace připravena', 'success');
            
        } catch (error) {
            console.error('[JVS App] Initialization failed:', error);
            this.hideLoader();
            this.showToast('Chyba při načítání: ' + error.message, 'error');
        }
    }

    /**
     * Wait for Firebase to be loaded
     */
    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkFirebase = () => {
                if (typeof firebase !== 'undefined' && window.firebaseDb) {
                    console.log('[JVS App] Firebase ready');
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkFirebase, 100);
                } else {
                    reject(new Error('Firebase failed to load'));
                }
            };
            
            checkFirebase();
        });
    }

    /**
     * Initialize Leaflet map
     */
    initializeMap() {
        console.log('[JVS App] Initializing map...');
        
        this.map = L.map('map').setView([49.2, 14.4], 9);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false
        });
        
        this.map.addLayer(this.markerClusterGroup);
        
        console.log('[JVS App] Map initialized');
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        console.log('[JVS App] Setting up event listeners...');
        
        // AI chat
        const aiInput = document.getElementById('ai-input');
        const aiSend = document.getElementById('ai-send');
        
        if (aiSend) {
            aiSend.addEventListener('click', () => this.handleAIQuery());
        }
        
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAIQuery();
                }
            });
        }
        
        // Filter reset
        const resetBtn = document.getElementById('filter-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Filter inputs
        const filterInputs = [
            'filter-search',
            'filter-district',
            'filter-category',
            'filter-completed',
            'filter-risk'
        ];
        
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
                if (element.tagName === 'INPUT') {
                    element.addEventListener('input', () => this.applyFilters());
                }
            }
        });
        
        console.log('[JVS App] Event listeners setup complete');
    }

    /**
     * Load data from Firestore
     */
    loadData() {
        console.log('[JVS App] Loading data...');
        
        firestoreService.subscribeToAreals((areals) => {
            console.log(`[JVS App] Received ${areals.length} areals`);
            this.areals = areals;
            this.updateMap(areals);
            this.updateStats(areals);
        });
    }

    /**
     * Update map with areals
     */
    updateMap(areals) {
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
        
        console.log(`[JVS App] Updated ${this.markers.length} markers`);
    }

    /**
     * Create marker for areal
     */
    createMarker(areal) {
        const riskLevel = this.calculateRiskLevel(areal);
        const color = this.getRiskColor(riskLevel);
        
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
        
        const marker = L.marker([areal.lat, areal.lng], { icon });
        
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
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
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
     * Update statistics
     */
    updateStats(areals) {
        const total = areals.length;
        const totalArea = areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
        const completed = areals.filter(a => a.is_completed).length;
        const highRisk = areals.filter(a => this.calculateRiskLevel(a) === 'high' || this.calculateRiskLevel(a) === 'critical').length;
        
        this.updateElement('stats-total', total);
        this.updateElement('stats-total-area', `${totalArea.toLocaleString('cs-CZ')} m²`);
        this.updateElement('stats-completed', `${completed} (${Math.round((completed/total)*100)}%)`);
        this.updateElement('stats-high-risk', highRisk);
    }

    /**
     * Apply filters
     */
    applyFilters() {
        let filtered = [...this.areals];
        
        // Search filter
        const search = document.getElementById('filter-search')?.value.toLowerCase();
        if (search) {
            filtered = filtered.filter(a => 
                a.name.toLowerCase().includes(search) ||
                a.id.toLowerCase().includes(search) ||
                a.district.toLowerCase().includes(search)
            );
        }
        
        // District filter
        const district = document.getElementById('filter-district')?.value;
        if (district) {
            filtered = filtered.filter(a => a.district === district);
        }
        
        // Category filter
        const category = document.getElementById('filter-category')?.value;
        if (category) {
            if (category === 'none') {
                filtered = filtered.filter(a => !a.category);
            } else {
                filtered = filtered.filter(a => a.category === category);
            }
        }
        
        // Completed filter
        const completed = document.getElementById('filter-completed')?.value;
        if (completed) {
            filtered = filtered.filter(a => a.is_completed === (completed === 'true'));
        }
        
        // Risk filter
        const risk = document.getElementById('filter-risk')?.value;
        if (risk) {
            filtered = filtered.filter(a => this.calculateRiskLevel(a) === risk);
        }
        
        this.updateMap(filtered);
        this.updateStats(filtered);
    }

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-district').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-completed').value = '';
        document.getElementById('filter-risk').value = '';
        
        this.updateMap(this.areals);
        this.updateStats(this.areals);
        
        this.showToast('Filtry resetovány', 'info');
    }

    /**
     * Handle AI query
     */
    async handleAIQuery() {
        const input = document.getElementById('ai-input');
        const query = input?.value.trim();
        
        if (!query) return;
        
        this.addChatMessage(query, 'user');
        input.value = '';
        
        this.showTypingIndicator();
        
        try {
            const result = await aiService.processQuery(query, this.areals);
            this.hideTypingIndicator();
            this.addChatMessage(result.response, 'assistant');
            
            if (result.data?.results) {
                this.updateMap(result.data.results);
                this.updateStats(result.data.results);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addChatMessage('Omlouvám se, došlo k chybě.', 'assistant');
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
        messageDiv.innerHTML = `<div class="message-content">${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
        if (indicator) indicator.remove();
    }

    /**
     * Update element text
     */
    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
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
        if (loader) loader.style.display = 'none';
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            left: 20px;
            max-width: 400px;
            margin: 0 auto;
            padding: 16px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            text-align: center;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
}

// Create global app instance
window.app = new JVSApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.initialize();
    });
} else {
    window.app.initialize();
}

console.log('[JVS App] Module loaded');
