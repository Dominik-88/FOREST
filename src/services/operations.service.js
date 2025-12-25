/**
 * Operations Service - Operational management for areals
 * Handles mowing completion, service book, and maintenance tracking
 * 
 * @version 4.0.0
 */

export class OperationsService {
    constructor() {
        this.storagePrefix = 'jvs_ops_';
    }
    
    /**
     * Complete mowing for an areal
     */
    completeMowing(arealId, worker, note = '') {
        const entry = {
            id: Date.now(),
            arealId,
            type: 'mowing',
            worker,
            note,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        // Save to service history
        this.addServiceEntry(arealId, entry);
        
        // Update last mowing timestamp
        localStorage.setItem(`mowing_${arealId}`, Date.now().toString());
        
        console.log('✅ Mowing completed:', entry);
        
        return entry;
    }
    
    /**
     * Add service entry to history
     */
    addServiceEntry(arealId, entry) {
        const history = this.getServiceHistory(arealId);
        history.unshift(entry); // Add to beginning
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.length = 50;
        }
        
        localStorage.setItem(
            `${this.storagePrefix}history_${arealId}`,
            JSON.stringify(history)
        );
    }
    
    /**
     * Get service history for an areal
     */
    getServiceHistory(arealId) {
        const stored = localStorage.getItem(`${this.storagePrefix}history_${arealId}`);
        if (!stored) return [];
        
        try {
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error parsing service history:', error);
            return [];
        }
    }
    
    /**
     * Get areal status (pending, mowed, overdue)
     */
    getArealStatus(arealId, frequency = 21) {
        const lastMowing = localStorage.getItem(`mowing_${arealId}`);
        
        if (!lastMowing) {
            return 'pending';
        }
        
        const daysSince = (Date.now() - parseInt(lastMowing)) / (1000 * 60 * 60 * 24);
        
        if (daysSince > frequency) {
            return 'overdue';
        }
        
        if (daysSince < frequency * 0.8) {
            return 'mowed';
        }
        
        return 'pending';
    }
    
    /**
     * Get all areals by status
     */
    getArealsByStatus(areals, status) {
        return areals.filter(areal => {
            const arealStatus = this.getArealStatus(areal.id, areal.frekvenceUdrzby);
            return arealStatus === status;
        });
    }
    
    /**
     * Get mowing statistics
     */
    getMowingStats(areals) {
        const today = new Date().setHours(0, 0, 0, 0);
        
        let mowedToday = 0;
        let mowedThisWeek = 0;
        let mowedThisMonth = 0;
        
        areals.forEach(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            if (!lastMowing) return;
            
            const mowingDate = new Date(parseInt(lastMowing));
            const mowingDay = mowingDate.setHours(0, 0, 0, 0);
            
            if (mowingDay === today) {
                mowedToday++;
            }
            
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            if (parseInt(lastMowing) > weekAgo) {
                mowedThisWeek++;
            }
            
            const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            if (parseInt(lastMowing) > monthAgo) {
                mowedThisMonth++;
            }
        });
        
