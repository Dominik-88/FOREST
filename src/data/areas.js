/**
 * JVS Management PWA - Aktualizovaná data areálů (11/2025)
 * 
 * Struktura:
 * - id: Unikátní identifikátor (1-41)
 * - name: Název areálu
 * - district: Okres (PI, ST, CB, PT, CK, TA)
 * - lat/lng: GPS souřadnice
 * - area: Výměra plochy v m²
 * - fence: Délka oplocení v bm
 * - cat: Kategorie ("I.", "II.", "B" = bez kategorie)
 * - is_maintained: Status údržby (false = k údržbě, true = hotovo)
 * - last: Datum poslední seče
 */

export const areas = [
    {id:1,name:"VDJ Amerika II",district:"PI",lat:49.305131,lng:14.166126,area:3303,fence:293,cat:"I.",is_maintained:false,last:"15.05.2024"},
    {id:2,name:"VDJ Drahonice",district:"ST",lat:49.202902,lng:14.063713,area:5953,fence:376,cat:"I.",is_maintained:false,last:"20.06.2024"},
    {id:3,name:"VDJ Vodňany",district:"ST",lat:49.164550,lng:14.177836,area:1594,fence:252,cat:"I.",is_maintained:false,last:"10.06.2024"},
    {id:4,name:"VDJ Hlavatce",district:"CB",lat:49.063584,lng:14.267751,area:7968,fence:424,cat:"B",is_maintained:false,last:"05.08.2023"},
    {id:5,name:"VDJ Šibeniční vrch I",district:"PT",lat:49.025083,lng:13.994111,area:1835,fence:245,cat:"I.",is_maintained:false,last:"12.04.2024"},
    {id:6,name:"ÚV Husinecka přehrada",district:"PT",lat:49.034362,lng:13.996830,area:4908,fence:703,cat:"B",is_maintained:false,last:"08.07.2024"},
    {id:7,name:"VDJ Šibeniční vrch II",district:"PT",lat:49.026710,lng:13.994001,area:3206,fence:340,cat:"I.",is_maintained:false,last:"12.04.2024"},
    {id:8,name:"VDJ Zálužany",district:"PI",lat:49.552857,lng:14.083381,area:2350,fence:299,cat:"B",is_maintained:false,last:"25.05.2024"},
    {id:9,name:"VDJ Ptáčník",district:"PT",lat:49.066147,lng:14.186844,area:1070,fence:239,cat:"II.",is_maintained:false,last:"15.06.2024"},
    {id:10,name:"VDJ Zdoba",district:"CB",lat:49.212422,lng:14.338095,area:15523,fence:225,cat:"II.",is_maintained:false,last:"30.07.2024"},
    {id:11,name:"VDJ Domoradice",district:"CK",lat:48.829651,lng:14.326564,area:4148,fence:450,cat:"I.",is_maintained:false,last:"18.06.2024"},
    {id:12,name:"VDJ Horní Brána",district:"CK",lat:48.807970,lng:14.329352,area:1665,fence:187,cat:"I.",is_maintained:false,last:"18.06.2024"},
    {id:13,name:"VDJ Netřebice",district:"CK",lat:48.783277,lng:14.456447,area:877,fence:136,cat:"I.",is_maintained:false,last:"20.06.2024"},
    {id:14,name:"VDJ Plešivec",district:"CK",lat:48.802231,lng:14.304933,area:975,fence:119,cat:"I.",is_maintained:false,last:"18.06.2024"},
    {id:15,name:"VDJ Doudleby",district:"CB",lat:48.888896,lng:14.480271,area:413,fence:79,cat:"II.",is_maintained:false,last:"25.07.2024"},
    {id:16,name:"VDJ Jankov",district:"CB",lat:48.968747,lng:14.301697,area:784,fence:106,cat:"I.",is_maintained:false,last:"10.07.2024"},
    {id:17,name:"VDJ Hosín II",district:"CB",lat:49.030641,lng:14.501012,area:4173,fence:399,cat:"I.",is_maintained:false,last:"15.08.2024"},
    {id:18,name:"VDJ Chlum",district:"CB",lat:49.096493,lng:14.388679,area:535,fence:63,cat:"II.",is_maintained:false,last:"20.07.2024"},
    {id:19,name:"VDJ Chotýčany",district:"CB",lat:49.070748,lng:14.519460,area:4775,fence:338,cat:"II.",is_maintained:false,last:"22.08.2024"},
    {id:20,name:"VDJ Rudolfov III",district:"CB",lat:48.986207,lng:14.547076,area:1868,fence:174,cat:"I.",is_maintained:false,last:"22.09.2024"},
    {id:21,name:"VDJ Rimov - Vesce",district:"CB",lat:48.847847,lng:14.466957,area:662,fence:99,cat:"I.",is_maintained:false,last:"05.08.2024"},
    {id:22,name:"VDJ Hosin",district:"CB",lat:49.033641,lng:14.492878,area:809,fence:125,cat:"II.",is_maintained:false,last:"15.08.2024"},
    {id:23,name:"VDJ Včelná",district:"CB",lat:48.924663,lng:14.463506,area:8660,fence:476,cat:"II.",is_maintained:false,last:"28.08.2024"},
    {id:24,name:"VDJ Húry",district:"CB",lat:49.006417,lng:14.549815,area:395,fence:0,cat:"I.",is_maintained:false,last:"10.09.2024"},
    {id:25,name:"VDJ Chlumec",district:"CB",lat:49.124766,lng:14.431321,area:811,fence:110,cat:"II.",is_maintained:false,last:"15.07.2024"},
    {id:26,name:"VDJ Olešník",district:"CB",lat:49.111103,lng:14.377766,area:380,fence:117,cat:"I.",is_maintained:false,last:"18.07.2024"},
    {id:27,name:"ČS Bukovec",district:"CB",lat:48.881608,lng:14.449233,area:4943,fence:300,cat:"I.",is_maintained:false,last:"25.08.2024"},
    {id:28,name:"VDJ Heřman",district:"CB",lat:48.909479,lng:14.499876,area:982,fence:119,cat:"II.",is_maintained:false,last:"30.08.2024"},
    {id:29,name:"ČS Vidov u řeky",district:"CB",lat:48.924157,lng:14.489619,area:2501,fence:212,cat:"II.",is_maintained:false,last:"05.09.2024"},
    {id:30,name:"Vrt Vidov",district:"CB",lat:48.924066,lng:14.489679,area:470,fence:164,cat:"II.",is_maintained:false,last:"05.09.2024"},
    {id:31,name:"ÚV Plav",district:"CB",lat:48.912611,lng:14.494018,area:74777,fence:1413,cat:"I.",is_maintained:false,last:"01.11.2024"},
    {id:32,name:"VDJ Čekanice",district:"TA",lat:49.422197,lng:14.689896,area:6344,fence:450,cat:"I.",is_maintained:false,last:"18.05.2024"},
    {id:33,name:"VDJ Svatá Anna",district:"TA",lat:49.401133,lng:14.698640,area:4192,fence:264,cat:"I.",is_maintained:false,last:"20.05.2024"},
    {id:34,name:"VDJ Bezděčín",district:"TA",lat:49.323096,lng:14.628405,area:1996,fence:169,cat:"I.",is_maintained:false,last:"25.05.2024"},
    {id:35,name:"VDJ Milevsko",district:"TA",lat:49.452521,lng:14.344102,area:823,fence:129,cat:"I.",is_maintained:false,last:"10.06.2024"},
    {id:36,name:"VDJ Hodušín",district:"TA",lat:49.429670,lng:14.474214,area:1708,fence:205,cat:"II.",is_maintained:false,last:"15.06.2024"},
    {id:37,name:"VDJ Všechov",district:"TA",lat:49.430159,lng:14.623205,area:1574,fence:199,cat:"I.",is_maintained:false,last:"18.05.2024"},
    {id:38,name:"VDJ Zlukov",district:"TA",lat:49.196289,lng:14.736382,area:1520,fence:184,cat:"II.",is_maintained:false,last:"20.06.2024"},
    {id:39,name:"ÚV Tábor",district:"TA",lat:49.422872,lng:14.666426,area:12262,fence:350,cat:"II.",is_maintained:false,last:"25.06.2024"},
    {id:40,name:"ČS Sudoměřice",district:"TA",lat:49.286580,lng:14.547794,area:2508,fence:220,cat:"I.",is_maintained:false,last:"30.06.2024"},
    {id:41,name:"Provozní Vodojem Tábor",district:"TA",lat:49.424264,lng:14.666384,area:1853,fence:155,cat:"II.",is_maintained:false,last:"25.06.2024"}
];

