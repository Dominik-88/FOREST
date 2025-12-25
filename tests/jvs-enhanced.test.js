/**
 * JVS Enhanced v3.0 - Unit Tests
 * Jest test suite for core functionality
 * 
 * @version 3.0.0
 * @author JVS Team
 */

// Mock data
const mockAreals = [
    {
        id: 1,
        nazev: "VDJ Amerika II",
        okres: "PI",
        kategorie: "I.",
        oploceni: 293,
        vymera: 3303,
        lat: 49.305131,
        lon: 14.166126,
        priorita: 95,
        naklady: 45000
    },
    {
        id: 2,
        nazev: "VDJ Drahonice",
        okres: "ST",
        kategorie: "I.",
        oploceni: 376,
        vymera: 5953,
        lat: 49.202902,
        lon: 14.063713,
        priorita: 92,
        naklady: 58000
    },
    {
        id: 3,
        nazev: "VDJ Vodňany",
        okres: "ST",
        kategorie: "II.",
        oploceni: 252,
        vymera: 1594,
        lat: 49.16455,
        lon: 14.177836,
        priorita: 75,
        naklady: 32000
    },
    {
        id: 4,
        nazev: "VDJ Hlavatce",
        okres: "CB",
        kategorie: "",
        oploceni: 424,
        vymera: 7968,
        lat: 49.063584,
        lon: 14.267751,
        priorita: 65,
        naklady: 42000
    }
];

// =============================================
// DISTANCE CALCULATION TESTS
// =============================================

describe('Distance Calculation (Haversine)', () => {
    
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    test('calculates distance between two points correctly', () => {
        const distance = calculateDistance(
            49.305131, 14.166126,  // VDJ Amerika II
            49.202902, 14.063713   // VDJ Drahonice
        );
        
        // Expected: ~13.5 km
        expect(distance).toBeGreaterThan(13000);
        expect(distance).toBeLessThan(14000);
    });
    
    test('returns 0 for same coordinates', () => {
        const distance = calculateDistance(
            49.305131, 14.166126,
            49.305131, 14.166126
        );
        
        expect(distance).toBe(0);
    });
    
    test('handles negative coordinates', () => {
        const distance = calculateDistance(
            -33.8688, 151.2093,  // Sydney
            -37.8136, 144.9631   // Melbourne
        );
        
        // Expected: ~714 km
        expect(distance).toBeGreaterThan(700000);
        expect(distance).toBeLessThan(730000);
    });
    
    test('calculates distance across equator', () => {
        const distance = calculateDistance(
            10, 0,   // North of equator
            -10, 0   // South of equator
        );
        
        // Expected: ~2220 km
        expect(distance).toBeGreaterThan(2200000);
        expect(distance).toBeLessThan(2250000);
    });
});

// =============================================
// FILTERING TESTS
// =============================================

describe('Areal Filtering', () => {
    
    function filterByCategory(areals, category) {
        return areals.filter(a => a.kategorie === category);
    }
    
    function filterByDistrict(areals, district) {
        return areals.filter(a => a.okres === district);
    }
    
    function filterBySearch(areals, query) {
        const lowerQuery = query.toLowerCase();
        return areals.filter(a => 
            a.nazev.toLowerCase().includes(lowerQuery) ||
            a.okres.toLowerCase().includes(lowerQuery)
        );
    }
    
    test('filters by category I.', () => {
        const filtered = filterByCategory(mockAreals, 'I.');
        expect(filtered.length).toBe(2);
        expect(filtered.every(a => a.kategorie === 'I.')).toBe(true);
    });
    
    test('filters by category II.', () => {
        const filtered = filterByCategory(mockAreals, 'II.');
        expect(filtered.length).toBe(1);
        expect(filtered[0].nazev).toBe('VDJ Vodňany');
    });
    
    test('filters by district', () => {
        const filtered = filterByDistrict(mockAreals, 'ST');
        expect(filtered.length).toBe(2);
        expect(filtered.every(a => a.okres === 'ST')).toBe(true);
    });
    
    test('filters by search query', () => {
        const filtered = filterBySearch(mockAreals, 'vdj');
        expect(filtered.length).toBe(4);
    });
    
    test('search is case-insensitive', () => {
        const filtered = filterBySearch(mockAreals, 'AMERIKA');
        expect(filtered.length).toBe(1);
        expect(filtered[0].nazev).toBe('VDJ Amerika II');
    });
    
    test('returns empty array for no matches', () => {
        const filtered = filterBySearch(mockAreals, 'nonexistent');
        expect(filtered.length).toBe(0);
    });
});

