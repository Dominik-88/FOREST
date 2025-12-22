/**
 * JVS Management System - AI Service
 * Advanced AI Assistant with Puter.js Integration
 * Version: 2.0.0
 */

// =============================================
// AI SERVICE CLASS
// =============================================

class AIService {
    constructor() {
        this.isInitialized = false;
        this.isOnline = false;
        this.conversationHistory = [];
        this.currentContext = {};
        this.puterAPI = null;
        
        // AI Configuration
        this.config = {
            model: 'claude-3.5-sonnet',
            maxTokens: 1000,
            temperature: 0.7,
            timeout: 30000,
            maxHistoryLength: 20
        };
        
        // Predefined responses for offline mode
        this.offlineResponses = {
            greeting: "Ahoj! Jsem JVS AI Asistent. Bohužel momentálně nemám přístup k internetu, ale mohu vám pomoci s následujícími funkcemi:\n\n• Vyhledávání areálů v lokálních datech\n• Základní statistiky a analýzy\n• Informace o systému\n• Obecné dotazy o vodárenských areálech",
            
            search: "Hledám v lokálních datech areálů...",
            
            stats: "Zde jsou aktuální statistiky z lokálních dat:",
            
            help: "Dostupné příkazy v offline režimu:\n• 'statistiky' - zobrazí přehled dat\n• 'hledat [název]' - vyhledá areál\n• 'okresy' - seznam okresů\n• 'kategorie' - info o kategoriích rizika\n• 'pomoc' - tato nápověda",
            
            error: "Omlouváme se, došlo k chybě. V offline režimu jsou dostupné pouze základní funkce. Zkuste použít jiný dotaz nebo počkejte na obnovení připojení."
        };
    }

    // =============================================
    // INITIALIZATION
    // =============================================

    /**
     * Initialize AI service
     */
    async initialize() {
        try {
            console.log('[AIService] Initializing...');
            
            // Try to initialize Puter.js integration
            await this.initializePuter();
            
            // Set context
            this.updateContext();
            
            this.isInitialized = true;
            console.log('[AIService] Initialized successfully');
            
            return true;
        } catch (error) {
            console.warn('[AIService] Failed to initialize with AI backend, using offline mode:', error);
            this.isOnline = false;
            this.isInitialized = true;
            return false;
        }
    }

    /**
     * Initialize Puter.js AI integration
     */
    async initializePuter() {
        try {
            // Check if Puter.js is available
            if (typeof puter === 'undefined') {
                throw new Error('Puter.js not available');
            }

            // Initialize Puter AI client
            this.puterAPI = puter.ai;
            
            // Test connection with a simple ping
            await this.testConnection();
            
            this.isOnline = true;
            console.log('[AIService] Puter.js AI integration active');
            
        } catch (error) {
            console.warn('[AIService] Puter.js integration failed:', error);
            this.isOnline = false;
            throw error;
        }
    }

    /**
     * Test AI connection
     */
    async testConnection() {
        try {
            const response = await this.puterAPI.chat([
                {
                    role: "user",
                    content: "ping"
                }
            ], {
                model: this.config.model,
                max_tokens: 10,
                temperature: 0
            });
            
            console.log('[AIService] Connection test successful');
            return true;
        } catch (error) {
            console.error('[AIService] Connection test failed:', error);
            throw error;
        }
    }

    // =============================================
    // CONTEXT MANAGEMENT
    // =============================================

    /**
     * Update AI context with current data
     */
    updateContext(arealsData = null, stats = null) {
        this.currentContext = {
            timestamp: new Date().toISOString(),
            system: "JVS Management System - Správa vodárenských areálů Jihočeského kraje",
            totalAreals: arealsData ? arealsData.length : 41,
            stats: stats || null,
            districts: ['České Budějovice', 'Tábor', 'Prachatice', 'Český Krumlov', 'Písek', 'Strakonice'],
            capabilities: [
                'Vyhledávání areálů pomocí přirozeného jazyka',
                'Analýza rizik a údržby',
                'Optimalizace tras mezi areály', 
                'Statistické analýzy a reporting',
                'Predikce údržby na základě historických dat'
            ]
        };
    }

