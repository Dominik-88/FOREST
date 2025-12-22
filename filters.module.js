/**
 * JVS Management System - Filters Module
 * Advanced filtering and search functionality
 * Version: 2.0.0
 */

// =============================================
// FILTERS MODULE CLASS
// =============================================

export class FiltersModule {
    constructor() {
        this.areals = [];
        this.isInitialized = false;
        
        // Filter state
        this.currentCriteria = {
            search: '',
            categories: ['I.', 'II.', ''],
            district: '',
            minRisk: 0,
            completed: undefined,
            sortBy: 'area_desc',
            hasActiveFilters: false
        };
        
        // DOM elements
        this.elements = {};
        
        // Event handlers
        this.handlers = {
            search: this.handleSearchInput.bind(this),
            category: this.handleCategoryChange.bind(this),
            district: this.handleDistrictChange.bind(this),
            risk: this.handleRiskChange.bind(this),
            apply: this.handleApplyFilters.bind(this),
            reset: this.handleResetFilters.bind(this)
        };
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    /**
     * Initialize filters module
     */
    async initialize() {
        try {
            console.log('[FiltersModule] Initializing...');
            
            this.cacheElements();
            this.setupEventListeners();
            this.initializeFilterState();
            
            this.isInitialized = true;
            console.log('[FiltersModule] Initialized successfully');
            
        } catch (error) {
            console.error('[FiltersModule] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Search
            searchInput: document.getElementById('searchInput'),
            clearSearch: document.getElementById('clearSearch'),
            
            // Categories
            catI: document.getElementById('catI'),
            catII: document.getElementById('catII'),
            catNone: document.getElementById('catNone'),
            
            // District
            districtFilter: document.getElementById('districtFilter'),
            
            // Risk slider
            riskSlider: document.getElementById('riskSlider'),
            riskValue: document.getElementById('riskValue'),
            
            // Actions
            applyFilters: document.getElementById('applyFilters'),
            resetFilters: document.getElementById('resetFilters'),
            
            // Results
            arealsCount: document.getElementById('arealsCount')
        };
        
        // Validate required elements
        const requiredElements = ['searchInput', 'catI', 'catII', 'catNone', 'applyFilters', 'resetFilters'];
        const missingElements = requiredElements.filter(key => !this.elements[key]);
        
        if (missingElements.length > 0) {
            throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', this.handlers.search);
            this.elements.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleApplyFilters();
                }
            });
        }
        
        // Clear search button
        if (this.elements.clearSearch) {
            this.elements.clearSearch.addEventListener('click', this.clearSearch.bind(this));
        }
        
        // Category checkboxes
        ['catI', 'catII', 'catNone'].forEach(key => {
            if (this.elements[key]) {
                this.elements[key].addEventListener('change', this.handlers.category);
            }
        });
        
        // District select
        if (this.elements.districtFilter) {
            this.elements.districtFilter.addEventListener('change', this.handlers.district);
        }
        
        // Risk slider
        if (this.elements.riskSlider) {
            this.elements.riskSlider.addEventListener('input', this.handlers.risk);
        }
        
        // Action buttons
        if (this.elements.applyFilters) {
            this.elements.applyFilters.addEventListener('click', this.handlers.apply);
        }
        
