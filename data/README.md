# 📊 JVS Areals Dataset

Complete dataset of 41 water management facilities across South Bohemia region.

## 📁 Files

- **`areals-complete.js`** - Complete dataset with all 41 areals
- **`README.md`** - This file

## 📈 Dataset Overview

### Statistics

| Metric | Value |
|--------|-------|
| **Total Areals** | 41 |
| **Total Area** | 198,093 m² |
| **Total Fence Length** | 10,907 m |
| **Average Area** | 4,831 m² |
| **Largest Areal** | ÚV Plav (74,777 m²) |
| **Smallest Areal** | VDJ Húry (395 m²) |

### By Category

| Category | Count | Total Area | Total Fence |
|----------|-------|------------|-------------|
| **I.** (High Priority) | 23 | 128,975 m² | 6,437 m |
| **II.** (Medium Priority) | 15 | 53,892 m² | 3,044 m |
| **No Category** | 3 | 15,226 m² | 1,426 m |

### By District

| District | Name | Count |
|----------|------|-------|
| **CB** | České Budějovice | 19 |
| **TA** | Tábor | 10 |
| **CK** | Český Krumlov | 4 |
| **PT** | Prachatice | 4 |
| **PI** | Písek | 2 |
| **ST** | Strakonice | 2 |

### By Type

| Type | Description | Count |
|------|-------------|-------|
| **VDJ** | Vodojem (Water Tower) | 32 |
| **ÚV** | Úpravna vody (Water Treatment Plant) | 3 |
| **ČS** | Čerpací stanice (Pumping Station) | 3 |
| **Vrt** | Well | 1 |
| **Provozní Vodojem** | Operational Water Tower | 1 |

## 🗺️ Geographic Coverage

**Region:** South Bohemia (Jihočeský kraj), Czech Republic

**Coordinates Range:**
- Latitude: 48.78° - 49.55° N
- Longitude: 13.99° - 14.74° E

**Coverage Area:** ~6,000 km²

## 📋 Data Structure

Each areal contains:

```javascript
{
    id: "unique-identifier",           // Unique ID (e.g., "cb-uv-plav")
    name: "Areal Name",                // Full name (e.g., "ÚV Plav")
    district: "DISTRICT_CODE",         // 2-letter code (CB, TA, CK, PT, PI, ST)
    districtName: "District Name",     // Full district name
    category: "I." | "II." | null,     // Priority category
    type: "VDJ" | "ÚV" | "ČS" | ...,  // Facility type
    area_sqm: 1234,                    // Area in square meters
    fence_length_m: 123,               // Fence length in meters
    lat: 49.123456,                    // Latitude (WGS84)
    lng: 14.123456,                    // Longitude (WGS84)
    googleMapsUrl: "https://...",      // Google Maps link
    mapyCzUrl: "https://...",          // Mapy.cz link
    wazeUrl: "https://..."             // Waze navigation link
}
```

## 🚀 Usage

### Import in JavaScript

```javascript
// ES6 Module
import { AREALS_DATA, DATASET_STATS } from './data/areals-complete.js';

// Access data
console.log(`Total areals: ${AREALS_DATA.length}`);
console.log(`Total area: ${DATASET_STATS.total_area_sqm} m²`);

// Filter by district
const cbAreals = AREALS_DATA.filter(a => a.district === 'CB');

// Filter by category
const categoryI = AREALS_DATA.filter(a => a.category === 'I.');

// Sort by area
const largest = [...AREALS_DATA].sort((a, b) => b.area_sqm - a.area_sqm);
```

### Use in HTML

```html
<script type="module">
    import { AREALS_DATA } from './data/areals-complete.js';
    
    // Display on map
    AREALS_DATA.forEach(areal => {
        const marker = L.marker([areal.lat, areal.lng])
            .bindPopup(`<b>${areal.name}</b><br>${areal.area_sqm} m²`);
    });
</script>
```

### Global Access

```javascript
// Data is also available globally
console.log(window.AREALS_DATA);
console.log(window.DATASET_STATS);
console.log(window.DISTRICT_CODES);
```

## 🎨 Category Colors

```javascript
import { CATEGORY_COLORS } from './data/areals-complete.js';

// Category I. - Red (High Priority)
CATEGORY_COLORS["I."]    // "#dc3545"

// Category II. - Orange (Medium Priority)
CATEGORY_COLORS["II."]   // "#fd7e14"

// No Category - Blue (Standard)
CATEGORY_COLORS["null"]  // "#007bff"
```

## 🔍 Common Queries

### Find Largest Areals

```javascript
const top10 = AREALS_DATA
    .sort((a, b) => b.area_sqm - a.area_sqm)
    .slice(0, 10);
```

### Find Areals by District

```javascript
const taAreals = AREALS_DATA.filter(a => a.district === 'TA');
```

### Calculate Total Area by Category

```javascript
const categoryIArea = AREALS_DATA
    .filter(a => a.category === 'I.')
    .reduce((sum, a) => sum + a.area_sqm, 0);
```

### Find Areals Without Fence

```javascript
const noFence = AREALS_DATA.filter(a => a.fence_length_m === 0);
// Result: VDJ Húry
```

### Get Areals in Bounding Box

```javascript
function getAreaalsInBounds(minLat, maxLat, minLng, maxLng) {
    return AREALS_DATA.filter(a => 
        a.lat >= minLat && a.lat <= maxLat &&
        a.lng >= minLng && a.lng <= maxLng
    );
}
```

## 📊 Statistics Helper

```javascript
import { DATASET_STATS } from './data/areals-complete.js';

// Access pre-calculated statistics
console.log(DATASET_STATS.total_areals);           // 41
console.log(DATASET_STATS.total_area_sqm);         // 198093
console.log(DATASET_STATS.by_category["I."].count); // 23
console.log(DATASET_STATS.by_district.CB.count);   // 19
console.log(DATASET_STATS.extremes.largest.name);  // "ÚV Plav"
```

## 🗺️ Navigation Links

Each areal includes three navigation options:

1. **Google Maps** - `googleMapsUrl`
2. **Mapy.cz** - `mapyCzUrl` (Czech mapping service)
3. **Waze** - `wazeUrl` (Turn-by-turn navigation)

```javascript
// Open in Google Maps
window.open(areal.googleMapsUrl, '_blank');

// Open in Mapy.cz
window.open(areal.mapyCzUrl, '_blank');

// Navigate with Waze
window.open(areal.wazeUrl, '_blank');
```

## 📝 Data Validation

All data has been validated:

✅ **GPS Coordinates** - Within South Bohemia bounds  
✅ **Area Values** - 395 - 74,777 m²  
✅ **Fence Length** - 0 - 1,413 m  
✅ **District Codes** - Valid 2-letter codes  
✅ **Categories** - I., II., or null  
✅ **Types** - Valid facility types  

## 🔄 Updates

**Last Updated:** November 2025  
**Version:** 1.0.0  
**Source:** JVS Management System

## 📞 Support

For questions or issues with the dataset:

1. Check this README
2. Review the data structure in `areals-complete.js`
3. Open an issue on GitHub

## 📄 License

This dataset is part of the JVS Management System project.

---

**Total Records:** 41 areals  
**Coverage:** South Bohemia, Czech Republic  
**Format:** JavaScript ES6 Module  
**Encoding:** UTF-8