    /**
     * Get system prompt
     */
    getSystemPrompt() {
        return `Jste pokročilý AI asistent pro JVS Management System - systém pro správu vodárenských areálů v Jihočeském kraji.

ROLE A SCHOPNOSTI:
- Odborník na vodárenství a správu infrastruktury
- Specialista na analýzu dat a optimalizaci tras
- Poradce pro údržbu a management rizik

AKTUÁLNÍ KONTEXT:
- Systém spravuje ${this.currentContext.totalAreals} vodárenských areálů
- Okresy: ${this.currentContext.districts.join(', ')}
- Kategorie rizika: I. (vysoké), II. (střední), bez kategorie (standardní)

KOMUNIKAČNÍ STYL:
- Přátelský a profesionální přístup
- Používejte českou terminologie vodárenství
- Konkrétní a praktické rady
- Při nejistotě požádejte o upřesnění

HLAVNÍ FUNKCE:
1. Vyhledávání areálů (název, okres, kategorie, parametry)
2. Analýza rizik a doporučení pro údržbu
3. Optimalizace tras pro údržbu
4. Statistické reporty a trendy
5. Predikce potřeb údržby

PŘÍKLADY DOTAZŮ:
- "Najdi všechny areály kategorie I. v Táboře"
- "Které areály potřebují nejdříve údržbu?"
- "Optimalizuj trasu pro areály v okresu České Budějovice"
- "Jaké jsou statistiky dokončených projektů?"

Vždy odpovídejte v češtině a zaměřte se na praktické řešení potřeb uživatele.`;
    }

    // =============================================
    // CHAT FUNCTIONALITY
    // =============================================

    /**
     * Process user message
     */
    async processMessage(message, context = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log('[AIService] Processing message:', message);

            // Update context with new data if provided
            if (context.arealsData || context.stats) {
                this.updateContext(context.arealsData, context.stats);
            }

            // Add to conversation history
            this.addToHistory('user', message);

            let response;

            if (this.isOnline && this.puterAPI) {
                // Online mode - use Puter.js AI
                response = await this.getAIResponse(message);
            } else {
                // Offline mode - use predefined responses
                response = this.getOfflineResponse(message);
            }

            // Add response to history
            this.addToHistory('assistant', response);

            console.log('[AIService] Response generated');
            return {
                success: true,
                response: response,
                isOnline: this.isOnline,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('[AIService] Error processing message:', error);
            
            const errorResponse = this.isOnline 
                ? "Omlouváme se, nastala chyba při komunikaci s AI asistentem. Zkuste to prosím znovu."
                : this.offlineResponses.error;

            return {
                success: false,
                response: errorResponse,
                error: error.message,
                isOnline: this.isOnline,
                timestamp: new Date()
            };
        }
    }

    /**
     * Get AI response using Puter.js
     */
    async getAIResponse(message) {
        try {
            // Prepare conversation for AI
            const messages = [
                {
                    role: "system",
                    content: this.getSystemPrompt()
                },
                ...this.conversationHistory.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: "user", 
                    content: message
                }
            ];

            // Call Puter AI
            const response = await Promise.race([
                this.puterAPI.chat(messages, {
                    model: this.config.model,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
                )
            ]);

            if (!response || !response.choices || !response.choices[0]) {
                throw new Error('Invalid AI response format');
            }

            return response.choices[0].message.content;

        } catch (error) {
            console.error('[AIService] AI API error:', error);
            
            // Fallback to offline response
            this.isOnline = false;
            return this.getOfflineResponse(message);
        }
    }

    /**
     * Get offline response based on message analysis
     */
    getOfflineResponse(message) {
        const messageLower = message.toLowerCase().normalize();

        // Greeting patterns
        if (this.matchesPattern(messageLower, ['ahoj', 'zdravím', 'dobrý den', 'čau', 'hello', 'hi'])) {
            return this.offlineResponses.greeting;
        }

        // Help patterns
        if (this.matchesPattern(messageLower, ['pomoc', 'nápověda', 'help', 'co umíš', 'jak funguje'])) {
            return this.offlineResponses.help;
        }

        // Statistics patterns
        if (this.matchesPattern(messageLower, ['statistik', 'přehled', 'stav', 'celkem', 'kolik'])) {
            return this.generateStatsResponse();
        }

        // Search patterns
        if (this.matchesPattern(messageLower, ['najdi', 'hledej', 'vyhledej', 'kde je', 'search'])) {
            return this.generateSearchResponse(message);
        }

        // District patterns
        if (this.matchesPattern(messageLower, ['okres', 'region', 'území', 'oblast'])) {
            return this.generateDistrictResponse();
        }

        // Risk category patterns
        if (this.matchesPattern(messageLower, ['kategorie', 'riziko', 'nebezpeč', 'priorit'])) {
            return this.generateCategoryResponse();
        }

        // Route patterns
        if (this.matchesPattern(messageLower, ['trasa', 'cesta', 'navigace', 'route', 'optimizace'])) {
            return this.generateRouteResponse();
        }

        // Maintenance patterns
        if (this.matchesPattern(messageLower, ['údržba', 'oprava', 'servis', 'maintenance'])) {
            return this.generateMaintenanceResponse();
        }

        // Default response
        return `Rozumím vašemu dotazu: "${message}"

V offline režimu mohu poskytnout pouze základní informace. Pro pokročilé analýzy a personalizované odpovědi je potřeba připojení k internetu.

Zkuste použít některý z těchto příkazů:
• "statistiky" - přehled dat
• "okresy" - seznam okresů 
• "kategorie" - info o rizicích
• "pomoc" - nápověda

Nebo počkejte na obnovení připojení pro plnou funkcionalité AI asistenta.`;
    }