        if (this.elements.resetFilters) {
            this.elements.resetFilters.addEventListener('click', this.handlers.reset);
        }
    }

    /**
     * Initialize filter state from saved preferences
     */
    initializeFilterState() {
        try {
            const savedFilters = localStorage.getItem('jvs_filters');
            if (savedFilters) {
                const filters = JSON.parse(savedFilters);
                this.applyCriteria(filters);
            }
        } catch (error) {
            console.warn('[FiltersModule] Failed to load saved filters:', error);
        }
        
        // Update UI to match current state
        this.updateUI();
    }

    // =============================================
    // EVENT HANDLERS
    // =============================================

    /**
     * Handle search input
     */
    handleSearchInput() {
        const value = this.elements.searchInput.value.trim();
        this.currentCriteria.search = value;
        
        // Show/hide clear button
        if (this.elements.clearSearch) {
            this.elements.clearSearch.classList.toggle('hidden', !value);
        }
        
        // Auto-apply search with debounce
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    /**
     * Handle category checkbox change
     */
    handleCategoryChange() {
        const categories = [];
        
        if (this.elements.catI && this.elements.catI.checked) {
            categories.push('I.');
        }
        if (this.elements.catII && this.elements.catII.checked) {
            categories.push('II.');
        }
        if (this.elements.catNone && this.elements.catNone.checked) {
            categories.push('');
        }
        
        this.currentCriteria.categories = categories;
        this.applyFilters();
    }

    /**
     * Handle district change
     */
    handleDistrictChange() {
        this.currentCriteria.district = this.elements.districtFilter.value;
        this.applyFilters();
    }

    /**
     * Handle risk slider change
     */
    handleRiskChange() {
        const value = parseInt(this.elements.riskSlider.value);
        this.currentCriteria.minRisk = value;
        
        // Update display
        if (this.elements.riskValue) {
            this.elements.riskValue.textContent = `${value}%`;
        }
        
        this.applyFilters();
    }

    /**
     * Handle apply filters button
     */
    handleApplyFilters() {
        this.applyFilters();
        this.saveFiltersToStorage();
        
        // Show feedback
        this.showApplyFeedback();
    }

    /**
     * Handle reset filters button
     */
    handleResetFilters() {
        this.resetFilters();
        this.saveFiltersToStorage();
        
        // Show feedback
        this.showResetFeedback();
    }

    // =============================================
    // FILTERING LOGIC
    // =============================================

    /**
     * Apply current filters
     */
    applyFilters() {
        if (!this.areals.length) return;
        
        // Update hasActiveFilters flag
        this.updateActiveFiltersFlag();
        
        // Dispatch filter change event
        window.dispatchEvent(new CustomEvent('filterChanged', {
            detail: {
                criteria: { ...this.currentCriteria },
                timestamp: new Date()
            }
        }));
    }

    /**
     * Reset all filters to default
     */
    resetFilters() {
        this.currentCriteria = {
            search: '',
            categories: ['I.', 'II.', ''],
            district: '',
            minRisk: 0,
            completed: undefined,
            sortBy: 'area_desc',
            hasActiveFilters: false
        };
        
        this.updateUI();
        this.applyFilters();
    }

    /**
     * Clear search filter
     */
    clearSearch() {
        this.currentCriteria.search = '';
        this.elements.searchInput.value = '';
        this.elements.clearSearch.classList.add('hidden');
        this.applyFilters();
    }

    /**
     * Update active filters flag
     */
    updateActiveFiltersFlag() {
        const hasSearch = this.currentCriteria.search.length > 0;
        const hasCategories = this.currentCriteria.categories.length < 3;
        const hasDistrict = this.currentCriteria.district !== '';
        const hasRisk = this.currentCriteria.minRisk > 0;
        const hasCompleted = this.currentCriteria.completed !== undefined;
        
        this.currentCriteria.hasActiveFilters = hasSearch || hasCategories || hasDistrict || hasRisk || hasCompleted;
        
        // Update UI indicators
        this.updateFilterIndicators();
    }

    /**
     * Update filter indicators in UI
     */
    updateFilterIndicators() {
        const hasActive = this.currentCriteria.hasActiveFilters;
        
        // Update apply button state
        if (this.elements.applyFilters) {
            this.elements.applyFilters.classList.toggle('btn-warning', hasActive);
            this.elements.applyFilters.classList.toggle('btn-primary', !hasActive);
        }
        
        // Update reset button state
        if (this.elements.resetFilters) {
            this.elements.resetFilters.disabled = !hasActive;
        }
        
        // Update section trigger to show active state
        const filtersSection = document.querySelector('[data-target="filtersSection"]');
        if (filtersSection) {
            filtersSection.classList.toggle('has-active-filters', hasActive);
        }
    }

    // =============================================
    // UI UPDATES
    // =============================================

    /**
     * Update UI to match current criteria
     */
    updateUI() {
        // Search input
        if (this.elements.searchInput) {
            this.elements.searchInput.value = this.currentCriteria.search;
        }
        
        // Clear search button
        if (this.elements.clearSearch) {
            this.elements.clearSearch.classList.toggle('hidden', !this.currentCriteria.search);
        }
        
        // Category checkboxes
        if (this.elements.catI) {
            this.elements.catI.checked = this.currentCriteria.categories.includes('I.');
        }
        if (this.elements.catII) {
            this.elements.catII.checked = this.currentCriteria.categories.includes('II.');
        }
        if (this.elements.catNone) {
            this.elements.catNone.checked = this.currentCriteria.categories.includes('');
        }
        
        // District select
        if (this.elements.districtFilter) {
            this.elements.districtFilter.value = this.currentCriteria.district;
        }
        
        // Risk slider
        if (this.elements.riskSlider) {
            this.elements.riskSlider.value = this.currentCriteria.minRisk;
        }
        if (this.elements.riskValue) {
            this.elements.riskValue.textContent = `${this.currentCriteria.minRisk}%`;
        }
        
        // Update indicators
        this.updateActiveFiltersFlag();
    }

    /**
     * Show apply feedback
     */
    showApplyFeedback() {
        const button = this.elements.applyFilters;
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Použito';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
        }
    }

    /**
     * Show reset feedback
     */
    showResetFeedback() {
        const button = this.elements.resetFilters;
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Resetováno';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
        }
    }

    // =============================================
    // PUBLIC METHODS
    // =============================================

    /**
     * Set areals data
     */
    setAreals(areals) {
        this.areals = areals || [];
        console.log(`[FiltersModule] Set ${this.areals.length} areals`);
    }

    /**
     * Get current filter criteria
     */
    getCurrentCriteria() {
        return { ...this.currentCriteria };
    }

    /**
     * Apply specific criteria
     */
    applyCriteria(criteria) {
        this.currentCriteria = { ...this.currentCriteria, ...criteria };
        this.updateUI();
        this.applyFilters();
    }

    /**
     * Add quick filter preset
     */
    addQuickFilter(name, criteria) {
        // Could be extended to support saved filter presets
        this.applyCriteria(criteria);
    }

    /**
     * Get filter summary text
     */
    getFilterSummary() {
        const parts = [];
        
        if (this.currentCriteria.search) {
            parts.push(`Hledání: "${this.currentCriteria.search}"`);
        }
        
        if (this.currentCriteria.categories.length < 3) {
            const categoryNames = {
                'I.': 'Kategorie I.',
                'II.': 'Kategorie II.',
                '': 'Bez kategorie'
            };
            const selectedCategories = this.currentCriteria.categories
                .map(cat => categoryNames[cat])
                .join(', ');
            parts.push(`Kategorie: ${selectedCategories}`);
        }
        
        if (this.currentCriteria.district) {
            parts.push(`Okres: ${this.currentCriteria.district}`);
        }
        
        if (this.currentCriteria.minRisk > 0) {
            parts.push(`Min. riziko: ${this.currentCriteria.minRisk}%`);
        }
        
        return parts.length > 0 ? parts.join(' • ') : 'Žádné filtry';
    }

    // =============================================
    // PERSISTENCE
    // =============================================

    /**
     * Save filters to localStorage
     */
    saveFiltersToStorage() {
        try {
            localStorage.setItem('jvs_filters', JSON.stringify(this.currentCriteria));
        } catch (error) {
            console.warn('[FiltersModule] Failed to save filters:', error);
        }
    }

    /**
     * Load filters from localStorage
     */
    loadFiltersFromStorage() {
        try {
            const saved = localStorage.getItem('jvs_filters');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('[FiltersModule] Failed to load filters:', error);
        }
        return null;
    }

    // =============================================
    // ADVANCED FEATURES
    // =============================================

    /**
     * Get search suggestions based on areals data
     */
    getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];
        
        const queryLower = query.toLowerCase();
        const suggestions = new Set();
        
        this.areals.forEach(areal => {
            // Name suggestions
            if (areal.name.toLowerCase().includes(queryLower)) {
                suggestions.add(areal.name);
            }
            
            // District suggestions
            if (areal.district.toLowerCase().includes(queryLower)) {
                suggestions.add(areal.district);
            }
            
            // Notes suggestions (keywords)
            if (areal.notes) {
                const words = areal.notes.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3 && word.includes(queryLower)) {
                        suggestions.add(word);
                    }
                });
            }
        });
        
        return Array.from(suggestions).slice(0, 10);
    }

    /**
     * Get filter statistics
     */
    getFilterStats() {
        const total = this.areals.length;
        const categories = {
            'I.': this.areals.filter(a => a.category === 'I.').length,
            'II.': this.areals.filter(a => a.category === 'II.').length,
            '': this.areals.filter(a => !a.category).length
        };
        
        const districts = {};
        this.areals.forEach(areal => {
            districts[areal.district] = (districts[areal.district] || 0) + 1;
        });
        
        const completed = this.areals.filter(a => a.is_completed).length;
        
        return {
            total,
            categories,
            districts,
            completed,
            remaining: total - completed
        };
    }

    // =============================================
    // CLEANUP
    // =============================================

    /**
     * Destroy filters module
     */
    destroy() {
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Remove event listeners
        Object.keys(this.elements).forEach(key => {
            const element = this.elements[key];
            if (element) {
                element.removeEventListener('input', this.handlers.search);
                element.removeEventListener('change', this.handlers.category);
                element.removeEventListener('change', this.handlers.district);
                element.removeEventListener('input', this.handlers.risk);
                element.removeEventListener('click', this.handlers.apply);
                element.removeEventListener('click', this.handlers.reset);
            }
        });
        
        // Clear references
        this.areals = [];
        this.elements = {};
        this.isInitialized = false;
        
        console.log('[FiltersModule] Destroyed');
    }
}

export default FiltersModule;