// =============================================
// STATISTICS TESTS
// =============================================

describe('Statistics Calculation', () => {
    
    function calculateStats(areals) {
        return {
            totalArea: areals.reduce((sum, a) => sum + a.vymera, 0),
            totalFence: areals.reduce((sum, a) => sum + a.oploceni, 0),
            avgPriority: Math.round(areals.reduce((sum, a) => sum + a.priorita, 0) / areals.length),
            totalCost: areals.reduce((sum, a) => sum + a.naklady, 0),
            count: areals.length
        };
    }
    
    test('calculates total area correctly', () => {
        const stats = calculateStats(mockAreals);
        expect(stats.totalArea).toBe(18818); // 3303 + 5953 + 1594 + 7968
    });
    
    test('calculates total fence correctly', () => {
        const stats = calculateStats(mockAreals);
        expect(stats.totalFence).toBe(1345); // 293 + 376 + 252 + 424
    });
    
    test('calculates average priority correctly', () => {
        const stats = calculateStats(mockAreals);
        expect(stats.avgPriority).toBe(82); // (95 + 92 + 75 + 65) / 4 ≈ 82
    });
    
    test('calculates total cost correctly', () => {
        const stats = calculateStats(mockAreals);
        expect(stats.totalCost).toBe(177000); // 45000 + 58000 + 32000 + 42000
    });
    
    test('handles empty array', () => {
        const stats = calculateStats([]);
        expect(stats.totalArea).toBe(0);
        expect(stats.count).toBe(0);
        expect(stats.avgPriority).toBeNaN();
    });
});

// =============================================
// SORTING TESTS
// =============================================

describe('Areal Sorting', () => {
    
    function sortByArea(areals, ascending = false) {
        return [...areals].sort((a, b) => 
            ascending ? a.vymera - b.vymera : b.vymera - a.vymera
        );
    }
    
    function sortByPriority(areals, ascending = false) {
        return [...areals].sort((a, b) => 
            ascending ? a.priorita - b.priorita : b.priorita - a.priorita
        );
    }
    
    function sortByDistance(areals, userLat, userLon) {
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3;
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            return R * c;
        };
        
        return [...areals]
            .map(a => ({
                ...a,
                distance: calculateDistance(userLat, userLon, a.lat, a.lon)
            }))
            .sort((a, b) => a.distance - b.distance);
    }
    
    test('sorts by area descending', () => {
        const sorted = sortByArea(mockAreals);
        expect(sorted[0].vymera).toBe(7968); // Hlavatce
        expect(sorted[3].vymera).toBe(1594); // Vodňany
    });
    
    test('sorts by area ascending', () => {
        const sorted = sortByArea(mockAreals, true);
        expect(sorted[0].vymera).toBe(1594); // Vodňany
        expect(sorted[3].vymera).toBe(7968); // Hlavatce
    });
    
    test('sorts by priority descending', () => {
        const sorted = sortByPriority(mockAreals);
        expect(sorted[0].priorita).toBe(95); // Amerika II
        expect(sorted[3].priorita).toBe(65); // Hlavatce
    });
    
    test('sorts by distance from user location', () => {
        const userLat = 49.2;
        const userLon = 14.1;
        
        const sorted = sortByDistance(mockAreals, userLat, userLon);
        
        // Verify distances are ascending
        for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].distance).toBeLessThanOrEqual(sorted[i + 1].distance);
        }
    });
});

