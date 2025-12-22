/**
 * Bottom Sheet Component
 * Mobile-friendly sliding panel for areal details
 * Version: 1.0.0
 */

export class BottomSheetComponent {
    constructor() {
        this.container = null;
        this.overlay = null;
        this.isOpen = false;
        this.currentAreal = null;
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
    }

    /**
     * Initialize bottom sheet
     */
    async initialize() {
        try {
            console.log('[BottomSheet] Initializing...');
            
            // Create bottom sheet HTML
            this.createBottomSheet();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('[BottomSheet] Initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('[BottomSheet] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create bottom sheet HTML structure
     */
    createBottomSheet() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'bottom-sheet-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 999;
        `;
        
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'bottom-sheet';
        this.container.style.cssText = `
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
            transform: translateY(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            max-height: 85vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        // Create handle
        const handle = document.createElement('div');
        handle.className = 'bottom-sheet-handle';
        handle.style.cssText = `
            width: 40px;
            height: 4px;
            background: #ddd;
            border-radius: 2px;
            margin: 12px auto 8px;
            cursor: grab;
        `;
        
        // Create header
        const header = document.createElement('div');
        header.className = 'bottom-sheet-header';
        header.style.cssText = `
            padding: 0 20px 16px;
            border-bottom: 1px solid #eee;
            flex-shrink: 0;
        `;
        
        // Create content
        const content = document.createElement('div');
        content.className = 'bottom-sheet-content';
        content.style.cssText = `
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        `;
        
        // Create footer
        const footer = document.createElement('div');
        footer.className = 'bottom-sheet-footer';
        footer.style.cssText = `
            padding: 16px 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 12px;
            flex-shrink: 0;
        `;
        
        // Assemble
        this.container.appendChild(handle);
        this.container.appendChild(header);
        this.container.appendChild(content);
        this.container.appendChild(footer);
        
        // Add to DOM
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.container);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Overlay click to close
        this.overlay.addEventListener('click', () => {
            this.hide();
        });
        
        // Handle drag events
        const handle = this.container.querySelector('.bottom-sheet-handle');
        
        handle.addEventListener('touchstart', (e) => {
            this.handleDragStart(e.touches[0].clientY);
        });
        
        handle.addEventListener('touchmove', (e) => {
            this.handleDragMove(e.touches[0].clientY);
        });
        
        handle.addEventListener('touchend', () => {
            this.handleDragEnd();
        });
        
        // Mouse events for desktop
        handle.addEventListener('mousedown', (e) => {
            this.handleDragStart(e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDragMove(e.clientY);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.handleDragEnd();
            }
        });
        
        // Prevent body scroll when sheet is open
        this.container.addEventListener('touchmove', (e) => {
            const content = this.container.querySelector('.bottom-sheet-content');
            if (content.scrollTop === 0 && e.touches[0].clientY > this.startY) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Handle drag start
     */
    handleDragStart(y) {
        this.isDragging = true;
        this.startY = y;
        this.currentY = y;
        
        const handle = this.container.querySelector('.bottom-sheet-handle');
        handle.style.cursor = 'grabbing';
    }

    /**
     * Handle drag move
     */
    handleDragMove(y) {
        if (!this.isDragging) return;
        
        this.currentY = y;
        const deltaY = this.currentY - this.startY;
        
        // Only allow dragging down
        if (deltaY > 0) {
            this.container.style.transform = `translateY(${deltaY}px)`;
        }
    }

    /**
     * Handle drag end
     */
    handleDragEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const deltaY = this.currentY - this.startY;
        
        const handle = this.container.querySelector('.bottom-sheet-handle');
        handle.style.cursor = 'grab';
        
        // If dragged down more than 100px, close
        if (deltaY > 100) {
            this.hide();
        } else {
            // Snap back
            this.container.style.transform = 'translateY(0)';
        }
    }

    /**
     * Show bottom sheet with areal data
     */
    show(areal) {
        this.currentAreal = areal;
        
        // Update content
        this.updateContent(areal);
        
        // Show overlay
        this.overlay.style.opacity = '1';
        this.overlay.style.visibility = 'visible';
        
        // Show sheet
        setTimeout(() => {
            this.container.style.transform = 'translateY(0)';
        }, 10);
        
        this.isOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide bottom sheet
     */
    hide() {
        // Hide sheet
        this.container.style.transform = 'translateY(100%)';
        
        // Hide overlay
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
        
        this.isOpen = false;
        this.currentAreal = null;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Update content with areal data
     */
    updateContent(areal) {
        const header = this.container.querySelector('.bottom-sheet-header');
        const content = this.container.querySelector('.bottom-sheet-content');
        const footer = this.container.querySelector('.bottom-sheet-footer');
        
        // Update header
        header.innerHTML = `
            <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                ${areal.name}
            </h2>
            <p style="margin: 4px 0 0; font-size: 14px; color: #666;">
                ${areal.id.toUpperCase()} • ${this.getDistrictName(areal.district)}
            </p>
        `;
        
        // Calculate risk
        const riskLevel = this.calculateRiskLevel(areal);
        const riskInfo = this.getRiskInfo(riskLevel);
        
        // Update content
        content.innerHTML = `
            <div class="areal-details">
                <!-- Risk Badge -->
                <div style="display: inline-block; padding: 6px 12px; border-radius: 20px; 
                            background: ${riskInfo.bgColor}; color: ${riskInfo.color}; 
                            font-size: 12px; font-weight: 600; margin-bottom: 16px;">
                    ${riskInfo.icon} ${riskInfo.label}
                </div>
                
                <!-- Basic Info -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Kategorie</div>
                        <div style="font-size: 16px; font-weight: 600;">
                            ${areal.category || 'Bez kategorie'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Stav</div>
                        <div style="font-size: 16px; font-weight: 600;">
                            ${areal.is_completed ? '✅ Dokončeno' : '🔄 Nedokončeno'}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Plocha</div>
                        <div style="font-size: 16px; font-weight: 600;">
                            ${areal.area_sqm?.toLocaleString('cs-CZ') || 0} m²
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Oplocení</div>
                        <div style="font-size: 16px; font-weight: 600;">
                            ${areal.fence_length?.toLocaleString('cs-CZ') || 0} m
                        </div>
                    </div>
                </div>
                
                <!-- Maintenance Info -->
                <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Poslední údržba</div>
                    <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">
                        ${this.formatMaintenanceDate(areal.last_maintenance)}
                    </div>
                </div>
                
                <!-- Location -->
                ${areal.lat && areal.lng ? `
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Souřadnice</div>
                        <div style="font-size: 14px; font-family: monospace;">
                            ${areal.lat.toFixed(6)}, ${areal.lng.toFixed(6)}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Notes -->
                ${areal.notes ? `
                    <div style="margin-top: 16px;">
                        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Poznámky</div>
                        <div style="font-size: 14px; line-height: 1.6; color: #333;">
                            ${areal.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Update footer with action buttons
        footer.innerHTML = `
            <button class="btn btn-secondary" onclick="window.bottomSheet.hide()" style="flex: 1;">
                Zavřít
            </button>
            <button class="btn btn-primary" onclick="window.bottomSheet.navigateToAreal()" style="flex: 1;">
                📍 Navigovat
            </button>
            <button class="btn btn-primary" onclick="window.bottomSheet.addToRoute()" style="flex: 1;">
                ➕ Do trasy
            </button>
        `;
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
     * Get risk info
     */
    getRiskInfo(level) {
        const riskMap = {
            critical: { label: 'Kritické riziko', icon: '🔴', color: '#fff', bgColor: '#dc3545' },
            high: { label: 'Vysoké riziko', icon: '🟠', color: '#fff', bgColor: '#fd7e14' },
            medium: { label: 'Střední riziko', icon: '🟡', color: '#000', bgColor: '#ffc107' },
            low: { label: 'Nízké riziko', icon: '🟢', color: '#fff', bgColor: '#28a745' }
        };
        
        return riskMap[level] || riskMap.low;
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
     * Format maintenance date
     */
    formatMaintenanceDate(date) {
        if (!date) return 'Neznámé';
        
        const maintenanceDate = date.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diffTime = now - maintenanceDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let formatted = maintenanceDate.toLocaleDateString('cs-CZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (diffDays < 30) {
            formatted += ` (před ${diffDays} dny)`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            formatted += ` (před ${months} měsíci)`;
        } else {
            const years = Math.floor(diffDays / 365);
            formatted += ` (před ${years} roky)`;
        }
        
        return formatted;
    }

    /**
     * Navigate to areal
     */
    navigateToAreal() {
        if (!this.currentAreal) return;
        
        window.dispatchEvent(new CustomEvent('navigateToAreal', {
            detail: { areal: this.currentAreal }
        }));
        
        this.hide();
    }

    /**
     * Add to route
     */
    addToRoute() {
        if (!this.currentAreal) return;
        
        window.dispatchEvent(new CustomEvent('addToRoute', {
            detail: { arealId: this.currentAreal.id }
        }));
        
        this.hide();
    }
}

// Make globally accessible
window.bottomSheet = null;
