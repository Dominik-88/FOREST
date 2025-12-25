/**
 * AI Service - Intelligent assistant for areal management
 * Provides context-aware responses and recommendations
 * 
 * @version 4.0.0
 */

export class AIService {
    constructor() {
        this.areals = [];
        this.conversationHistory = [];
    }
    
    /**
     * Initialize AI with areal data
     */
    async init(areals) {
        this.areals = areals;
        console.log('✅ AI Service initialized with', areals.length, 'areals');
    }
    
    /**
     * Process user query and return AI response
     */
    async query(userMessage, areals) {
        this.areals = areals;
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            message: userMessage,
            timestamp: new Date()
        });
        
        // Analyze query intent
        const intent = this.analyzeIntent(userMessage);
        
        // Generate response based on intent
        let response = '';
        
        switch (intent.type) {
            case 'mowing_needed':
                response = this.getMowingNeeded();
                break;
            case 'high_priority':
                response = this.getHighPriority();
                break;
            case 'statistics':
                response = this.getStatistics();
                break;
            case 'route_optimization':
                response = this.getRouteOptimization();
                break;
            case 'cost_analysis':
                response = this.getCostAnalysis();
                break;
            case 'weather_check':
                response = this.getWeatherAdvice();
                break;
            case 'service_prediction':
                response = this.getServicePrediction();
                break;
            case 'district_info':
                response = this.getDistrictInfo(intent.district);
                break;
            default:
                response = this.getGeneralResponse(userMessage);
        }
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            message: response,
            timestamp: new Date()
        });
        
        return response;
    }
    
    /**
     * Analyze user intent from message
     */
    analyzeIntent(message) {
        const lower = message.toLowerCase();
        
        // Mowing queries
        if (lower.includes('seč') || lower.includes('posečen') || lower.includes('potřebuj')) {
            return { type: 'mowing_needed' };
        }
        
        // Priority queries
        if (lower.includes('priorit') || lower.includes('důležit') || lower.includes('naléhav')) {
            return { type: 'high_priority' };
        }
        
        // Statistics
        if (lower.includes('statistik') || lower.includes('přehled') || lower.includes('celkem')) {
            return { type: 'statistics' };
        }
        
        // Route optimization
        if (lower.includes('tras') || lower.includes('cest') || lower.includes('optimalizac')) {
            return { type: 'route_optimization' };
        }
        
        // Cost analysis
        if (lower.includes('náklad') || lower.includes('cen') || lower.includes('rozpočet')) {
            return { type: 'cost_analysis' };
        }
        
        // Weather
        if (lower.includes('počas') || lower.includes('déšť') || lower.includes('vítr')) {
            return { type: 'weather_check' };
        }
        
        // Service prediction
        if (lower.includes('servis') || lower.includes('údržb') || lower.includes('predikc')) {
            return { type: 'service_prediction' };
        }
        
        // District queries
        const districts = ['cb', 'ta', 'pt', 'ck', 'pi', 'st'];
        for (const district of districts) {
            if (lower.includes(district)) {
                return { type: 'district_info', district: district.toUpperCase() };
            }
        }
        
        return { type: 'general' };
    }
    
    /**
     * Get areals that need mowing
     */
    getMowingNeeded() {
        // Filter areals that haven't been mowed recently
        const needMowing = this.areals.filter(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            if (!lastMowing) return true;
            
            const daysSince = (Date.now() - parseInt(lastMowing)) / (1000 * 60 * 60 * 24);
            return daysSince > (areal.frekvenceUdrzby || 21);
        });
        
        if (needMowing.length === 0) {
            return '✅ Skvělé! Všechny areály jsou aktuálně posečené.';
        }
        
        // Sort by priority
        needMowing.sort((a, b) => b.priorita - a.priorita);
        
        let response = `📋 Nalezeno ${needMowing.length} areálů, které potřebují seč:\n\n`;
        
        needMowing.slice(0, 5).forEach((areal, index) => {
            response += `${index + 1}. ${areal.nazev} (${areal.okres})\n`;
            response += `   Priorita: ${areal.priorita}/100\n`;
            response += `   Výměra: ${areal.vymera.toLocaleString()} m²\n\n`;
        });
        
        if (needMowing.length > 5) {
            response += `... a dalších ${needMowing.length - 5} areálů.`;
        }
        
        return response;
    }
    
    /**
     * Get high priority areals
     */
    getHighPriority() {
        const highPriority = this.areals
            .filter(a => a.priorita >= 85)
            .sort((a, b) => b.priorita - a.priorita);
        
        if (highPriority.length === 0) {
            return 'Žádné areály s vysokou prioritou.';
        }
        
        let response = `⚠️ Areály s vysokou prioritou (≥85):\n\n`;
        
        highPriority.forEach((areal, index) => {
            response += `${index + 1}. ${areal.nazev}\n`;
            response += `   Priorita: ${areal.priorita}/100\n`;
            response += `   Kategorie: ${areal.kategorie || 'Bez kategorie'}\n\n`;
        });
        
        return response;
    }
    
    /**
     * Get statistics
     */
    getStatistics() {
        const totalArea = this.areals.reduce((sum, a) => sum + a.vymera, 0);
        const totalFence = this.areals.reduce((sum, a) => sum + a.oploceni, 0);
        const avgPriority = Math.round(this.areals.reduce((sum, a) => sum + a.priorita, 0) / this.areals.length);
        const totalCost = this.areals.reduce((sum, a) => sum + (a.naklady || 0), 0);
        
        const catI = this.areals.filter(a => a.kategorie === 'I.').length;
        const catII = this.areals.filter(a => a.kategorie === 'II.').length;
        const catNone = this.areals.filter(a => !a.kategorie).length;
        
        return `📊 Statistiky areálů:\n\n` +
               `Celkem areálů: ${this.areals.length}\n` +
               `Celková výměra: ${totalArea.toLocaleString()} m²\n` +
               `Celkové oplocení: ${totalFence.toLocaleString()} bm\n` +
               `Průměrná priorita: ${avgPriority}/100\n` +
               `Roční náklady: ${totalCost.toLocaleString()} Kč\n\n` +
               `Kategorie:\n` +
               `• I. (vysoké riziko): ${catI}\n` +
               `• II. (střední riziko): ${catII}\n` +
               `• Bez kategorie: ${catNone}`;
    }
    
    /**
     * Get route optimization advice
     */
    getRouteOptimization() {
        return `🛣️ Optimalizace tras:\n\n` +
               `Pro optimální plánování tras doporučuji:\n\n` +
               `1. Seskupte areály podle okresů\n` +
               `2. Začněte s areály s nejvyšší prioritou\n` +
               `3. Využijte funkci "Optimalizovat trasu" v aplikaci\n` +
               `4. Zohledněte aktuální počasí\n\n` +
               `Průměrná úspora při optimalizaci: 20-25% času a paliva.`;
    }
    
    /**
     * Get cost analysis
     */
    getCostAnalysis() {
        const totalCost = this.areals.reduce((sum, a) => sum + (a.naklady || 0), 0);
        const avgCost = Math.round(totalCost / this.areals.length);
        
        // Find most expensive
        const mostExpensive = [...this.areals]
            .sort((a, b) => (b.naklady || 0) - (a.naklady || 0))
            .slice(0, 3);
        
        let response = `💰 Analýza nákladů:\n\n`;
        response += `Celkové roční náklady: ${totalCost.toLocaleString()} Kč\n`;
        response += `Průměrné náklady na areál: ${avgCost.toLocaleString()} Kč\n\n`;
        response += `Nejnákladnější areály:\n`;
        
        mostExpensive.forEach((areal, index) => {
            response += `${index + 1}. ${areal.nazev}: ${(areal.naklady || 0).toLocaleString()} Kč\n`;
        });
        
        return response;
    }
    
    /**
     * Get weather advice
     */
    getWeatherAdvice() {
        return `🌤️ Doporučení podle počasí:\n\n` +
               `Aktuální počasí najdete v dashboardu.\n\n` +
               `Nedoporučujeme seč při:\n` +
               `• Dešti (> 0.5mm/h)\n` +
               `• Silném větru (> 40 km/h)\n` +
               `• Bouřce\n` +
               `• Teplotě pod 5°C\n\n` +
               `Optimální podmínky:\n` +
               `• Jasno nebo polojasno\n` +
               `• Teplota 15-25°C\n` +
               `• Mírný vítr (< 20 km/h)`;
    }
    
    /**
     * Get service prediction
     */
    getServicePrediction() {
        // Predict which areals will need service soon
        const needServiceSoon = this.areals.filter(areal => {
            const lastMowing = localStorage.getItem(`mowing_${areal.id}`);
            if (!lastMowing) return false;
            
            const daysSince = (Date.now() - parseInt(lastMowing)) / (1000 * 60 * 60 * 24);
            const frequency = areal.frekvenceUdrzby || 21;
            
            return daysSince > (frequency * 0.8) && daysSince < frequency;
        });
        
        if (needServiceSoon.length === 0) {
            return '✅ Žádné areály nevyžadují seč v nejbližších dnech.';
        }
        
        let response = `📅 Predikce údržby (příštích 7 dní):\n\n`;
        
        needServiceSoon.forEach((areal, index) => {
            response += `${index + 1}. ${areal.nazev}\n`;
            response += `   Doporučená seč: během 2-3 dnů\n\n`;
        });
        
        return response;
    }
    
    /**
     * Get district information
     */
    getDistrictInfo(district) {
        const districtAreals = this.areals.filter(a => a.okres === district);
        
        if (districtAreals.length === 0) {
            return `Žádné areály v okrese ${district}.`;
        }
        
        const totalArea = districtAreals.reduce((sum, a) => sum + a.vymera, 0);
        const avgPriority = Math.round(districtAreals.reduce((sum, a) => sum + a.priorita, 0) / districtAreals.length);
        
        return `📍 Okres ${district}:\n\n` +
               `Počet areálů: ${districtAreals.length}\n` +
               `Celková výměra: ${totalArea.toLocaleString()} m²\n` +
               `Průměrná priorita: ${avgPriority}/100\n\n` +
               `Areály:\n` +
               districtAreals.slice(0, 5).map((a, i) => 
                   `${i + 1}. ${a.nazev} (${a.vymera.toLocaleString()} m²)`
               ).join('\n');
    }
    
    /**
     * Get general response
     */
    getGeneralResponse(message) {
        const responses = [
            'Zajímavý dotaz! Můžete být konkrétnější?',
            'Rád vám pomohu. Zkuste se zeptat na:\n• Které areály potřebují seč?\n• Jaké jsou statistiky?\n• Jak optimalizovat trasy?',
            'Nejsem si jistý, jak odpovědět. Zkuste přeformulovat dotaz.',
            'Mohu vám pomoci s:\n• Plánováním sečí\n• Analýzou nákladů\n• Optimalizací tras\n• Predikcí údržby'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }
    
    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }
}