/**
 * Statistiky areálů
 */
export const statistics = {
    total: 41,
    byCategory: {
        "I.": { count: 23, totalArea: 128975, totalFence: 6437 },
        "II.": { count: 15, totalArea: 53892, totalFence: 3044 },
        "B": { count: 3, totalArea: 15226, totalFence: 1426 }
    },
    byDistrict: {
        "PI": 2,
        "ST": 2,
        "CB": 22,
        "PT": 4,
        "CK": 4,
        "TA": 7
    },
    totalArea: 198093,
    totalFence: 10907
};

/**
 * Pomocné funkce pro práci s daty
 */
export const dataUtils = {
    /**
     * Získání areálu podle ID
     */
    getAreaById: (id) => areas.find(a => a.id === id),
    
    /**
     * Filtrování areálů
     */
    filterAreas: (filters) => {
        return areas.filter(area => {
            if (filters.district && area.district !== filters.district) return false;
            if (filters.category && area.cat !== filters.category) return false;
            if (filters.onlyUnmaintained && area.is_maintained) return false;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                if (!area.name.toLowerCase().includes(searchLower)) return false;
            }
            return true;
        });
    },
    
    /**
     * Seřazení podle vzdálenosti od bodu
     */
    sortByDistance: (userLat, userLng) => {
        return areas.map(area => ({
            ...area,
            distance: calculateDistance(userLat, userLng, area.lat, area.lng)
        })).sort((a, b) => a.distance - b.distance);
    },
    
    /**
     * Získání areálů k údržbě
     */
    getUnmaintainedAreas: () => areas.filter(a => !a.is_maintained),
    
    /**
     * Statistiky podle filtru
     */
    getFilteredStats: (filteredAreas) => ({
        total: filteredAreas.length,
        unmaintained: filteredAreas.filter(a => !a.is_maintained).length,
        totalArea: filteredAreas.reduce((sum, a) => sum + a.area, 0),
        totalFence: filteredAreas.reduce((sum, a) => sum + a.fence, 0)
    })
};

/**
 * Výpočet vzdálenosti mezi dvěma body (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Poloměr Země v km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}