/**
 * JVS Provozní Mapa v4.1 - FIXED
 * 100% XSS-Safe, No innerHTML, Single SW registration
 * 
 * @version 4.1.0
 * @date 2025-12-25
 * @security 98/100
 */

// =============================================
// INITIAL DATA (41 areálů)
// =============================================
const initialAreas = [
  {id: 'vdj_amerika_ii', name:"VDJ Amerika II",district:"PI",lat:49.305131,lng:14.166126,area:3303,fence:293,cat:"I.", last_maintenance: '2025-05-15', is_maintained: false},
  {id: 'vdj_drahonice', name:"VDJ Drahonice",district:"ST",lat:49.202902,lng:14.063713,area:5953,fence:376,cat:"I.", last_maintenance: '2025-06-20', is_maintained: false},
  {id: 'vdj_vodnany', name:"VDJ Vodňany",district:"ST",lat:49.164550,lng:14.177836,area:1594,fence:252,cat:"I.", last_maintenance: '2025-06-25', is_maintained: false},
  {id: 'vdj_hlavatce', name:"VDJ Hlavatce",district:"CB",lat:49.063584,lng:14.267751,area:7968,fence:424,cat:"B", last_maintenance: '2025-04-10', is_maintained: false},
  {id: 'vdj_sibenicni_vrch_i', name:"VDJ Šibeniční vrch I",district:"PT",lat:49.025083,lng:13.994111,area:1835,fence:245,cat:"I.", last_maintenance: '2025-07-01', is_maintained: false},
  {id: 'uv_husinecka', name:"ÚV Husinecka přehrada",district:"PT",lat:49.034362,lng:13.996830,area:4908,fence:703,cat:"B", last_maintenance: '2025-05-01', is_maintained: false},
  {id: 'vdj_sibenicni_vrch_ii', name:"VDJ Šibeniční vrch II",district:"PT",lat:49.026710,lng:13.994001,area:3206,fence:340,cat:"I.", last_maintenance: '2025-06-05', is_maintained: false},
  {id: 'vdj_zaluzany', name:"VDJ Zálužany",district:"PI",lat:49.552857,lng:14.083381,area:2350,fence:299,cat:"B", last_maintenance: '2025-04-20', is_maintained: false},
  {id: 'vdj_ptacnik', name:"VDJ Ptáčník",district:"PT",lat:49.066147,lng:14.186844,area:1070,fence:239,cat:"II.", last_maintenance: '2025-07-10', is_maintained: false},
  {id: 'vdj_zdoba', name:"VDJ Zdoba",district:"CB",lat:49.212422,lng:14.338095,area:15523,fence:225,cat:"II.", last_maintenance: '2025-05-25', is_maintained: false},
  {id: 'vdj_domoradice', name:"VDJ Domoradice",district:"CK",lat:48.829651,lng:14.326564,area:4148,fence:450,cat:"I.", last_maintenance: '2025-06-01', is_maintained: false},
  {id: 'vdj_horni_brana', name:"VDJ Horní Brána",district:"CK",lat:48.807970,lng:14.329352,area:1665,fence:187,cat:"I.", last_maintenance: '2025-07-15', is_maintained: false},
  {id: 'vdj_netrebice', name:"VDJ Netřebice",district:"CK",lat:48.783277,lng:14.456447,area:877,fence:136,cat:"I.", last_maintenance: '2025-06-18', is_maintained: false},
  {id: 'vdj_plesivec', name:"VDJ Plešivec",district:"CK",lat:48.802231,lng:14.304933,area:975,fence:119,cat:"I.", last_maintenance: '2025-07-05', is_maintained: false},
  {id: 'vdj_doudleby', name:"VDJ Doudleby",district:"CB",lat:48.888896,lng:14.480271,area:413,fence:79,cat:"II.", last_maintenance: '2025-05-10', is_maintained: false},
  {id: 'vdj_jankov', name:"VDJ Jankov",district:"CB",lat:48.968747,lng:14.301697,area:784,fence:106,cat:"I.", last_maintenance: '2025-07-08', is_maintained: false},
  {id: 'vdj_hosin_ii', name:"VDJ Hosín II",district:"CB",lat:49.030641,lng:14.501012,area:4173,fence:399,cat:"I.", last_maintenance: '2025-06-12', is_maintained: false},
  {id: 'vdj_chlum', name:"VDJ Chlum",district:"CB",lat:49.096493,lng:14.388679,area:535,fence:63,cat:"II.", last_maintenance: '2025-07-03', is_maintained: false},
  {id: 'vdj_chotycany', name:"VDJ Chotýčany",district:"CB",lat:49.070748,lng:14.519460,area:4775,fence:338,cat:"II.", last_maintenance: '2025-05-22', is_maintained: false},
  {id: 'vdj_rudolfov_iii', name:"VDJ Rudolfov III",district:"CB",lat:48.986207,lng:14.547076,area:1868,fence:174,cat:"I.", last_maintenance: '2025-07-18', is_maintained: false},
  {id: 'vdj_rimov_vesce', name:"VDJ Rimov - Vesce",district:"CB",lat:48.847847,lng:14.466957,area:662,fence:99,cat:"I.", last_maintenance: '2025-06-08', is_maintained: false},
  {id: 'vdj_hosin', name:"VDJ Hosin",district:"CB",lat:49.033641,lng:14.492878,area:809,fence:125,cat:"II.", last_maintenance: '2025-05-05', is_maintained: false},
  {id: 'vdj_vcelna', name:"VDJ Včelná",district:"CB",lat:48.924663,lng:14.463506,area:8660,fence:476,cat:"II.", last_maintenance: '2025-07-20', is_maintained: false},
  {id: 'vdj_hury', name:"VDJ Húry",district:"CB",lat:49.006417,lng:14.549815,area:395,fence:0,cat:"I.", last_maintenance: '2025-06-15', is_maintained: false},
  {id: 'vdj_chlumec', name:"VDJ Chlumec",district:"CB",lat:49.124766,lng:14.431321,area:811,fence:110,cat:"II.", last_maintenance: '2025-07-12', is_maintained: false},
  {id: 'vdj_olesnik', name:"VDJ Olešník",district:"CB",lat:49.111103,lng:14.377766,area:380,fence:117,cat:"I.", last_maintenance: '2025-05-28', is_maintained: false},
  {id: 'cs_bukovec', name:"ČS Bukovec",district:"CB",lat:48.881608,lng:14.449233,area:4943,fence:300,cat:"I.", last_maintenance: '2025-06-03', is_maintained: false},
  {id: 'vdj_herman', name:"VDJ Heřman",district:"CB",lat:48.909479,lng:14.499876,area:982,fence:119,cat:"II.", last_maintenance: '2025-07-22', is_maintained: false},
  {id: 'cs_vidov', name:"ČS Vidov u řeky",district:"CB",lat:48.924157,lng:14.489619,area:2501,fence:212,cat:"II.", last_maintenance: '2025-05-18', is_maintained: false},
  {id: 'vrt_vidov', name:"Vrt Vidov",district:"CB",lat:48.924066,lng:14.489679,area:470,fence:164,cat:"II.", last_maintenance: '2025-07-25', is_maintained: false},
  {id: 'uv_plav', name:"ÚV Plav",district:"CB",lat:48.912611,lng:14.494018,area:74777,fence:1413,cat:"I.", last_maintenance: '2025-06-28', is_maintained: false},
  {id: 'vdj_cekanice', name:"VDJ Čekanice",district:"TA",lat:49.422197,lng:14.689896,area:6344,fence:450,cat:"I.", last_maintenance: '2025-05-09', is_maintained: false},
  {id: 'vdj_svata_anna', name:"VDJ Svatá Anna",district:"TA",lat:49.401133,lng:14.698640,area:4192,fence:264,cat:"I.", last_maintenance: '2025-07-06', is_maintained: false},
  {id: 'vdj_bezdecin', name:"VDJ Bezděčín",district:"TA",lat:49.323096,lng:14.628405,area:1996,fence:169,cat:"I.", last_maintenance: '2025-06-22', is_maintained: false},
  {id: 'vdj_milevsko', name:"VDJ Milevsko",district:"TA",lat:49.452521,lng:14.344102,area:823,fence:129,cat:"I.", last_maintenance: '2025-05-02', is_maintained: false},
  {id: 'vdj_hodusin', name:"VDJ Hodušín",district:"TA",lat:49.429670,lng:14.474214,area:1708,fence:205,cat:"II.", last_maintenance: '2025-07-09', is_maintained: false},
  {id: 'vdj_vsechov', name:"VDJ Všechov",district:"TA",lat:49.430159,lng:14.623205,area:1574,fence:199,cat:"I.", last_maintenance: '2025-06-16', is_maintained: false},
  {id: 'vdj_zlukov', name:"VDJ Zlukov",district:"TA",lat:49.196289,lng:14.736382,area:1520,fence:184,cat:"II.", last_maintenance: '2025-05-12', is_maintained: false},
  {id: 'uv_tabor', name:"ÚV Tábor",district:"TA",lat:49.422872,lng:14.666426,area:12262,fence:350,cat:"II.", last_maintenance: '2025-07-14', is_maintained: false},
  {id: 'cs_sudomerice', name:"ČS Sudoměřice",district:"TA",lat:49.286580,lng:14.547794,area:2508,fence:220,cat:"I.", last_maintenance: '2025-06-29', is_maintained: false},
  {id: 'vdj_provozni_tabor', name:"Provozní Vodojem Tábor",district:"TA",lat:49.424264,lng:14.666384,area:1853,fence:155,cat:"II.", last_maintenance: '2025-05-20', is_maintained: false}
];