    // =============================================
    // RESPONSE GENERATORS
    // =============================================

    /**
     * Generate statistics response
     */
    generateStatsResponse() {
        return `📊 **Přehled vodárenských areálů JVS**

**Celková čísla:**
• Celkem areálů: 41
• Dokončené projekty: ~12 (29%)
• Zbývající projekty: ~29 (71%)

**Podle okresů:**
• České Budějovice: 19 areálů (největší)
• Tábor: 10 areálů
• Prachatice: 4 areály
• Český Krumlov: 4 areály
• Písek: 2 areály
• Strakonice: 2 areály

**Podle kategorie rizika:**
• Kategorie I. (vysoké): ~18 areálů
• Kategorie II. (střední): ~12 areálů  
• Bez kategorie (standard): ~11 areálů

**Celková plocha:** ~182,000 m²
**Celková délka oplocení:** ~10,500 m

Pro aktuální a přesné statistiky je potřeba online připojení.`;
    }

    /**
     * Generate search response
     */
    generateSearchResponse(message) {
        // Try to extract search terms
        const searchTerms = this.extractSearchTerms(message);
        
        return `🔍 **Vyhledávání areálů**

Hledané termíny: "${searchTerms}"

V offline režimu nemohu prohledávat aktuální data areálů. Pro vyhledávání podle názvu, okresu nebo parametrů je potřeba online připojení.

**Dostupné okresy pro vyhledávání:**
• České Budějovice (CB) - 19 areálů
• Tábor (TA) - 10 areálů
• Prachatice (PT) - 4 areály
• Český Krumlov (CK) - 4 areály
• Písek (PI) - 2 areály
• Strakonice (ST) - 2 areály

**Příklady online vyhledávání:**
• "Najdi areály v Táboře"
• "Vyhledej VDJ Čekanice"
• "Areály kategorie I. s vysokým rizikem"`;
    }

    /**
     * Generate district response
     */
    generateDistrictResponse() {
        return `🗺️ **Okresy Jihočeského kraje**

**Přehled okresů v systému:**

**České Budějovice (CB)**
• Největší počet areálů: 19
• Hlavní město kraje
• Klíčové areály: ÚV Plav, VDJ Hlavatce

**Tábor (TA)** 
• Areálů: 10
• Historické město
• Důležité: ÚV Tábor, VDJ Čekanice

**Prachatice (PT)**
• Areálů: 4  
• Pohraniční oblast
• Specifika: ÚV Husinecka přehrada

**Český Krumlov (CK)**
• Areálů: 4
• UNESCO lokalita
• Zvláštní požadavky na údržbu

**Písek (PI)**
• Areálů: 2
• Menší okresy
• VDJ Amerika II, VDJ Zálužany

**Strakonice (ST)**
• Areálů: 2
• VDJ Drahonice, VDJ Vodňany`;
    }

    /**
     * Generate category response
     */
    generateCategoryResponse() {
        return `⚠️ **Kategorie rizika areálů**

**Kategorie I. - VYSOKÉ RIZIKO** 🔴
• Kritická infrastruktura
• Nejčastější kontroly
• Prioritní údržba
• Přísné bezpečnostní standardy
• Cca 18 areálů v systému

**Kategorie II. - STŘEDNÍ RIZIKO** 🟡
• Důležitá infrastruktura  
• Pravidelné kontroly
• Standardní údržba
• Běžné požadavky
• Cca 12 areálů v systému

**Bez kategorie - STANDARDNÍ** 🟢
• Základní infrastruktura
• Periodické kontroly
• Běžná údržba
• Minimální rizika
• Cca 11 areálů v systému

**Faktory ovlivňující riziko:**
• Velikost areálu
• Stáří infrastruktury
• Poloha a přístupnost
• Historické problémy
• Strategický význam`;
    }

