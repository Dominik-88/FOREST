/**
 * JVS Management System - Centralized State Management
 * Reactive state using Proxy pattern
 * Version: 2.0.0
 */

class StateManager {
    constructor() {
        this.listeners = new Map();
        this.state = this.createReactiveState({
            // Application state
            isInitialized: false,
            isOnline: navigator.onLine,
            isLoading: false,
            
            // Data state
            areals: [],
            filteredAreals: [],
            selectedAreal: null,
            
            // Filter state
            filters: {
                search: '',
                categories: ['I.', 'II.', ''],
                district: '',
                riskLevel: 0,
                showCompleted: true
            },
            
            // Route state
            route: {
                points: [],
                distance: 0,
                duration: 0,
                polyline: null
            },
            
            // Map state
            map: {
                center: [49.2, 14.4],
                zoom: 9,
                bounds: null
            },
            
            // Statistics
            stats: {
                total: 0,
                completed: 0,
                highRisk: 0,
                totalArea: 0,
                totalFence: 0
            },
            
            // UI state
            ui: {
                sidebarOpen: true,
                activeSection: null,
                theme: 'light'
            },
            
            // GPS state
            gps: {
                enabled: false,
                position: null,
                accuracy: null,
                heading: null
            }
        });
    }

    /**
     * Create reactive state with Proxy
     */
    createReactiveState(initialState) {
        const handler = {
            set: (target, property, value) => {
                const oldValue = target[property];
                target[property] = value;
                
                // Notify listeners
                this.notify(property, value, oldValue);
                
                return true;
            },
            
            get: (target, property) => {
                const value = target[property];
                
                // If value is object, make it reactive too
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    return new Proxy(value, handler);
                }
                
                return value;
            }
        };
        
        return new Proxy(initialState, handler);
    }

    /**
     * Subscribe to state changes
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        
        this.listeners.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(path);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify listeners of state change
     */
    notify(path, newValue, oldValue) {
        const callbacks = this.listeners.get(path);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`[State] Error in listener for ${path}:`, error);
                }
            });
        }
        
        // Notify wildcard listeners
        const wildcardCallbacks = this.listeners.get('*');
        if (wildcardCallbacks) {
            wildcardCallbacks.forEach(callback => {
                try {
                    callback(path, newValue, oldValue);
                } catch (error) {
                    console.error('[State] Error in wildcard listener:', error);
                }
            });
        }
    }

    /**
     * Get current state value
     */
    get(path) {
        const keys = path.split('.');
        let value = this.state;
        
        for (const key of keys) {
            value = value[key];
            if (value === undefined) break;
        }
        
        return value;
    }

    /**
     * Set state value
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let target = this.state;
        
        for (const key of keys) {
            if (!target[key]) {
                target[key] = {};
            }
            target = target[key];
        }
        
        target[lastKey] = value;
    }

    /**
     * Update state (merge)
     */
    update(path, updates) {
        const current = this.get(path);
        if (typeof current === 'object' && !Array.isArray(current)) {
            this.set(path, { ...current, ...updates });
        } else {
            this.set(path, updates);
        }
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this.state.filters = {
            search: '',
            categories: ['I.', 'II.', ''],
            district: '',
            riskLevel: 0,
            showCompleted: true
        };
        this.state.route = {
            points: [],
            distance: 0,
            duration: 0,
            polyline: null
        };
        this.state.selectedAreal = null;
    }
}

// Export singleton instance
export const stateManager = new StateManager();
export const state = stateManager.state;
