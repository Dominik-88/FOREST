/**
 * Enhanced Filters Module
 * Real-time filtering with dynamic statistics
 * Version: 3.0.0
 */

/**
 * Enhanced Filters Module Class
 */
export class FiltersModuleEnhanced {
    constructor() {
        this.areals = [];
        this.filteredAreals = [];
        this.currentFilters = {
            district: null,
            category: null,
            completed: null,
            search: '',
            riskLevel: null
        };
        this.searchDebounceTimer = null;
        this.onFilterChange = null;
    }

    /**
     * Initialize filters module
     */
    async initialize() {
        try {
            console.log('[Filters] Initializing...');
            
            // Setup UI elements
            this.setupFilterControls();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('[Filters] Initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('[Filters] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup filter controls
     */
    setupFilterControls() {
        // District filter
        this.districtSelect = document.getElementById('filter-district');
        
        // Category filter
        this.categorySelect = document.getElementById('filter-category');
        
        // Completion filter
        this.completedSelect = document.getElementById('filter-completed');
        
        // Risk level filter
        this.riskSelect = document.getElementById('filter-risk');
        
        // Search input
        this.searchInput = document.getElementById('filter-search');
        
        // Reset button
        this.resetButton = document.getElementById('filter-reset');
        
        // Stats elements
        this.statsTotal = document.getElementById('stats-total');
        this.statsTotalArea = document.getElementById('stats-total-area');
        this.statsCompleted = document.getElementById('stats-completed');
        this.statsHighRisk = document.getElementById('stats-high-risk');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // District filter
        if (this.districtSelect) {
            this.districtSelect.addEventListener('change', (e) => {
                this.currentFilters.district = e.target.value || null;
                this.applyFilters();
            });
        }
        
        // Category filter
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value === 'none' ? '' : (e.target.value || null);
                this.applyFilters();
            });
        }
        
        // Completion filter
        if (this.completedSelect) {
            this.completedSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                this.currentFilters.completed = value === '' ? null : value === 'true';
                this.applyFilters();
            });
        }
        
        // Risk level filter
        if (this.riskSelect) {
            this.riskSelect.addEventListener('change', (e) => {
                this.currentFilters.riskLevel = e.target.value || null;
                this.applyFilters();
            });
        }
        
        // Search input with debounce
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
        
        // Reset button
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    /**
     * Handle search input with debounce
     */
    handleSearchInput(value) {
        // Clear previous timer
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
        }
        
        // Set new timer (300ms debounce)
        this.searchDebounceTimer = setTimeout(() => {
            this.currentFilters.search = value.toLowerCase().trim();
            this.applyFilters();
        }, 300);
    }

    /**
     * Set areals data
     */
    setAreals(areals) {
        this.areals = areals;
        this.applyFilters();
    }

    /**
     * Apply all filters
     */
    applyFilters() {
        let filtered = [...this.areals];
        
        // District filter
        if (this.currentFilters.district) {
            filtered = filtered.filter(a => a.district === this.currentFilters.district);
        }
        
        // Category filter
        if (this.currentFilters.category !== null) {
            filtered = filtered.filter(a => a.category === this.currentFilters.category);
        }
        
        // Completion filter
        if (this.currentFilters.completed !== null) {
            filtered = filtered.filter(a => a.is_completed === this.currentFilters.completed);
        }
        
        // Risk level filter
        if (this.currentFilters.riskLevel) {
            filtered = filtered.filter(a => {
                const risk = this.calculateRiskLevel(a);
                return risk === this.currentFilters.riskLevel;
            });
        }
        
        // Search filter
        if (this.currentFilters.search) {
            filtered = filtered.filter(a => {
                const searchStr = this.currentFilters.search;
                return (
                    a.name.toLowerCase().includes(searchStr) ||
                    a.id.toLowerCase().includes(searchStr) ||
                    a.district.toLowerCase().includes(searchStr) ||
                    (a.notes && a.notes.toLowerCase().includes(searchStr))
                );
            });
        }
        
        this.filteredAreals = filtered;
        
        // Update statistics
        this.updateStatistics();
        
        // Update UI
        this.updateFilterUI();
        
        // Notify listeners
        if (this.onFilterChange) {
            this.onFilterChange(this.filteredAreals, this.currentFilters);
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('filtersChanged', {
            detail: {
                filtered: this.filteredAreals,
                filters: this.currentFilters,
                stats: this.calculateStats(this.filteredAreals)
            }
        }));
    }

    /**
     * Calculate risk level for areal
     */
    calculateRiskLevel(areal) {
        let score = 0;
        
        // Category risk
        if (areal.category === 'I.') score += 40;
        else if (areal.category === 'II.') score += 20;
        
        // Maintenance age risk
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
        
        // Completion status
        if (!areal.is_completed) score += 20;
        
        // Determine level
        if (score >= 70) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 30) return 'medium';
        return 'low';
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = this.calculateStats(this.filteredAreals);
        
        // Update total count
        if (this.statsTotal) {
            this.statsTotal.textContent = stats.total;
            this.animateNumber(this.statsTotal, stats.total);
        }
        
        // Update total area
        if (this.statsTotalArea) {
            const areaText = `${stats.totalArea.toLocaleString('cs-CZ')} m²`;
            this.statsTotalArea.textContent = areaText;
        }
        
        // Update completed count
        if (this.statsCompleted) {
            this.statsCompleted.textContent = `${stats.completed} (${stats.completedPercent}%)`;
        }
        
        // Update high risk count
        if (this.statsHighRisk) {
            this.statsHighRisk.textContent = stats.highRisk;
            
            // Add warning class if high risk count is significant
            if (stats.highRisk > 0) {
                this.statsHighRisk.classList.add('text-danger');
            } else {
                this.statsHighRisk.classList.remove('text-danger');
            }
        }
    }

    /**
     * Calculate statistics
     */
    calculateStats(areals) {
        const total = areals.length;
        const totalArea = areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
        const completed = areals.filter(a => a.is_completed).length;
        const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const highRisk = areals.filter(a => {
            const risk = this.calculateRiskLevel(a);
            return risk === 'critical' || risk === 'high';
        }).length;
        
        return {
            total,
            totalArea,
            completed,
            completedPercent,
            highRisk
        };
    }

    /**
     * Animate number change
     */
    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const duration = 300;
        const steps = 20;
        const stepValue = (targetValue - currentValue) / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            const newValue = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = newValue;
            
            if (currentStep >= steps) {
                element.textContent = targetValue;
                clearInterval(interval);
            }
        }, stepDuration);
    }

    /**
     * Update filter UI state
     */
    updateFilterUI() {
        // Update reset button state
        if (this.resetButton) {
            const hasActiveFilters = this.hasActiveFilters();
            this.resetButton.disabled = !hasActiveFilters;
            
            if (hasActiveFilters) {
                this.resetButton.classList.add('active');
            } else {
                this.resetButton.classList.remove('active');
            }
        }
        
        // Update filter count badge
        this.updateFilterBadge();
    }

    /**
     * Update filter count badge
     */
    updateFilterBadge() {
        const badge = document.getElementById('filter-count-badge');
        if (!badge) return;
        
        const activeCount = this.getActiveFilterCount();
        
        if (activeCount > 0) {
            badge.textContent = activeCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Get active filter count
     */
    getActiveFilterCount() {
        let count = 0;
        
        if (this.currentFilters.district) count++;
        if (this.currentFilters.category !== null) count++;
        if (this.currentFilters.completed !== null) count++;
        if (this.currentFilters.riskLevel) count++;
        if (this.currentFilters.search) count++;
        
        return count;
    }

    /**
     * Check if has active filters
     */
    hasActiveFilters() {
        return this.getActiveFilterCount() > 0;
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        // Reset filter values
        this.currentFilters = {
            district: null,
            category: null,
            completed: null,
            search: '',
            riskLevel: null
        };
        
        // Reset UI controls
        if (this.districtSelect) this.districtSelect.value = '';
        if (this.categorySelect) this.categorySelect.value = '';
        if (this.completedSelect) this.completedSelect.value = '';
        if (this.riskSelect) this.riskSelect.value = '';
        if (this.searchInput) this.searchInput.value = '';
        
        // Apply filters (will show all areals)
        this.applyFilters();
        
        // Show toast notification
        this.showToast('Filtry byly resetovány', 'info');
    }

    /**
     * Get current filter criteria
     */
    getCurrentCriteria() {
        return {
            ...this.currentFilters,
            hasActiveFilters: this.hasActiveFilters()
        };
    }

    /**
     * Get filtered areals
     */
    getFilteredAreals() {
        return this.filteredAreals;
    }

    /**
     * Set filter change callback
     */
    setOnFilterChange(callback) {
        this.onFilterChange = callback;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const event = new CustomEvent('showToast', {
            detail: { message, type }
        });
        window.dispatchEvent(event);
    }

    /**
     * Export filtered data
     */
    exportFiltered(format = 'csv') {
        const event = new CustomEvent('exportData', {
            detail: {
                format,
                data: this.filteredAreals
            }
        });
        window.dispatchEvent(event);
    }
}