// =============================================
// VALIDATION TESTS
// =============================================

describe('Input Validation', () => {
    
    function validateAreal(areal) {
        const errors = [];
        
        if (!areal.nazev || areal.nazev.length < 3) {
            errors.push('Název musí mít alespoň 3 znaky');
        }
        
        if (!areal.okres || !['CB', 'TA', 'PT', 'CK', 'PI', 'ST'].includes(areal.okres)) {
            errors.push('Neplatný okres');
        }
        
        if (!areal.vymera || areal.vymera <= 0) {
            errors.push('Výměra musí být větší než 0');
        }
        
        if (areal.oploceni < 0) {
            errors.push('Oplocení nemůže být záporné');
        }
        
        if (!areal.lat || areal.lat < 48 || areal.lat > 50) {
            errors.push('Neplatná latitude (musí být 48-50°N)');
        }
        
        if (!areal.lon || areal.lon < 13 || areal.lon > 15) {
            errors.push('Neplatná longitude (musí být 13-15°E)');
        }
        
        if (areal.priorita < 0 || areal.priorita > 100) {
            errors.push('Priorita musí být 0-100');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    test('validates correct areal', () => {
        const result = validateAreal(mockAreals[0]);
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
    });
    
    test('rejects short name', () => {
        const areal = { ...mockAreals[0], nazev: 'AB' };
        const result = validateAreal(areal);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Název musí mít alespoň 3 znaky');
    });
    
    test('rejects invalid district', () => {
        const areal = { ...mockAreals[0], okres: 'XX' };
        const result = validateAreal(areal);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Neplatný okres');
    });
    
    test('rejects zero area', () => {
        const areal = { ...mockAreals[0], vymera: 0 };
        const result = validateAreal(areal);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Výměra musí být větší než 0');
    });
    
    test('rejects negative fence', () => {
        const areal = { ...mockAreals[0], oploceni: -10 };
        const result = validateAreal(areal);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Oplocení nemůže být záporné');
    });
    
    test('rejects invalid GPS coordinates', () => {
        const areal = { ...mockAreals[0], lat: 60, lon: 20 };
        const result = validateAreal(areal);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('rejects invalid priority', () => {
        const areal = { ...mockAreals[0], priorita: 150 };
        const result = validateAreal(areal);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Priorita musí být 0-100');
    });
});

// =============================================
// ROUTE OPTIMIZATION TESTS
// =============================================

describe('Route Optimization', () => {
    
    function calculateNaiveDistance(points) {
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3;
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            return R * c;
        };
        
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            total += calculateDistance(
                points[i].lat, points[i].lon,
                points[i + 1].lat, points[i + 1].lon
            );
        }
        return total / 1000; // Convert to km
    }
    
    test('calculates naive route distance', () => {
        const distance = calculateNaiveDistance(mockAreals);
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(100); // Reasonable for South Bohemia
    });
    
    test('handles single point', () => {
        const distance = calculateNaiveDistance([mockAreals[0]]);
        expect(distance).toBe(0);
    });
    
    test('handles two points', () => {
        const distance = calculateNaiveDistance([mockAreals[0], mockAreals[1]]);
        expect(distance).toBeGreaterThan(0);
    });
});

// =============================================
// HEATMAP INTENSITY TESTS
// =============================================

describe('Heatmap Intensity Calculation', () => {
    
    function calculateIntensity(areal) {
        let intensity = 0.3; // Base
        
        if (areal.kategorie === 'I.') intensity = 1.0;
        else if (areal.kategorie === 'II.') intensity = 0.6;
        
        // Adjust by priority
        intensity *= (areal.priorita / 100);
        
        return intensity;
    }
    
    test('calculates high intensity for category I with high priority', () => {
        const intensity = calculateIntensity(mockAreals[0]); // Cat I, priority 95
        expect(intensity).toBeCloseTo(0.95, 2);
    });
    
    test('calculates medium intensity for category II', () => {
        const intensity = calculateIntensity(mockAreals[2]); // Cat II, priority 75
        expect(intensity).toBeCloseTo(0.45, 2);
    });
    
    test('calculates low intensity for no category', () => {
        const intensity = calculateIntensity(mockAreals[3]); // No cat, priority 65
        expect(intensity).toBeCloseTo(0.195, 2);
    });
    
    test('intensity is always between 0 and 1', () => {
        mockAreals.forEach(areal => {
            const intensity = calculateIntensity(areal);
            expect(intensity).toBeGreaterThanOrEqual(0);
            expect(intensity).toBeLessThanOrEqual(1);
        });
    });
});

// =============================================
// GEOFENCING TESTS
// =============================================

describe('Geofencing Logic', () => {
    
    function isWithinGeofence(userLat, userLon, arealLat, arealLon, radius) {
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371e3;
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            return R * c;
        };
        
        const distance = calculateDistance(userLat, userLon, arealLat, arealLon);
        return distance <= radius;
    }
    
    test('detects user within geofence', () => {
        const result = isWithinGeofence(
            49.305, 14.166,  // User near Amerika II
            49.305131, 14.166126,  // Amerika II
            500  // 500m radius
        );
        expect(result).toBe(true);
    });
    
    test('detects user outside geofence', () => {
        const result = isWithinGeofence(
            49.0, 14.0,  // User far away
            49.305131, 14.166126,  // Amerika II
            500  // 500m radius
        );
        expect(result).toBe(false);
    });
    
    test('handles exact location', () => {
        const result = isWithinGeofence(
            49.305131, 14.166126,
            49.305131, 14.166126,
            500
        );
        expect(result).toBe(true);
    });
});

// =============================================
// EXPORT TESTS
// =============================================

describe('Data Export', () => {
    
    function exportToCSV(areals) {
        const headers = ['ID', 'Název', 'Okres', 'Kategorie', 'Výměra', 'Oplocení'];
        const rows = areals.map(a => [
            a.id,
            a.nazev,
            a.okres,
            a.kategorie || '',
            a.vymera,
            a.oploceni
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }
    
    function exportToGeoJSON(areals) {
        return {
            type: 'FeatureCollection',
            features: areals.map(a => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [a.lon, a.lat]
                },
                properties: {
                    id: a.id,
                    nazev: a.nazev,
                    okres: a.okres,
                    kategorie: a.kategorie || '',
                    vymera: a.vymera
                }
            }))
        };
    }
    
    test('exports to CSV format', () => {
        const csv = exportToCSV(mockAreals);
        expect(csv).toContain('ID');
        expect(csv).toContain('Název');
        expect(csv).toContain('VDJ Amerika II');
        expect(csv.split('\n').length).toBe(5); // Header + 4 rows
    });
    
    test('exports to GeoJSON format', () => {
        const geojson = exportToGeoJSON(mockAreals);
        expect(geojson.type).toBe('FeatureCollection');
        expect(geojson.features.length).toBe(4);
        expect(geojson.features[0].geometry.type).toBe('Point');
        expect(geojson.features[0].geometry.coordinates).toEqual([14.166126, 49.305131]);
    });
    
    test('CSV handles special characters', () => {
        const areal = { ...mockAreals[0], nazev: 'Test, "Special"' };
        const csv = exportToCSV([areal]);
        expect(csv).toContain('"Test, ""Special"""');
    });
});

// =============================================
// RUN TESTS
// =============================================

console.log('🧪 Running JVS Enhanced v3.0 Test Suite...\n');

// Note: To run these tests, install Jest:
// npm install --save-dev jest
// npm test