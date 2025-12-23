/**
 * AI Service - Compat Version
 * Simple AI assistant without external dependencies
 * Version: 3.1.0
 */

class AIServiceCompat {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize AI service
     */
    async initialize() {
        console.log('[AI Service] Initializing...');
        this.isInitialized = true;
        console.log('[AI Service] Initialized (local mode)');
        return { success: true };
    }

    /**
     * Process user query
     */
    async processQuery(query, areals) {
        try {
            console.log(`[AI Service] Processing query: "${query}"`);
            
            const lowerQuery = query.toLowerCase();
            
            // Detect intent
            if (this.isFilterQuery(lowerQuery)) {
                return this.handleFilterQuery(lowerQuery, areals);
            } else if (this.isStatsQuery(lowerQuery)) {
                return this.handleStatsQuery(areals);
            } else if (this.isPredictionQuery(lowerQuery)) {
                return this.handlePredictionQuery(areals);
            } else {
                return this.handleGeneralQuery(query);
            }
        } catch (error) {
            console.error('[AI Service] Query processing failed:', error);
            return {
                response: 'Omlouvám se, došlo k chybě při zpracování dotazu.',
                data: null
            };
        }
    }

    /**
     * Check if query is about filtering
     */
    isFilterQuery(query) {
        const filterKeywords = ['ukaž', 'zobraz', 'najdi', 'hledám', 'kde jsou', 'kategorie', 'okres'];
        return filterKeywords.some(keyword => query.includes(keyword));
    }

    /**
     * Check if query is about statistics
     */
    isStatsQuery(query) {
        const statsKeywords = ['kolik', 'počet', 'celkem', 'statistika', 'přehled'];
        return statsKeywords.some(keyword => query.includes(keyword));
    }

    /**
     * Check if query is about predictions
     */
    isPredictionQuery(query) {
        const predictionKeywords = ['údržba', 'potřebují', 'riziko', 'priorita', 'doporučení'];
        return predictionKeywords.some(keyword => query.includes(keyword));
    }

    /**
     * Handle filter queries
     */
    handleFilterQuery(query, areals) {
        let filtered = [...areals];
        let filterDesc = [];

        // Filter by district
        const districts = { 'budějovice': 'CB', 'budějovic': 'CB', 'tábor': 'TA', 'prachatice': 'PT', 'krumlov': 'CK', 'písek': 'PI', 'strakonice': 'ST' };
        for (const [name, code] of Object.entries(districts)) {
            if (query.includes(name)) {
                filtered = filtered.filter(a => a.district === code);
                filterDesc.push(`okres ${this.getDistrictName(code)}`);
                break;
            }
        }

        // Filter by category
        if (query.includes('kategorie i') || query.includes('kategorie 1')) {
            filtered = filtered.filter(a => a.category === 'I.');
            filterDesc.push('kategorie I.');
        } else if (query.includes('kategorie ii') || query.includes('kategorie 2')) {
            filtered = filtered.filter(a => a.category === 'II.');
            filterDesc.push('kategorie II.');
        }

        // Filter by completion
        if (query.includes('dokončen')) {
            filtered = filtered.filter(a => a.is_completed);
            filterDesc.push('dokončené');
        } else if (query.includes('nedokončen')) {
            filtered = filtered.filter(a => !a.is_completed);
            filterDesc.push('nedokončené');
        }

        const response = filterDesc.length > 0
            ? `Našel jsem **${filtered.length} areálů** (${filterDesc.join(', ')}):\n\n${this.formatArealsList(filtered.slice(0, 10))}`
            : `Našel jsem **${filtered.length} areálů** odpovídajících vašemu dotazu.`;

        return {
            response,
            data: { results: filtered }
        };
    }

    /**
     * Handle statistics queries
     */
    handleStatsQuery(areals) {
        const total = areals.length;
        const completed = areals.filter(a => a.is_completed).length;
        const totalArea = areals.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
        
        const byDistrict = {};
        areals.forEach(a => {
            byDistrict[a.district] = (byDistrict[a.district] || 0) + 1;
        });

        const byCategory = {};
        areals.forEach(a => {
            const cat = a.category || 'Bez kategorie';
            byCategory[cat] = (byCategory[cat] || 0) + 1;
        });

        let response = `📊 **Statistiky JVS Management**\n\n`;
        response += `**Celkem:** ${total} areálů\n`;
        response += `**Plocha:** ${totalArea.toLocaleString('cs-CZ')} m²\n`;
        response += `**Dokončeno:** ${completed} (${Math.round((completed/total)*100)}%)\n\n`;
        
        response += `**Podle okresů:**\n`;
        for (const [district, count] of Object.entries(byDistrict)) {
            response += `• ${this.getDistrictName(district)}: ${count}\n`;
        }
        
        response += `\n**Podle kategorií:**\n`;
        for (const [category, count] of Object.entries(byCategory)) {
            response += `• ${category}: ${count}\n`;
        }

        return { response, data: null };
    }

    /**
     * Handle prediction queries
     */
    handlePredictionQuery(areals) {
        // Calculate risk scores
        const arealsWith Risk = areals.map(a => ({
            ...a,
            riskScore: this.calculateRiskScore(a)
        }));

        // Sort by risk (highest first)
        const sorted = arealsWithRisk.sort((a, b) => b.riskScore - a.riskScore);
        const highRisk = sorted.filter(a => a.riskScore >= 50);

        let response = `🔮 **Predikce údržby**\n\n`;
        response += `Nalezeno **${highRisk.length} areálů** s vysokým rizikem:\n\n`;
        response += this.formatArealsList(highRisk.slice(0, 10), true);

        return {
            response,
            data: { results: highRisk }
        };
    }

    /**
     * Handle general queries
     */
    handleGeneralQuery(query) {
        return {
            response: `Rozumím vašemu dotazu "${query}". Zkuste se zeptat na:\n\n` +
                     `🔍 Filtrování: "Ukaž areály kategorie I. v Písku"\n` +
                     `📊 Statistiky: "Kolik je celkem areálů?"\n` +
                     `🔮 Predikce: "Které areály potřebují údržbu?"`,
            data: null
        };
    }

    /**
     * Calculate risk score for areal
     */
    calculateRiskScore(areal) {
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
            score += 50; // No maintenance record
        }

        // Completion status
        if (!areal.is_completed) score += 20;

        return score;
    }

    /**
     * Format areals list for display
     */
    formatArealsList(areals, showRisk = false) {
        return areals.map((a, i) => {
            let line = `${i + 1}. **${a.name}** (${a.id.toUpperCase()})`;
            if (showRisk && a.riskScore) {
                line += ` - Riziko: ${a.riskScore}`;
            }
            return line;
        }).join('\n');
    }

    /**
     * Get district name from code
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
}

// Export singleton instance
export const aiService = new AIServiceCompat();

// Also make it globally available
window.aiService = aiService;

console.log('[AI Service] Module loaded');