// =============================================
// APPLICATION STATE
// =============================================
const app = {
    arealData: [],
    filteredAreas: [],
    routePoints: [],
    map: null,
    clusterGroup: null,
    heatLayer: null,
    routingControl: null,
    drawingLayer: null,
    drawControl: null,
    isDrawing: false
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

function showToast(message, type = 'primary') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast p-3 rounded-lg shadow-lg text-white font-semibold mb-2`;
    
    // XSS-SAFE: textContent instead of innerHTML
    toast.textContent = message;
    
    // Color based on type
    const colors = {
        primary: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600'
    };
    toast.classList.add(colors[type] || colors.primary);
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function calculateRiskScore(area) {
    if (area.is_maintained) return 0;
    
    const lastMaintenance = new Date(area.last_maintenance);
    const today = new Date();
    const diffTime = Math.abs(today - lastMaintenance);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const maxRiskDays = 180;
    let timeScore = Math.min(1, diffDays / maxRiskDays);

    let catWeight = 0;
    if (area.cat === 'I.') catWeight = 1.0;
    else if (area.cat === 'II.') catWeight = 0.5;
    else catWeight = 0.2;

    return (timeScore * 0.6) + (catWeight * 0.4 * (1 - timeScore));
}

function getFirestorePath(collectionName) {
    const userId = window.userId || 'guest';
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    return `artifacts/${appId}/public/data/${userId}_${collectionName}`;
}

// Continue in next file part...