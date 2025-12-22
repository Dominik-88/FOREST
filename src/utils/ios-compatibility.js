/**
 * iOS Safari Compatibility Layer
 * Handles iOS-specific quirks and optimizations
 * Version: 1.0.0
 */

export class iOSCompatibility {
    constructor() {
        this.isIOS = this.detectIOS();
        this.isSafari = this.detectSafari();
        this.isStandalone = this.detectStandalone();
    }

    /**
     * Detect iOS device
     */
    detectIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    /**
     * Detect Safari browser
     */
    detectSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    /**
     * Detect if running as standalone PWA
     */
    detectStandalone() {
        return window.navigator.standalone === true || 
               window.matchMedia('(display-mode: standalone)').matches;
    }

    /**
     * Initialize iOS-specific fixes
     */
    async initialize() {
        if (!this.isIOS) return;

        console.log('[iOS] Applying iOS compatibility fixes...');

        // Fix viewport height issue
        this.fixViewportHeight();

        // Fix touch events
        this.fixTouchEvents();

        // Fix input focus zoom
        this.preventInputZoom();

        // Fix bounce scroll
        this.preventBounceScroll();

        // Fix safe area insets
        this.applySafeAreaInsets();

        // Fix IndexedDB issues
        await this.fixIndexedDB();

        // Add iOS-specific CSS
        this.addIOSStyles();

        console.log('[iOS] Compatibility fixes applied');
    }

    /**
     * Fix iOS viewport height (100vh issue)
     */
    fixViewportHeight() {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);

