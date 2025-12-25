/**
 * Data Service - Data management and statistics
 * 
 * @version 4.0.0
 */

export class DataService {
    constructor() {
        this.dataUrl = './data/areals-2025-updated.json';
        this.areals = [];
    }
    
    /**
     * Load areals from JSON
     */
    async loadAreals() {
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.areals = await response.json();
            console.log(`✅ Loaded ${this.areals.length} areals`);
            
            return this.areals;
            
        } catch (error) {
            console.error('❌ Failed to load areals:', error);
            
            // Return empty array on error
            return [];
        }
    }
    
    /**
     * Get areal by ID
     */
    getArealById(id) {
        return this.areals.find(a => a.id === id);
    }
    
    /**
     * Calculate statistics
     */
    calculateStats(areals) {
        if (!areals || areals.length === 0) {
            return {
                totalArea: 0,
                totalFence: 0,
                avgPriority: 0,
                totalCost: 0,
                mowedToday: 0,
                pending: 0
            };
        }
        
        const totalArea = areals.reduce((sum, a) => sum + a.vymera, 0);
        const totalFence = areals.reduce((sum, a) => sum + a.oploceni, 0);
        const avgPriority = Math.round(areals.reduce((sum, a) => sum + a.priorita, 0) / areals.length);
        const totalCost = areals.reduce((sum, a) => sum + (a.naklady || 0), 0);
        
        // Count mowed today
        const today = new Date().setHours(0, 0, 0, 0);
        let mowedToday = 0;
        
        areals.forEach(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            if (lastMowing) {
                const mowingDate = new Date(parseInt(lastMowing));
                const mowingDay = mowingDate.setHours(0, 0, 0, 0);
                if (mowingDay === today) {
                    mowedToday++;
                }
            }
        });
        
        const pending = areals.length - mowedToday;
        
        return {
            totalArea,
            totalFence,
            avgPriority,
            totalCost,
            mowedToday,
            pending
        };
    }
    
    /**
     * Filter areals
     */
    filterAreals(areals, filters) {
        return areals.filter(areal => {
            // Search filter
            if (filters.search) {
                const search = filters.search.toLowerCase();
                if (!areal.nazev.toLowerCase().includes(search) &&
                    !areal.okres.toLowerCase().includes(search)) {
                    return false;
                }
            }
            
            // District filter
            if (filters.district && areal.okres !== filters.district) {
                return false;
            }
            
            // Category filter
            if (filters.category) {
                if (filters.category === 'none' && areal.kategorie) {
                    return false;
                }
                if (filters.category !== 'none' && areal.kategorie !== filters.category) {
                    return false;
                }
            }
            
            // Priority filter
            if (filters.minPriority && areal.priorita < filters.minPriority) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Sort areals
     */
    sortAreals(areals, sortBy, ascending = false) {
        const sorted = [...areals];
        
        sorted.sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'name':
                    aVal = a.nazev.toLowerCase();
                    bVal = b.nazev.toLowerCase();
                    return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    
                case 'area':
                    aVal = a.vymera;
                    bVal = b.vymera;
                    break;
                    
                case 'priority':
                    aVal = a.priorita;
                    bVal = b.priorita;
                    break;
                    
                case 'cost':
                    aVal = a.naklady || 0;
                    bVal = b.naklady || 0;
                    break;
                    
                case 'district':
                    aVal = a.okres;
                    bVal = b.okres;
                    return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    
                default:
                    return 0;
            }
            
            return ascending ? aVal - bVal : bVal - aVal;
        });
        
        return sorted;
    }
    
    /**
     * Get areals by district
     */
    getArealsByDistrict(district) {
        return this.areals.filter(a => a.okres === district);
    }
    
    /**
     * Get areals by category
     */
    getArealsByCategory(category) {
        if (category === 'none') {
            return this.areals.filter(a => !a.kategorie);
        }
        return this.areals.filter(a => a.kategorie === category);
    }
    
    /**
     * Get district statistics
     */
    getDistrictStats() {
        const districts = {};
        
        this.areals.forEach(areal => {
            if (!districts[areal.okres]) {
                districts[areal.okres] = {
                    name: areal.okres,
                    count: 0,
                    totalArea: 0,
                    totalFence: 0,
                    avgPriority: 0,
                    totalCost: 0
                };
            }
            
            districts[areal.okres].count++;
            districts[areal.okres].totalArea += areal.vymera;
            districts[areal.okres].totalFence += areal.oploceni;
            districts[areal.okres].totalCost += areal.naklady || 0;
        });
        
        // Calculate average priority
        Object.keys(districts).forEach(district => {
            const districtAreals = this.getArealsByDistrict(district);
            districts[district].avgPriority = Math.round(
                districtAreals.reduce((sum, a) => sum + a.priorita, 0) / districtAreals.length
            );
        });
        
        return Object.values(districts);
    }
    
    /**
     * Get category statistics
     */
    getCategoryStats() {
        const categories = {
            'I.': { name: 'Kategorie I.', count: 0, totalArea: 0, avgPriority: 0 },
            'II.': { name: 'Kategorie II.', count: 0, totalArea: 0, avgPriority: 0 },
            'none': { name: 'Bez kategorie', count: 0, totalArea: 0, avgPriority: 0 }
        };
        
        this.areals.forEach(areal => {
            const cat = areal.kategorie || 'none';
            if (categories[cat]) {
                categories[cat].count++;
                categories[cat].totalArea += areal.vymera;
            }
        });
        
        // Calculate average priority
        ['I.', 'II.', 'none'].forEach(cat => {
            const catAreals = this.getArealsByCategory(cat);
            if (catAreals.length > 0) {
                categories[cat].avgPriority = Math.round(
                    catAreals.reduce((sum, a) => sum + a.priorita, 0) / catAreals.length
                );
            }
        });
        
        return Object.values(categories);
    }
}