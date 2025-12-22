/**
 * Enhanced AI Service with Gemini Integration
 * Contextual AI assistant for JVS Management
 * Version: 3.0.0
 */

import { firestoreService } from './firestore.service.enhanced.js';

/**
 * AI Service Configuration
 */
const AI_CONFIG = {
    // Replace with your actual Gemini API key
    GEMINI_API_KEY: 'AIzaSyDemoKey-ReplaceWithYourActualGeminiKey',
    GEMINI_MODEL: 'gemini-pro',
    GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7
};

/**
 * Enhanced AI Service Class
 */
class AIService {
    constructor() {
        this.isInitialized = false;
        this.conversationHistory = [];
        this.systemContext = null;
    }

    /**
     * Initialize AI Service
     */
    async initialize() {
        try {
            console.log('[AI] Initializing...');
            
            // Setup system context
            this.setupSystemContext();
            
            // Load conversation history
            await this.loadConversationHistory();
            
            this.isInitialized = true;
            console.log('[AI] Initialized successfully');
            
            return { success: true };
        } catch (error) {
            console.error('[AI] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup system context for AI
     */
    setupSystemContext() {
        this.systemContext = `Jsi AI asistent pro JVS Management System - systém pro správu 41 vodárenských areálů v Jihočeském kraji.

TVOJE ROLE:
- Pomáháš uživatelům s filtrováním, vyhledáváním a analýzou areálů
- Odpovídáš na dotazy o údržbě, rizicích a statistikách
- Generuješ protokoly a predikce údržby
- Překládáš přirozené dotazy do Firestore queries

DOSTUPNÁ DATA:
- 41 areálů rozdělených do 6 okresů (CB, TA, PT, CK, PI, ST)
- Kategorie: I. (vysoké riziko), II. (střední riziko), Bez kategorie
- Atributy: název, okres, kategorie, souřadnice, plocha, délka oplocení, stav dokončení, poslední údržba

OKRESY:
- CB (České Budějovice) - 19 areálů
- TA (Tábor) - 10 areálů
- PT (Prachatice) - 4 areály
- CK (Český Krumlov) - 4 areály
- PI (Písek) - 2 areály
- ST (Strakonice) - 2 areály

FUNKCE:
1. FILTRACE: Překládej dotazy do filtrů (např. "areály kategorie I. v Písku" → {category: "I.", district: "PI"})
2. PREDIKCE: Analyzuj riziko údržby na základě poslední údržby a kategorie
3. PROTOKOLY: Generuj markdown protokoly pro údržbu areálů
4. STATISTIKY: Počítej a vysvětluj statistiky

ODPOVÍDEJ:
- Stručně a přesně v češtině
- S konkrétními čísly a fakty
- S návrhy akcí, pokud je to relevantní`;
    }

    /**
     * Load conversation history from Firestore
     */
    async loadConversationHistory() {
        try {
            const history = await firestoreService.getAIHistory(5);
            this.conversationHistory = history.map(h => ({
                role: 'user',
                parts: [{ text: h.query }]
            }, {
                role: 'model',
                parts: [{ text: h.response }]
            })).flat();
        } catch (error) {
            console.warn('[AI] Could not load history:', error);
            this.conversationHistory = [];
        }
    }

    /**
     * Process user query
     */
    async processQuery(query, arealsData = []) {
        try {
            console.log('[AI] Processing query:', query);
            
            // Detect query intent
            const intent = this.detectIntent(query);
            
            // Route to appropriate handler
            switch (intent.type) {
                case 'filter':
                    return await this.handleFilterQuery(query, intent, arealsData);
                case 'statistics':
                    return await this.handleStatisticsQuery(query, arealsData);
                case 'prediction':
                    return await this.handlePredictionQuery(query, intent, arealsData);
                case 'protocol':
                    return await this.handleProtocolQuery(query, intent, arealsData);
                default:
                    return await this.handleGeneralQuery(query, arealsData);
            }
        } catch (error) {
            console.error('[AI] Query processing failed:', error);
            return {
                success: false,
                response: 'Omlouvám se, došlo k chybě při zpracování dotazu. Zkuste to prosím znovu.',
                error: error.message
            };
        }
    }

    /**
     * Detect query intent
     */
    detectIntent(query) {
        const lowerQuery = query.toLowerCase();
        
        // Filter intent
        if (lowerQuery.match(/ukaž|zobraz|najdi|filtruj|hledej|kde|které|kolik/)) {
            return {
                type: 'filter',
                keywords: this.extractFilterKeywords(query)
            };
        }
        
        // Statistics intent
        if (lowerQuery.match(/statistik|celkem|průměr|součet|kolik je/)) {
            return { type: 'statistics' };
        }
        
        // Prediction intent
        if (lowerQuery.match(/predikce|předpověď|riziko|kdy|potřebuje údržbu/)) {
            return {
                type: 'prediction',
                keywords: this.extractFilterKeywords(query)
            };
        }
        
        // Protocol intent
        if (lowerQuery.match(/protokol|zpráva|report|vygeneruj/)) {
            return {
                type: 'protocol',
                arealId: this.extractArealId(query)
            };
        }
        
        return { type: 'general' };
    }

    /**
     * Extract filter keywords from query
     */
    extractFilterKeywords(query) {
        const keywords = {
            district: null,
            category: null,
            completed: null,
            maintenanceAge: null
        };
        
        const lowerQuery = query.toLowerCase();
        
        // District detection
        const districts = {
            'budějovic': 'CB',
            'tábor': 'TA',
            'prachatice': 'PT',
            'krumlov': 'CK',
            'písek': 'PI',
            'strakonice': 'ST'
        };
        
        for (const [name, code] of Object.entries(districts)) {
            if (lowerQuery.includes(name)) {
                keywords.district = code;
                break;
            }
        }
        
        // Category detection
        if (lowerQuery.match(/kategorie\s*i\.|kategorie\s*1/)) {
            keywords.category = 'I.';
        } else if (lowerQuery.match(/kategorie\s*ii\.|kategorie\s*2/)) {
            keywords.category = 'II.';
        } else if (lowerQuery.match(/bez kategorie/)) {
            keywords.category = '';
        }
        
        // Completion status
        if (lowerQuery.match(/dokončen|hotov|kompletní/)) {
            keywords.completed = true;
        } else if (lowerQuery.match(/nedokončen|rozpracovan/)) {
            keywords.completed = false;
        }
        
        // Maintenance age
        const monthsMatch = lowerQuery.match(/(\d+)\s*měsíc/);
        if (monthsMatch) {
            keywords.maintenanceAge = parseInt(monthsMatch[1]);
        }
        
        return keywords;
    }

    /**
     * Extract areal ID from query
     */
    extractArealId(query) {
        const match = query.match(/\b([a-z]{2}\d{3})\b/i);
        return match ? match[1].toLowerCase() : null;
    }

    /**
     * Handle filter query
     */
    async handleFilterQuery(query, intent, arealsData) {
        const { keywords } = intent;
        
        // Apply filters
        let filtered = arealsData;
        
        if (keywords.district) {
            filtered = filtered.filter(a => a.district === keywords.district);
        }
        
        if (keywords.category !== null) {
            filtered = filtered.filter(a => a.category === keywords.category);
        }
        
        if (keywords.completed !== null) {
            filtered = filtered.filter(a => a.is_completed === keywords.completed);
        }
        
        if (keywords.maintenanceAge) {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - keywords.maintenanceAge);
            
            filtered = filtered.filter(a => {
                if (!a.last_maintenance) return true;
                const maintenanceDate = a.last_maintenance.toDate ? a.last_maintenance.toDate() : new Date(a.last_maintenance);
                return maintenanceDate < cutoffDate;
            });
        }
        
        // Generate response
        const response = this.generateFilterResponse(filtered, keywords);
        
        // Save to history
        await firestoreService.saveAIQuery(query, response);
        
        return {
            success: true,
            response,
            data: {
                filters: keywords,
                results: filtered,
                count: filtered.length
            }
        };
    }

    /**
     * Generate filter response
     */
    generateFilterResponse(filtered, keywords) {
        let response = `Našel jsem **${filtered.length} areálů**`;
        
        const conditions = [];
        if (keywords.district) {
            const districtNames = {
                'CB': 'České Budějovice',
                'TA': 'Tábor',
                'PT': 'Prachatice',
                'CK': 'Český Krumlov',
                'PI': 'Písek',
                'ST': 'Strakonice'
            };
            conditions.push(`v okrese ${districtNames[keywords.district]}`);
        }
        if (keywords.category) {
            conditions.push(`kategorie ${keywords.category}`);
        } else if (keywords.category === '') {
            conditions.push('bez kategorie');
        }
        if (keywords.completed === true) {
            conditions.push('dokončené');
        } else if (keywords.completed === false) {
            conditions.push('nedokončené');
        }
        if (keywords.maintenanceAge) {
            conditions.push(`s údržbou starší než ${keywords.maintenanceAge} měsíců`);
        }
        
        if (conditions.length > 0) {
            response += ` (${conditions.join(', ')})`;
        }
        
        response += '.\n\n';
        
        if (filtered.length > 0) {
            response += '**Top 5 areálů:**\n';
            filtered.slice(0, 5).forEach((areal, i) => {
                response += `${i + 1}. **${areal.name}** - ${areal.area_sqm} m², ${areal.district}\n`;
            });
            
            if (filtered.length > 5) {
                response += `\n...a dalších ${filtered.length - 5} areálů.`;
            }
        } else {
            response += 'Žádné areály neodpovídají zadaným kritériím.';
        }
        
        return response;
    }

    /**
     * Handle statistics query
     */
    async handleStatisticsQuery(query, arealsData) {
        const stats = this.calculateStatistics(arealsData);
        
        const response = `📊 **Statistiky JVS Management:**

**Celkem:** ${stats.total} areálů
**Celková plocha:** ${stats.totalArea.toLocaleString('cs-CZ')} m²
**Průměrná plocha:** ${stats.avgArea.toLocaleString('cs-CZ')} m²
**Celková délka oplocení:** ${stats.totalFence.toLocaleString('cs-CZ')} m

**Podle kategorií:**
- Kategorie I.: ${stats.categoryI} areálů (${stats.categoryIPercent}%)
- Kategorie II.: ${stats.categoryII} areálů (${stats.categoryIIPercent}%)
- Bez kategorie: ${stats.noCategory} areálů (${stats.noCategoryPercent}%)

**Stav dokončení:**
- Dokončeno: ${stats.completed} areálů (${stats.completedPercent}%)
- Nedokončeno: ${stats.incomplete} areálů (${stats.incompletePercent}%)

**Podle okresů:**
${stats.byDistrict.map(d => `- ${d.name}: ${d.count} areálů`).join('\n')}`;
        
        await firestoreService.saveAIQuery(query, response);
        
        return {
            success: true,
            response,
            data: stats
        };
    }

    /**
     * Calculate statistics
     */
    calculateStatistics(arealsData) {
        const total = arealsData.length;
        const totalArea = arealsData.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
        const totalFence = arealsData.reduce((sum, a) => sum + (a.fence_length || 0), 0);
        const avgArea = total > 0 ? Math.round(totalArea / total) : 0;
        
        const categoryI = arealsData.filter(a => a.category === 'I.').length;
        const categoryII = arealsData.filter(a => a.category === 'II.').length;
        const noCategory = arealsData.filter(a => !a.category).length;
        
        const completed = arealsData.filter(a => a.is_completed).length;
        const incomplete = total - completed;
        
        const byDistrict = [
            { code: 'CB', name: 'České Budějovice', count: arealsData.filter(a => a.district === 'CB').length },
            { code: 'TA', name: 'Tábor', count: arealsData.filter(a => a.district === 'TA').length },
            { code: 'PT', name: 'Prachatice', count: arealsData.filter(a => a.district === 'PT').length },
            { code: 'CK', name: 'Český Krumlov', count: arealsData.filter(a => a.district === 'CK').length },
            { code: 'PI', name: 'Písek', count: arealsData.filter(a => a.district === 'PI').length },
            { code: 'ST', name: 'Strakonice', count: arealsData.filter(a => a.district === 'ST').length }
        ].sort((a, b) => b.count - a.count);
        
        return {
            total,
            totalArea,
            totalFence,
            avgArea,
            categoryI,
            categoryII,
            noCategory,
            categoryIPercent: Math.round((categoryI / total) * 100),
            categoryIIPercent: Math.round((categoryII / total) * 100),
            noCategoryPercent: Math.round((noCategory / total) * 100),
            completed,
            incomplete,
            completedPercent: Math.round((completed / total) * 100),
            incompletePercent: Math.round((incomplete / total) * 100),
            byDistrict
        };
    }

    /**
     * Handle prediction query
     */
    async handlePredictionQuery(query, intent, arealsData) {
        const { keywords } = intent;
        
        // Filter areals
        let filtered = arealsData;
        if (keywords.district) {
            filtered = filtered.filter(a => a.district === keywords.district);
        }
        if (keywords.category) {
            filtered = filtered.filter(a => a.category === keywords.category);
        }
        
        // Calculate risk scores
        const withRisk = filtered.map(areal => ({
            ...areal,
            riskScore: this.calculateRiskScore(areal)
        })).sort((a, b) => b.riskScore - a.riskScore);
        
        const highRisk = withRisk.filter(a => a.riskScore >= 70);
        
        let response = `🔮 **Predikce údržby:**\n\n`;
        
        if (highRisk.length > 0) {
            response += `⚠️ **${highRisk.length} areálů vyžaduje prioritní údržbu:**\n\n`;
            highRisk.slice(0, 5).forEach((areal, i) => {
                const lastMaintenance = areal.last_maintenance ? 
                    this.formatDate(areal.last_maintenance.toDate ? areal.last_maintenance.toDate() : new Date(areal.last_maintenance)) : 
                    'Nikdy';
                response += `${i + 1}. **${areal.name}** (${areal.district})\n`;
                response += `   - Riziko: ${areal.riskScore}%\n`;
                response += `   - Poslední údržba: ${lastMaintenance}\n`;
                response += `   - Kategorie: ${areal.category || 'Bez kategorie'}\n\n`;
            });
        } else {
            response += '✅ Všechny areály jsou v dobrém stavu. Žádná prioritní údržba není nutná.';
        }
        
        await firestoreService.saveAIQuery(query, response);
        
        return {
            success: true,
            response,
            data: {
                highRisk,
                totalAnalyzed: filtered.length
            }
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
            const maintenanceDate = areal.last_maintenance.toDate ? areal.last_maintenance.toDate() : new Date(areal.last_maintenance);
            const monthsSince = Math.floor((Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            
            if (monthsSince > 12) score += 40;
            else if (monthsSince > 6) score += 25;
            else if (monthsSince > 3) score += 10;
        } else {
            score += 50; // No maintenance record
        }
        
        // Completion status
        if (!areal.is_completed) score += 20;
        
        return Math.min(score, 100);
    }

    /**
     * Handle protocol generation
     */
    async handleProtocolQuery(query, intent, arealsData) {
        const { arealId } = intent;
        
        if (!arealId) {
            return {
                success: false,
                response: 'Pro generování protokolu prosím uveďte ID areálu (např. cb001, ta002).'
            };
        }
        
        const areal = arealsData.find(a => a.id === arealId);
        
        if (!areal) {
            return {
                success: false,
                response: `Areál s ID "${arealId}" nebyl nalezen.`
            };
        }
        
        const protocol = this.generateMaintenanceProtocol(areal);
        
        await firestoreService.saveAIQuery(query, protocol);
        
        return {
            success: true,
            response: protocol,
            data: { areal }
        };
    }

    /**
     * Generate maintenance protocol
     */
    generateMaintenanceProtocol(areal) {
        const today = new Date().toLocaleDateString('cs-CZ');
        const lastMaintenance = areal.last_maintenance ? 
            this.formatDate(areal.last_maintenance.toDate ? areal.last_maintenance.toDate() : new Date(areal.last_maintenance)) : 
            'Neznámé';
        
        return `# Protokol o Údržbě Areálu

**Datum protokolu:** ${today}  
**ID areálu:** ${areal.id}  
**Název:** ${areal.name}  
**Okres:** ${areal.district}  

---

## 1. Základní Informace

- **Kategorie:** ${areal.category || 'Bez kategorie'}
- **Plocha:** ${areal.area_sqm} m²
- **Délka oplocení:** ${areal.fence_length} m
- **Stav dokončení:** ${areal.is_completed ? 'Dokončeno' : 'Nedokončeno'}
- **Poslední údržba:** ${lastMaintenance}

## 2. Provedené Práce

- [ ] Kontrola oplocení
- [ ] Kontrola vstupních bran
- [ ] Kontrola bezpečnostních systémů
- [ ] Údržba zeleně
- [ ] Kontrola odvodnění
- [ ] Kontrola osvětlení

## 3. Zjištěné Závady

_Zde popište zjištěné závady..._

## 4. Doporučení

${this.generateRecommendations(areal)}

## 5. Podpisy

**Technik:**  
Jméno: ________________  
Podpis: ________________  

**Vedoucí:**  
Jméno: ________________  
Podpis: ________________  

---

*Protokol vygenerován automaticky systémem JVS Management*`;
    }

    /**
     * Generate recommendations based on areal data
     */
    generateRecommendations(areal) {
        const recommendations = [];
        
        const riskScore = this.calculateRiskScore(areal);
        
        if (riskScore >= 70) {
            recommendations.push('⚠️ **PRIORITNÍ:** Areál vyžaduje okamžitou údržbu');
        }
        
        if (areal.category === 'I.') {
            recommendations.push('- Zvýšená frekvence kontrol (minimálně 1x měsíčně)');
        }
        
        if (!areal.is_completed) {
            recommendations.push('- Dokončit zbývající práce podle projektu');
        }
        
        if (areal.last_maintenance) {
            const maintenanceDate = areal.last_maintenance.toDate ? areal.last_maintenance.toDate() : new Date(areal.last_maintenance);
            const monthsSince = Math.floor((Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            
            if (monthsSince > 6) {
                recommendations.push('- Naplánovat komplexní údržbu v nejbližším termínu');
            }
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Areál je v dobrém stavu, pokračovat v pravidelné údržbě');
        }
        
        return recommendations.join('\n');
    }

    /**
     * Handle general query with Gemini API
     */
    async handleGeneralQuery(query, arealsData) {
        // For now, provide a helpful response without calling external API
        // In production, this would call Gemini API
        
        const response = `Rozumím vašemu dotazu: "${query}"

Mohu vám pomoci s:
- 🔍 Filtrováním areálů (např. "ukaž areály kategorie I. v Táboře")
- 📊 Statistikami (např. "kolik je celkem areálů?")
- 🔮 Predikcí údržby (např. "které areály potřebují údržbu?")
- 📝 Generováním protokolů (např. "vygeneruj protokol pro cb001")

Zkuste přeformulovat dotaz nebo použijte jeden z příkladů výše.`;
        
        await firestoreService.saveAIQuery(query, response);
        
        return {
            success: true,
            response
        };
    }

    /**
     * Format date to Czech format
     */
    formatDate(date) {
        return date.toLocaleDateString('cs-CZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        console.log('[AI] Conversation history cleared');
    }
}

// Export singleton instance
export const aiService = new AIService();
