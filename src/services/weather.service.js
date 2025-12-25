/**
 * Weather Service - Live weather data integration
 * Uses OpenWeatherMap API for real-time weather
 * 
 * @version 4.0.0
 */

export class WeatherService {
    constructor() {
        this.apiKey = 'YOUR_OPENWEATHER_API_KEY'; // Replace with actual key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.currentWeather = null;
        this.updateInterval = 600000; // 10 minutes
        this.intervalId = null;
    }
    
    /**
     * Load weather for default location (České Budějovice)
     */
    async loadWeather(lat = 48.9745, lon = 14.4743) {
        try {
            const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=cs`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.currentWeather = {
                temp: data.main.temp,
                feels_like: data.main.feels_like,
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                wind: data.wind.speed * 3.6, // Convert m/s to km/h
                rain: data.rain?.['1h'] || 0,
                description: data.weather[0].description,
                icon: this.getWeatherIcon(data.weather[0].id),
                code: data.weather[0].id
            };
            
            console.log('✅ Weather loaded:', this.currentWeather);
            
            // Start auto-update
            this.startAutoUpdate(lat, lon);
            
            return this.currentWeather;
            
        } catch (error) {
            console.error('❌ Weather loading failed:', error);
            
            // Return fallback data
            this.currentWeather = {
                temp: 15,
                feels_like: 15,
                humidity: 70,
                pressure: 1013,
                wind: 10,
                rain: 0,
                description: 'Nedostupné',
                icon: '☁️',
                code: 800
            };
            
            return this.currentWeather;
        }
    }
    
    /**
     * Get current weather data
     */
    getCurrentWeather() {
        return this.currentWeather;
    }
    
    /**
     * Get weather icon based on OpenWeatherMap code
     */
    getWeatherIcon(code) {
        // Thunderstorm
        if (code >= 200 && code < 300) return '⛈️';
        
        // Drizzle
        if (code >= 300 && code < 400) return '🌦️';
        
        // Rain
        if (code >= 500 && code < 600) return '🌧️';
        
        // Snow
        if (code >= 600 && code < 700) return '🌨️';
        
        // Atmosphere (fog, mist, etc.)
        if (code >= 700 && code < 800) return '🌫️';
        
        // Clear
        if (code === 800) return '☀️';
        
        // Clouds
        if (code === 801) return '🌤️';
        if (code === 802) return '⛅';
        if (code >= 803) return '☁️';
        
        return '☁️';
    }
    
    /**
     * Start automatic weather updates
     */
    startAutoUpdate(lat, lon) {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.loadWeather(lat, lon);
        }, this.updateInterval);
    }
    
    /**
     * Stop automatic updates
     */
    stopAutoUpdate() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    /**
     * Check if weather is suitable for mowing
     */
    isSuitableForMowing() {
        if (!this.currentWeather) return true;
        
        // Not suitable if:
        // - Raining (> 0.5mm/h)
        // - Too windy (> 40 km/h)
        // - Thunderstorm
        
        if (this.currentWeather.rain > 0.5) return false;
        if (this.currentWeather.wind > 40) return false;
        if (this.currentWeather.code >= 200 && this.currentWeather.code < 300) return false;
        
        return true;
    }
    
    /**
     * Get weather recommendation
     */
    getRecommendation() {
        if (!this.currentWeather) return 'Počasí není k dispozici';
        
        if (!this.isSuitableForMowing()) {
            if (this.currentWeather.rain > 0.5) {
                return '⚠️ Déšť - nedoporučujeme seč';
            }
            if (this.currentWeather.wind > 40) {
                return '⚠️ Silný vítr - nedoporučujeme seč';
            }
            if (this.currentWeather.code >= 200 && this.currentWeather.code < 300) {
                return '⚠️ Bouřka - nedoporučujeme seč';
            }
        }
        
        if (this.currentWeather.temp < 5) {
            return '❄️ Nízká teplota - zvažte odložení';
        }
        
        if (this.currentWeather.temp > 30) {
            return '🌡️ Vysoká teplota - doporučujeme časné ranní hodiny';
        }
        
        return '✅ Vhodné podmínky pro seč';
    }
}