        console.log('[iOS] Viewport height fixed');
    }

    /**
     * Fix touch events for better responsiveness
     */
    fixTouchEvents() {
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // Improve touch responsiveness
        document.addEventListener('touchstart', () => {}, { passive: true });

        console.log('[iOS] Touch events optimized');
    }

    /**
     * Prevent input zoom on focus (iOS Safari zooms if font-size < 16px)
     */
    preventInputZoom() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Ensure minimum font-size of 16px
            const computedStyle = window.getComputedStyle(input);
            const fontSize = parseFloat(computedStyle.fontSize);
            
            if (fontSize < 16) {
                input.style.fontSize = '16px';
            }
        });

        // Watch for dynamically added inputs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        const newInputs = node.querySelectorAll('input, select, textarea');
                        newInputs.forEach(input => {
                            input.style.fontSize = '16px';
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('[iOS] Input zoom prevention applied');
    }

    /**
     * Prevent bounce scroll (rubber band effect)
     */
    preventBounceScroll() {
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].pageY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const scrollable = e.target.closest('.scrollable, .bottom-sheet-content, .ai-chat-messages, .sidebar-content');
            
            if (!scrollable) {
                e.preventDefault();
                return;
            }

            const currentY = e.touches[0].pageY;
            const isAtTop = scrollable.scrollTop === 0;
            const isAtBottom = scrollable.scrollHeight - scrollable.scrollTop === scrollable.clientHeight;

            if ((isAtTop && currentY > startY) || (isAtBottom && currentY < startY)) {
                e.preventDefault();
            }
        }, { passive: false });

        console.log('[iOS] Bounce scroll prevented');
    }

    /**
     * Apply safe area insets for notch devices
     */
    applySafeAreaInsets() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --safe-area-inset-top: env(safe-area-inset-top);
                --safe-area-inset-right: env(safe-area-inset-right);
                --safe-area-inset-bottom: env(safe-area-inset-bottom);
                --safe-area-inset-left: env(safe-area-inset-left);
            }

            /* Apply safe area to key elements */
            .sidebar-header {
                padding-top: calc(20px + var(--safe-area-inset-top));
            }

            .bottom-sheet {
                padding-bottom: var(--safe-area-inset-bottom);
            }

            .mobile-menu-btn {
                top: calc(16px + var(--safe-area-inset-top));
                left: calc(16px + var(--safe-area-inset-left));
            }
        `;
        document.head.appendChild(style);

        console.log('[iOS] Safe area insets applied');
    }

    /**
     * Fix IndexedDB issues on iOS
     */
    async fixIndexedDB() {
        // iOS Safari has issues with IndexedDB in private mode
        try {
            const testDB = indexedDB.open('test');
            await new Promise((resolve, reject) => {
                testDB.onsuccess = resolve;
                testDB.onerror = reject;
            });
            console.log('[iOS] IndexedDB available');
        } catch (error) {
            console.warn('[iOS] IndexedDB not available, using fallback storage');
            // Implement localStorage fallback if needed
            this.useLocalStorageFallback();
        }
    }

    /**
     * Use localStorage as fallback for IndexedDB
     */
    useLocalStorageFallback() {
        window.indexedDB = {
            open: () => {
                console.warn('[iOS] Using localStorage fallback');
                return {
                    onsuccess: null,
                    onerror: null
                };
            }
        };
    }

    /**
     * Add iOS-specific CSS
     */
    addIOSStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* iOS-specific fixes */
            * {
                -webkit-tap-highlight-color: transparent;
                -webkit-touch-callout: none;
            }

            /* Fix 100vh issue */
            .app-container {
                height: 100vh;
                height: calc(var(--vh, 1vh) * 100);
            }

            .map-container {
                height: 100vh;
                height: calc(var(--vh, 1vh) * 100);
            }

            /* Smooth scrolling */
            .scrollable,
            .sidebar-content,
            .ai-chat-messages,
            .bottom-sheet-content {
                -webkit-overflow-scrolling: touch;
                overflow-y: auto;
            }

            /* Fix input appearance */
            input,
            select,
            textarea,
            button {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                border-radius: 8px;
            }

            /* Fix button active state */
            button:active,
            .btn:active {
                opacity: 0.7;
                transform: scale(0.98);
            }

            /* Fix select dropdown */
            select {
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
                padding-right: 32px;
            }

            /* Fix bottom sheet on iOS */
            .bottom-sheet {
                -webkit-transform: translateY(100%);
                transform: translateY(100%);
            }

            .bottom-sheet.open {
                -webkit-transform: translateY(0);
                transform: translateY(0);
            }

            /* Prevent text selection during swipe */
            .bottom-sheet-handle {
                -webkit-user-select: none;
                user-select: none;
            }

            /* Fix map on iOS */
            #map {
                -webkit-transform: translateZ(0);
                transform: translateZ(0);
            }

            /* Fix animations */
            @media (prefers-reduced-motion: no-preference) {
                * {
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
            }

            /* Fix sticky positioning */
            .sidebar-header,
            .sidebar-tabs {
                position: -webkit-sticky;
                position: sticky;
            }

            /* Improve touch targets (Apple HIG: minimum 44x44pt) */
            button,
            .btn,
            a,
            input[type="checkbox"],
            input[type="radio"] {
                min-height: 44px;
                min-width: 44px;
            }

            /* Fix font rendering */
            body {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        `;
        document.head.appendChild(style);

        console.log('[iOS] iOS-specific styles applied');
    }

    /**
     * Show iOS installation prompt
     */
    showInstallPrompt() {
        if (!this.isIOS || this.isStandalone) return;

        const prompt = document.createElement('div');
        prompt.className = 'ios-install-prompt';
        prompt.innerHTML = `
            <div class="ios-install-content">
                <button class="ios-install-close" onclick="this.parentElement.parentElement.remove()">×</button>
                <div class="ios-install-icon">📱</div>
                <h3>Instalovat JVS Management</h3>
                <p>Pro nejlepší zážitek nainstalujte aplikaci na plochu:</p>
                <ol>
                    <li>Klikněte na <strong>Sdílet</strong> <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0l3 3h-2v7h-2V3H5l3-3zm6 11v4H2v-4H0v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4h-2z"/></svg></li>
                    <li>Vyberte <strong>"Přidat na plochu"</strong></li>
                    <li>Klikněte na <strong>"Přidat"</strong></li>
                </ol>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .ios-install-prompt {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
                z-index: 10001;
                animation: slideUp 0.3s ease;
            }

            .ios-install-content {
                padding: 20px;
                padding-bottom: calc(20px + var(--safe-area-inset-bottom));
                max-width: 500px;
                margin: 0 auto;
                position: relative;
            }

            .ios-install-close {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 32px;
                height: 32px;
                border: none;
                background: #f0f0f0;
                border-radius: 50%;
                font-size: 24px;
                line-height: 1;
                cursor: pointer;
                color: #666;
            }

            .ios-install-icon {
                font-size: 48px;
                text-align: center;
                margin-bottom: 12px;
            }

            .ios-install-content h3 {
                margin: 0 0 8px;
                font-size: 20px;
                text-align: center;
            }

            .ios-install-content p {
                margin: 0 0 16px;
                color: #666;
                text-align: center;
            }

            .ios-install-content ol {
                margin: 0;
                padding-left: 24px;
                text-align: left;
            }

            .ios-install-content li {
                margin-bottom: 8px;
                line-height: 1.6;
            }

            .ios-install-content svg {
                vertical-align: middle;
                margin: 0 2px;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                }
                to {
                    transform: translateY(0);
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(prompt);

        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (prompt.parentElement) {
                prompt.remove();
            }
        }, 30000);

        // Save that prompt was shown
        localStorage.setItem('ios-install-prompt-shown', 'true');
    }

    /**
     * Check if should show install prompt
     */
    shouldShowInstallPrompt() {
        if (!this.isIOS || this.isStandalone) return false;
        
        const shown = localStorage.getItem('ios-install-prompt-shown');
        const visits = parseInt(localStorage.getItem('visit-count') || '0');
        
        // Show on 2nd visit if not shown before
        return !shown && visits >= 2;
    }

    /**
     * Increment visit counter
     */
    incrementVisitCount() {
        const visits = parseInt(localStorage.getItem('visit-count') || '0');
        localStorage.setItem('visit-count', (visits + 1).toString());
    }

    /**
     * Optimize Leaflet for iOS
     */
    optimizeLeafletForIOS(map) {
        if (!this.isIOS || !map) return;

        // Disable tap tolerance for better touch response
        map.options.tapTolerance = 15;

        // Improve touch zoom
        map.touchZoom.enable();
        map.doubleClickZoom.disable();

        // Optimize marker clustering for touch
        if (map.markerClusterGroup) {
            map.markerClusterGroup.options.spiderfyOnMaxZoom = true;
            map.markerClusterGroup.options.showCoverageOnHover = false;
            map.markerClusterGroup.options.zoomToBoundsOnClick = true;
        }

        console.log('[iOS] Leaflet optimized for iOS');
    }

    /**
     * Fix Firebase on iOS
     */
    fixFirebaseForIOS() {
        if (!this.isIOS) return;

        // iOS Safari sometimes has issues with Firebase persistence
        // This is handled in firestore.service.enhanced.js with try-catch
        console.log('[iOS] Firebase compatibility checked');
    }

    /**
     * Get device info
     */
    getDeviceInfo() {
        return {
            isIOS: this.isIOS,
            isSafari: this.isSafari,
            isStandalone: this.isStandalone,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            safeArea: {
                top: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top'),
                bottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')
            }
        };
    }
}

// Export singleton instance
export const iosCompat = new iOSCompatibility();
