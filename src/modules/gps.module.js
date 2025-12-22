/**
 * JVS Management System - GPS/RTK Navigation Module
 * Real-time positioning and navigation
 * Version: 2.0.0
 */

import { stateManager } from '../core/state.js';
import { mapService } from '../services/map.service.enhanced.js';

class GPSModule {
    constructor() {
        this.watchId = null;
        this.isTracking = false;
        this.currentPosition = null;
        this.targetAreal = null;
        this.heading = null;
    }

    /**
     * Initialize GPS module
     */
    async initialize() {
        console.log('[GPS] Initializing...');
        
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error('Geolocation není podporována v tomto prohlížeči');
        }

        // Request permission
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            console.log('[GPS] Permission status:', permission.state);
            
            if (permission.state === 'denied') {
                throw new Error('Přístup k poloze byl zamítnut');
            }
        } catch (error) {
            console.warn('[GPS] Permission API not supported:', error);
        }

        // Setup device orientation for heading
        this.setupOrientationTracking();
        
        console.log('[GPS] Initialized successfully');
        return true;
    }

    /**
     * Start tracking user position
     */
    startTracking() {
        if (this.isTracking) {
            console.warn('[GPS] Already tracking');
            return;
        }

        console.log('[GPS] Starting position tracking...');

        const options = {
            enableHighAccuracy: true,  // Use GPS if available
            timeout: 10000,            // 10 seconds timeout
            maximumAge: 0              // Don't use cached position
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => this.handlePositionError(error),
            options
        );

        this.isTracking = true;
        stateManager.set('gps.enabled', true);
    }

    /**
     * Stop tracking user position
     */
    stopTracking() {
        if (!this.isTracking) {
            return;
        }

        console.log('[GPS] Stopping position tracking...');

        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        this.isTracking = false;
        stateManager.set('gps.enabled', false);
    }

    /**
     * Handle position update
     */
    handlePositionUpdate(position) {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

        console.log(`[GPS] Position update: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(1)}m)`);

        this.currentPosition = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            altitude: altitude,
            altitudeAccuracy: altitudeAccuracy,
            heading: heading,
            speed: speed,
            timestamp: position.timestamp
        };

        // Update state
        stateManager.set('gps.position', this.currentPosition);
        stateManager.set('gps.accuracy', accuracy);
        
        if (heading !== null) {
            stateManager.set('gps.heading', heading);
        }

        // Show on map
        mapService.showUserLocation(position);

        // Calculate distance to target if set
        if (this.targetAreal) {
            this.updateNavigationInfo();
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('gpsPositionUpdate', {
            detail: { position: this.currentPosition }
        }));
    }

    /**
     * Handle position error
     */
    handlePositionError(error) {
        console.error('[GPS] Position error:', error);

        let message = 'Chyba při získávání polohy';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Přístup k poloze byl zamítnut';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Poloha není dostupná';
                break;
            case error.TIMEOUT:
                message = 'Vypršel časový limit pro získání polohy';
                break;
        }

        window.dispatchEvent(new CustomEvent('gpsError', {
            detail: { error: message }
        }));
    }

    /**
     * Setup device orientation tracking for heading
     */
    setupOrientationTracking() {
        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', (event) => {
                this.handleOrientationUpdate(event);
            });
        } else if ('ondeviceorientation' in window) {
            window.addEventListener('deviceorientation', (event) => {
                this.handleOrientationUpdate(event);
            });
        }
    }

    /**
     * Handle device orientation update
     */
    handleOrientationUpdate(event) {
        if (event.alpha !== null) {
            // Alpha is the compass heading (0-360)
            this.heading = event.alpha;
            stateManager.set('gps.heading', this.heading);
        }
    }

    /**
     * Set navigation target
     */
    setTarget(areal) {
        console.log('[GPS] Setting navigation target:', areal.name);
        
        this.targetAreal = areal;
        
        if (this.currentPosition) {
            this.updateNavigationInfo();
        }

        // Start tracking if not already
        if (!this.isTracking) {
            this.startTracking();
        }
    }

    /**
     * Clear navigation target
     */
    clearTarget() {
        console.log('[GPS] Clearing navigation target');
        this.targetAreal = null;
    }

    /**
     * Update navigation information
     */
    updateNavigationInfo() {
        if (!this.currentPosition || !this.targetAreal) {
            return;
        }

        const distance = this.calculateDistance(
            this.currentPosition.lat,
            this.currentPosition.lng,
            this.targetAreal.lat,
            this.targetAreal.lng
        );

        const bearing = this.calculateBearing(
            this.currentPosition.lat,
            this.currentPosition.lng,
            this.targetAreal.lat,
            this.targetAreal.lng
        );

        const navigationInfo = {
            distance: distance,
            bearing: bearing,
            target: this.targetAreal,
            eta: this.calculateETA(distance, this.currentPosition.speed)
        };

        window.dispatchEvent(new CustomEvent('navigationUpdate', {
            detail: navigationInfo
        }));
    }

    /**
     * Calculate distance between two points (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Calculate bearing between two points
     */
    calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                  Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        
        const θ = Math.atan2(y, x);
        const bearing = (θ * 180 / Math.PI + 360) % 360; // Convert to degrees

        return bearing;
    }

    /**
     * Calculate estimated time of arrival
     */
    calculateETA(distance, speed) {
        if (!speed || speed === 0) {
            return null;
        }

        // Speed is in m/s, distance in meters
        const timeInSeconds = distance / speed;
        return Math.round(timeInSeconds / 60); // Return minutes
    }

    /**
     * Get current position (one-time)
     */
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.handlePositionUpdate(position);
                    resolve(this.currentPosition);
                },
                (error) => {
                    this.handlePositionError(error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    /**
     * Simulate RTK precision (for demo purposes)
     * Real RTK would require external hardware
     */
    simulateRTKPrecision() {
        if (!this.currentPosition) {
            return null;
        }

        // RTK typically provides ±2cm accuracy
        return {
            ...this.currentPosition,
            accuracy: 0.02, // 2cm
            isRTK: true,
            note: 'Simulovaná RTK přesnost (±2cm)'
        };
    }
}

// Export singleton instance
export const gpsModule = new GPSModule();