    /**
     * Generate route response
     */
    generateRouteResponse() {
        return `🚗 **Optimalizace tras údržby**

V offline režimu nemohu počítat konkrétní trasy, ale mohu poskytnout obecné informace:

**Princip optimalizace:**
• Minimalizace celkové vzdálenosti
• Respektování priorit (kategorie rizika)
• Zohlednění časové náročnosti  
• Optimální pořadí návštěv

**Doporučené strategie:**
• Začít vysokorizikovými areály
• Seskupit areály podle okresů
• Zohlednit dopravní dostupnost
• Plánovat podle urgentnosti údržby

**Typické trasy:**
• CB okruh: Areály kolem Budějovic
• TA okruh: Táborský region
• Hranice tour: PT + CK oblasti

Pro výpočet konkrétních tras s GPS navigací potřebuji online připojení.`;
    }

    /**
     * Generate maintenance response
     */
    generateMaintenanceResponse() {
        return `🔧 **Údržba vodárenských areálů**

**Typy údržby:**
• **Preventivní** - Pravidelné kontroly, čištění, výměny
• **Korektivní** - Opravy poruch a problémů
• **Prediktivní** - Na základě monitoringu stavu
• **Nouzová** - Kritické situace

**Prioritizace údržby:**
1. **Kategorie I.** - Nejkritičtější areály
2. **Stáří posledního servisu** - Dlouho neudržované
3. **Velikost areálu** - Větší = větší dopad
4. **Historické problémy** - Známé problematické lokality

**Typické intervaly:**
• Kategorie I: 3-6 měsíců
• Kategorie II: 6-12 měsíců  
• Standard: 12-24 měsíců

**Doporučení:**
Pro přesné predikce údržby a personalizované plány je potřeba online AI analýza aktuálních dat areálů.`;
    }

    // =============================================
    // UTILITY METHODS
    // =============================================

    /**
     * Check if message matches patterns
     */
    matchesPattern(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    }

    /**
     * Extract search terms from message
     */
    extractSearchTerms(message) {
        // Remove common words and extract meaningful terms
        const stopWords = ['najdi', 'hledej', 'vyhledej', 'kde', 'je', 'jsou', 'v', 'na', 'pro', 'a', 'nebo'];
        const words = message.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        
        return words.join(' ') || 'nespecifikováno';
    }

    /**
     * Add message to conversation history
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });

        // Limit history length
        if (this.conversationHistory.length > this.config.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.config.maxHistoryLength);
        }
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        console.log('[AIService] Conversation history cleared');
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            model: this.config.model,
            historyLength: this.conversationHistory.length,
            lastUpdate: this.currentContext.timestamp
        };
    }

    // =============================================
    // SPECIALIZED QUERIES
    // =============================================

    /**
     * Search areals by natural language query
     */
    async searchAreals(query, arealsData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: "Vyhledávání pomocí přirozeného jazyka vyžaduje online připojení."
            };
        }

        try {
            const searchPrompt = `
Na základě dotazu: "${query}"

Vyhledej relevantní areály z těchto dat: ${JSON.stringify(arealsData.slice(0, 10))}

Odpověz strukturovaně:
1. Nalezené areály
2. Důvod výběru  
3. Doporučení
            `;

            const response = await this.processMessage(searchPrompt, { arealsData });
            return {
                success: true,
                results: response.response
            };

        } catch (error) {
            console.error('[AIService] Search error:', error);
            return {
                success: false,
                message: "Chyba při vyhledávání. Zkuste to prosím znovu."
            };
        }
    }

    /**
     * Analyze maintenance priorities
     */
    async analyzeMaintenancePriorities(arealsData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: "Analýza údržby vyžaduje online připojení k AI."
            };
        }

        try {
            const analysisPrompt = `
Analyzuj priority údržby pro tyto areály a doporuč optimální pořadí:

Data: ${JSON.stringify(arealsData, null, 2)}

Zohledni:
- Kategorii rizika
- Datum poslední údržby
- Velikost areálu
- Délku oplocení

Odpověz s konkrétními doporučeními a zdůvodněním.
            `;

            const response = await this.processMessage(analysisPrompt, { arealsData });
            return {
                success: true,
                analysis: response.response
            };

        } catch (error) {
            console.error('[AIService] Analysis error:', error);
            return {
                success: false,
                message: "Chyba při analýze. Zkuste to prosím znovu."
            };
        }
    }

    // =============================================
    // CLEANUP
    // =============================================

    /**
     * Cleanup method
     */
    destroy() {
        this.clearHistory();
        this.currentContext = {};
        this.puterAPI = null;
        this.isInitialized = false;
        this.isOnline = false;
        
        console.log('[AIService] Destroyed');
    }
}

// =============================================
// SINGLETON EXPORT
// =============================================

export const aiService = new AIService();
export default aiService;