        return {
            mowedToday,
            mowedThisWeek,
            mowedThisMonth,
            pending: areals.length - mowedThisMonth,
            overdue: this.getArealsByStatus(areals, 'overdue').length
        };
    }
    
    /**
     * Get next maintenance date for an areal
     */
    getNextMaintenanceDate(arealId, frequency = 21) {
        const lastMowing = localStorage.getItem(`mowing_${arealId}`);
        
        if (!lastMowing) {
            return new Date(); // Now
        }
        
        const nextDate = new Date(parseInt(lastMowing));
        nextDate.setDate(nextDate.getDate() + frequency);
        
        return nextDate;
    }
    
    /**
     * Get areals needing maintenance soon (within days)
     */
    getUpcomingMaintenance(areals, days = 7) {
        const upcoming = [];
        const now = Date.now();
        const threshold = now + (days * 24 * 60 * 60 * 1000);
        
        areals.forEach(areal => {
            const nextDate = this.getNextMaintenanceDate(areal.id, areal.frekvenceUdrzby);
            const nextTimestamp = nextDate.getTime();
            
            if (nextTimestamp > now && nextTimestamp <= threshold) {
                upcoming.push({
                    areal,
                    nextDate,
                    daysUntil: Math.ceil((nextTimestamp - now) / (24 * 60 * 60 * 1000))
                });
            }
        });
        
        // Sort by days until maintenance
        upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
        
        return upcoming;
    }
    
    /**
     * Add custom service entry (not mowing)
     */
    addCustomService(arealId, type, worker, note = '') {
        const entry = {
            id: Date.now(),
            arealId,
            type,
            worker,
            note,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        this.addServiceEntry(arealId, entry);
        
        console.log('✅ Custom service added:', entry);
        
        return entry;
    }
    
    /**
     * Get service statistics for an areal
     */
    getArealServiceStats(arealId) {
        const history = this.getServiceHistory(arealId);
        
        const stats = {
            totalServices: history.length,
            mowingCount: history.filter(e => e.type === 'mowing').length,
            lastService: history[0] || null,
            averageInterval: 0
        };
        
        // Calculate average interval between services
        if (history.length > 1) {
            const intervals = [];
            for (let i = 0; i < history.length - 1; i++) {
                const interval = history[i].timestamp - history[i + 1].timestamp;
                intervals.push(interval);
            }
            
            const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
            stats.averageInterval = Math.round(avgInterval / (24 * 60 * 60 * 1000)); // Convert to days
        }
        
        return stats;
    }
    
    /**
     * Export service history to CSV
     */
    exportServiceHistory(arealId) {
        const history = this.getServiceHistory(arealId);
        
        if (history.length === 0) {
            return null;
        }
        
        const headers = ['Datum', 'Typ', 'Pracovník', 'Poznámka'];
        const rows = history.map(entry => [
            new Date(entry.date).toLocaleString('cs-CZ'),
            entry.type,
            entry.worker,
            entry.note || ''
        ]);
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        return csv;
    }
    
    /**
     * Clear all service history (use with caution!)
     */
    clearAllHistory() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix) || key.startsWith('mowing_')) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('⚠️ All service history cleared');
    }
    
    /**
     * Get worker statistics
     */
    getWorkerStats() {
        const workers = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(`${this.storagePrefix}history_`)) {
                const history = JSON.parse(localStorage.getItem(key) || '[]');
                
                history.forEach(entry => {
                    if (!workers[entry.worker]) {
                        workers[entry.worker] = {
                            name: entry.worker,
                            totalServices: 0,
                            mowingCount: 0,
                            lastService: null
                        };
                    }
                    
                    workers[entry.worker].totalServices++;
                    
                    if (entry.type === 'mowing') {
                        workers[entry.worker].mowingCount++;
                    }
                    
                    if (!workers[entry.worker].lastService || 
                        entry.timestamp > workers[entry.worker].lastService.timestamp) {
                        workers[entry.worker].lastService = entry;
                    }
                });
            }
        });
        
        return Object.values(workers).sort((a, b) => b.totalServices - a.totalServices);
    }
    
    /**
     * Get maintenance calendar (next 30 days)
     */
    getMaintenanceCalendar(areals) {
        const calendar = [];
        const now = Date.now();
        const thirtyDays = now + (30 * 24 * 60 * 60 * 1000);
        
        areals.forEach(areal => {
            const nextDate = this.getNextMaintenanceDate(areal.id, areal.frekvenceUdrzby);
            const nextTimestamp = nextDate.getTime();
            
            if (nextTimestamp >= now && nextTimestamp <= thirtyDays) {
                calendar.push({
                    date: nextDate,
                    areal: areal,
                    daysUntil: Math.ceil((nextTimestamp - now) / (24 * 60 * 60 * 1000))
                });
            }
        });
        
        // Sort by date
        calendar.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        return calendar;
    }
}