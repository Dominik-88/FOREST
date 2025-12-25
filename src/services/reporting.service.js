/**
 * Reporting Service - Advanced reporting and exports
 * 
 * @version 4.0.0
 */

export class ReportingService {
    constructor() {
        this.storagePrefix = 'jvs_ops_';
    }
    
    /**
     * Export areals to CSV
     */
    exportCSV(areals) {
        const headers = [
            'ID',
            'Název',
            'Okres',
            'Kategorie',
            'Výměra (m²)',
            'Oplocení (bm)',
            'Priorita',
            'Náklady (Kč)',
            'Poslední seč',
            'Stav'
        ];
        
        const rows = areals.map(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            const lastMowingDate = lastMowing 
                ? new Date(parseInt(lastMowing)).toLocaleDateString('cs-CZ')
                : 'Nikdy';
            
            const status = this.getArealStatus(areal.id, areal.frekvenceUdrzby);
            
            return [
                areal.id,
                areal.nazev,
                areal.okres,
                areal.kategorie || '',
                areal.vymera,
                areal.oploceni,
                areal.priorita,
                areal.naklady || 0,
                lastMowingDate,
                status
            ];
        });
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        this.downloadFile(csv, 'jvs-arealy.csv', 'text/csv');
    }
    
    /**
     * Export comprehensive report
     */
    exportReport(areals) {
        const report = this.generateReport(areals);
        
        // Convert to CSV format
        const csv = this.reportToCSV(report);
        
        this.downloadFile(csv, 'jvs-report.csv', 'text/csv');
    }
    
    /**
     * Generate comprehensive report
     */
    generateReport(areals) {
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalAreals: areals.length
            },
            summary: this.generateSummary(areals),
            mowingStats: this.generateMowingStats(areals),
            districtBreakdown: this.generateDistrictBreakdown(areals),
            categoryBreakdown: this.generateCategoryBreakdown(areals),
            costAnalysis: this.generateCostAnalysis(areals),
            maintenanceSchedule: this.generateMaintenanceSchedule(areals),
            workerStats: this.generateWorkerStats()
        };
        
        return report;
    }
    
    /**
     * Generate summary statistics
     */
    generateSummary(areals) {
        const totalArea = areals.reduce((sum, a) => sum + a.vymera, 0);
        const totalFence = areals.reduce((sum, a) => sum + a.oploceni, 0);
        const avgPriority = Math.round(areals.reduce((sum, a) => sum + a.priorita, 0) / areals.length);
        const totalCost = areals.reduce((sum, a) => sum + (a.naklady || 0), 0);
        
        return {
            totalAreals: areals.length,
            totalArea,
            totalFence,
            avgPriority,
            totalCost
        };
    }
    
    /**
     * Generate mowing statistics
     */
    generateMowingStats(areals) {
        const today = new Date().setHours(0, 0, 0, 0);
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        let mowedToday = 0;
        let mowedThisWeek = 0;
        let mowedThisMonth = 0;
        let overdue = 0;
        
        areals.forEach(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            
            if (lastMowing) {
                const mowingTimestamp = parseInt(lastMowing);
                const mowingDate = new Date(mowingTimestamp);
                const mowingDay = mowingDate.setHours(0, 0, 0, 0);
                
                if (mowingDay === today) mowedToday++;
                if (mowingTimestamp > weekAgo) mowedThisWeek++;
                if (mowingTimestamp > monthAgo) mowedThisMonth++;
                
                // Check if overdue
                const daysSince = (Date.now() - mowingTimestamp) / (1000 * 60 * 60 * 24);
                if (daysSince > (areal.frekvenceUdrzby || 21)) {
                    overdue++;
                }
            } else {
                overdue++;
            }
        });
        
        return {
            mowedToday,
            mowedThisWeek,
            mowedThisMonth,
            pending: areals.length - mowedThisMonth,
            overdue
        };
    }
    
    /**
     * Generate district breakdown
     */
    generateDistrictBreakdown(areals) {
        const districts = {};
        
        areals.forEach(areal => {
            if (!districts[areal.okres]) {
                districts[areal.okres] = {
                    count: 0,
                    totalArea: 0,
                    totalFence: 0,
                    totalCost: 0,
                    mowed: 0,
                    pending: 0
                };
            }
            
            districts[areal.okres].count++;
            districts[areal.okres].totalArea += areal.vymera;
            districts[areal.okres].totalFence += areal.oploceni;
            districts[areal.okres].totalCost += areal.naklady || 0;
            
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            if (lastMowing) {
                const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                if (parseInt(lastMowing) > monthAgo) {
                    districts[areal.okres].mowed++;
                } else {
                    districts[areal.okres].pending++;
                }
            } else {
                districts[areal.okres].pending++;
            }
        });
        
        return districts;
    }
    
    /**
     * Generate category breakdown
     */
    generateCategoryBreakdown(areals) {
        const categories = {
            'I.': { count: 0, totalArea: 0, avgPriority: 0 },
            'II.': { count: 0, totalArea: 0, avgPriority: 0 },
            'none': { count: 0, totalArea: 0, avgPriority: 0 }
        };
        
        areals.forEach(areal => {
            const cat = areal.kategorie || 'none';
            if (categories[cat]) {
                categories[cat].count++;
                categories[cat].totalArea += areal.vymera;
            }
        });
        
        // Calculate average priority
        ['I.', 'II.', 'none'].forEach(cat => {
            const catAreals = areals.filter(a => (a.kategorie || 'none') === cat);
            if (catAreals.length > 0) {
                categories[cat].avgPriority = Math.round(
                    catAreals.reduce((sum, a) => sum + a.priorita, 0) / catAreals.length
                );
            }
        });
        
        return categories;
    }
    
    /**
     * Generate cost analysis
     */
    generateCostAnalysis(areals) {
        const totalCost = areals.reduce((sum, a) => sum + (a.naklady || 0), 0);
        const avgCost = Math.round(totalCost / areals.length);
        
        // Find most expensive
        const mostExpensive = [...areals]
            .sort((a, b) => (b.naklady || 0) - (a.naklady || 0))
            .slice(0, 5)
            .map(a => ({
                id: a.id,
                nazev: a.nazev,
                naklady: a.naklady || 0
            }));
        
        // Cost by district
        const costByDistrict = {};
        areals.forEach(areal => {
            if (!costByDistrict[areal.okres]) {
                costByDistrict[areal.okres] = 0;
            }
            costByDistrict[areal.okres] += areal.naklady || 0;
        });
        
        return {
            totalCost,
            avgCost,
            mostExpensive,
            costByDistrict
        };
    }
    
    /**
     * Generate maintenance schedule
     */
    generateMaintenanceSchedule(areals) {
        const schedule = [];
        const now = Date.now();
        const thirtyDays = now + (30 * 24 * 60 * 60 * 1000);
        
        areals.forEach(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            
            if (lastMowing) {
                const nextDate = new Date(parseInt(lastMowing));
                nextDate.setDate(nextDate.getDate() + (areal.frekvenceUdrzby || 21));
                const nextTimestamp = nextDate.getTime();
                
                if (nextTimestamp >= now && nextTimestamp <= thirtyDays) {
                    schedule.push({
                        arealId: areal.id,
                        nazev: areal.nazev,
                        nextDate: nextDate.toISOString(),
                        daysUntil: Math.ceil((nextTimestamp - now) / (24 * 60 * 60 * 1000))
                    });
                }
            }
        });
        
        schedule.sort((a, b) => a.daysUntil - b.daysUntil);
        
        return schedule;
    }
    
    /**
     * Generate worker statistics
     */
    generateWorkerStats() {
        const workers = {};
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(`${this.storagePrefix}history_`)) {
                const history = JSON.parse(localStorage.getItem(key) || '[]');
                
                history.forEach(entry => {
                    if (!workers[entry.worker]) {
                        workers[entry.worker] = {
                            totalServices: 0,
                            mowingCount: 0
                        };
                    }
                    
                    workers[entry.worker].totalServices++;
                    
                    if (entry.type === 'mowing') {
                        workers[entry.worker].mowingCount++;
                    }
                });
            }
        });
        
        return workers;
    }
    
    /**
     * Convert report to CSV
     */
    reportToCSV(report) {
        let csv = '';
        
        // Metadata
        csv += 'JVS FOREST - Provozní Report\n';
        csv += `Vygenerováno: ${new Date(report.metadata.generatedAt).toLocaleString('cs-CZ')}\n`;
        csv += '\n';
        
        // Summary
        csv += 'SOUHRN\n';
        csv += `Celkem areálů,${report.summary.totalAreals}\n`;
        csv += `Celková výměra (m²),${report.summary.totalArea}\n`;
        csv += `Celkové oplocení (bm),${report.summary.totalFence}\n`;
        csv += `Průměrná priorita,${report.summary.avgPriority}\n`;
        csv += `Celkové náklady (Kč),${report.summary.totalCost}\n`;
        csv += '\n';
        
        // Mowing stats
        csv += 'STATISTIKY SEČÍ\n';
        csv += `Posečeno dnes,${report.mowingStats.mowedToday}\n`;
        csv += `Posečeno tento týden,${report.mowingStats.mowedThisWeek}\n`;
        csv += `Posečeno tento měsíc,${report.mowingStats.mowedThisMonth}\n`;
        csv += `Čeká na seč,${report.mowingStats.pending}\n`;
        csv += `Po termínu,${report.mowingStats.overdue}\n`;
        csv += '\n';
        
        // District breakdown
        csv += 'PŘEHLED PO OKRESECH\n';
        csv += 'Okres,Počet,Výměra (m²),Oplocení (bm),Náklady (Kč),Posečeno,Čeká\n';
        Object.entries(report.districtBreakdown).forEach(([district, data]) => {
            csv += `${district},${data.count},${data.totalArea},${data.totalFence},${data.totalCost},${data.mowed},${data.pending}\n`;
        });
        csv += '\n';
        
        // Category breakdown
        csv += 'PŘEHLED PO KATEGORIÍCH\n';
        csv += 'Kategorie,Počet,Výměra (m²),Průměrná priorita\n';
        Object.entries(report.categoryBreakdown).forEach(([cat, data]) => {
            const catName = cat === 'none' ? 'Bez kategorie' : `Kategorie ${cat}`;
            csv += `${catName},${data.count},${data.totalArea},${data.avgPriority}\n`;
        });
        csv += '\n';
        
        // Cost analysis
        csv += 'ANALÝZA NÁKLADŮ\n';
        csv += `Celkové náklady,${report.costAnalysis.totalCost} Kč\n`;
        csv += `Průměrné náklady,${report.costAnalysis.avgCost} Kč\n`;
        csv += '\nNejnákladnější areály\n';
        csv += 'ID,Název,Náklady (Kč)\n';
        report.costAnalysis.mostExpensive.forEach(areal => {
            csv += `${areal.id},"${areal.nazev}",${areal.naklady}\n`;
        });
        csv += '\n';
        
        // Maintenance schedule
        csv += 'PLÁN ÚDRŽBY (30 DNÍ)\n';
        csv += 'ID,Název,Datum,Dní do seče\n';
        report.maintenanceSchedule.forEach(item => {
            csv += `${item.arealId},"${item.nazev}",${new Date(item.nextDate).toLocaleDateString('cs-CZ')},${item.daysUntil}\n`;
        });
        csv += '\n';
        
        // Worker stats
        csv += 'STATISTIKY PRACOVNÍKŮ\n';
        csv += 'Pracovník,Celkem úkonů,Sečí\n';
        Object.entries(report.workerStats).forEach(([worker, stats]) => {
            csv += `"${worker}",${stats.totalServices},${stats.mowingCount}\n`;
        });
        
        return csv;
    }
    
    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Get areal status
     */
    getArealStatus(arealId, frequency = 21) {
        const lastMowing = localStorage.getItem(`mowing_${arealId}`);
        
        if (!lastMowing) {
            return 'Čeká';
        }
        
        const daysSince = (Date.now() - parseInt(lastMowing)) / (1000 * 60 * 60 * 24);
        
        if (daysSince > frequency) {
            return 'Po termínu';
        }
        
        if (daysSince < frequency * 0.8) {
            return 'Posečeno';
        }
        
        return 'Čeká';
    }
}