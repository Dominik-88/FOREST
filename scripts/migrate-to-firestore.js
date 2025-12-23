/**
 * Firestore Migration Script
 * Migrates complete areals dataset (41 areals) to Firestore
 * 
 * Usage:
 *   cd scripts
 *   npm install firebase
 *   node migrate-to-firestore.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjznwuPhwYVhM8eg8HV0TZmquzq8BZTCw",
  authDomain: "jvs-management.firebaseapp.com",
  projectId: "jvs-management",
  storageBucket: "jvs-management.firebasestorage.app",
  messagingSenderId: "838496450152",
  appId: "1:838496450152:web:0bb64f9d64e1ea0ee5addd",
  measurementId: "G-ZR4GGRHVBQ"
};

// Complete Areals Dataset (41 areals)
const AREALS_DATA = [
    // PÍSEK (2 areály)
    {
        id: "pi-amerika-ii",
        name: "VDJ Amerika II",
        district: "PI",
        district_name: "Písek",
        category: "I.",
        type: "VDJ",
        area_sqm: 3303,
        fence_length_m: 293,
        lat: 49.305131,
        lng: 14.166126,
        is_completed: true,
        last_maintenance: new Date('2024-06-15'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "pi-zaluzany",
        name: "VDJ Zálužany",
        district: "PI",
        district_name: "Písek",
        category: null,
        type: "VDJ",
        area_sqm: 2350,
        fence_length_m: 299,
        lat: 49.552857,
        lng: 14.083381,
        is_completed: true,
        last_maintenance: new Date('2024-05-20'),
        created_at: new Date(),
        updated_at: new Date()
    },

    // STRAKONICE (2 areály)
    {
        id: "st-drahonice",
        name: "VDJ Drahonice",
        district: "ST",
        district_name: "Strakonice",
        category: "I.",
        type: "VDJ",
        area_sqm: 5953,
        fence_length_m: 376,
        lat: 49.202902,
        lng: 14.063713,
        is_completed: true,
        last_maintenance: new Date('2024-07-10'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "st-vodnany",
        name: "VDJ Vodňany",
        district: "ST",
        district_name: "Strakonice",
        category: "I.",
        type: "VDJ",
        area_sqm: 1594,
        fence_length_m: 252,
        lat: 49.164550,
        lng: 14.177836,
        is_completed: false,
        last_maintenance: new Date('2024-03-12'),
        created_at: new Date(),
        updated_at: new Date()
    },

    // PRACHATICE (4 areály)
    {
        id: "pt-sibenicni-vrch-i",
        name: "VDJ Šibeniční vrch I",
        district: "PT",
        district_name: "Prachatice",
        category: "I.",
        type: "VDJ",
        area_sqm: 1835,
        fence_length_m: 245,
        lat: 49.025083,
        lng: 13.994111,
        is_completed: true,
        last_maintenance: new Date('2024-08-05'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "pt-husinecka-prehrada",
        name: "ÚV Husinecka přehrada",
        district: "PT",
        district_name: "Prachatice",
        category: null,
        type: "ÚV",
        area_sqm: 4908,
        fence_length_m: 703,
        lat: 49.034362,
        lng: 13.996830,
        is_completed: true,
        last_maintenance: new Date('2024-04-18'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "pt-sibenicni-vrch-ii",
        name: "VDJ Šibeniční vrch II",
        district: "PT",
        district_name: "Prachatice",
        category: "I.",
        type: "VDJ",
        area_sqm: 3206,
        fence_length_m: 340,
        lat: 49.026710,
        lng: 13.994001,
        is_completed: true,
        last_maintenance: new Date('2024-08-05'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "pt-ptacnik",
        name: "VDJ Ptáčník",
        district: "PT",
        district_name: "Prachatice",
        category: "II.",
        type: "VDJ",
        area_sqm: 1070,
        fence_length_m: 239,
        lat: 49.066147,
        lng: 14.186844,
        is_completed: false,
        last_maintenance: new Date('2024-02-28'),
        created_at: new Date(),
        updated_at: new Date()
    },

    // ČESKÝ KRUMLOV (4 areály)
    {
        id: "ck-domoradice",
        name: "VDJ Domoradice",
        district: "CK",
        district_name: "Český Krumlov",
        category: "I.",
        type: "VDJ",
        area_sqm: 4148,
        fence_length_m: 450,
        lat: 48.829651,
        lng: 14.326564,
        is_completed: true,
        last_maintenance: new Date('2024-06-22'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ck-horni-brana",
        name: "VDJ Horní Brána",
        district: "CK",
        district_name: "Český Krumlov",
        category: "I.",
        type: "VDJ",
        area_sqm: 1665,
        fence_length_m: 187,
        lat: 48.807970,
        lng: 14.329352,
        is_completed: true,
        last_maintenance: new Date('2024-05-30'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ck-netrebice",
        name: "VDJ Netřebice",
        district: "CK",
        district_name: "Český Krumlov",
        category: "I.",
        type: "VDJ",
        area_sqm: 877,
        fence_length_m: 136,
        lat: 48.783277,
        lng: 14.456447,
        is_completed: false,
        last_maintenance: new Date('2024-01-15'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ck-plesivec",
        name: "VDJ Plešivec",
        district: "CK",
        district_name: "Český Krumlov",
        category: "I.",
        type: "VDJ",
        area_sqm: 975,
        fence_length_m: 119,
        lat: 48.802231,
        lng: 14.304933,
        is_completed: true,
        last_maintenance: new Date('2024-07-18'),
        created_at: new Date(),
        updated_at: new Date()
    },

    // ČESKÉ BUDĚJOVICE (19 areálů)
    {
        id: "cb-hlavatce",
        name: "VDJ Hlavatce",
        district: "CB",
        district_name: "České Budějovice",
        category: null,
        type: "VDJ",
        area_sqm: 7968,
        fence_length_m: 424,
        lat: 49.063584,
        lng: 14.267751,
        is_completed: true,
        last_maintenance: new Date('2024-09-10'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-zdoba",
        name: "VDJ Zdoba",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 15523,
        fence_length_m: 225,
        lat: 49.212422,
        lng: 14.338095,
        is_completed: true,
        last_maintenance: new Date('2024-10-05'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-doudleby",
        name: "VDJ Doudleby",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 413,
        fence_length_m: 79,
        lat: 48.888896,
        lng: 14.480271,
        is_completed: false,
        last_maintenance: new Date('2023-12-20'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-jankov",
        name: "VDJ Jankov",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "VDJ",
        area_sqm: 784,
        fence_length_m: 106,
        lat: 48.968747,
        lng: 14.301697,
        is_completed: true,
        last_maintenance: new Date('2024-08-12'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-hosin-ii",
        name: "VDJ Hosín II",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "VDJ",
        area_sqm: 4173,
        fence_length_m: 399,
        lat: 49.030641,
        lng: 14.501012,
        is_completed: true,
        last_maintenance: new Date('2024-07-25'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-chlum",
        name: "VDJ Chlum",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 535,
        fence_length_m: 63,
        lat: 49.096493,
        lng: 14.388679,
        is_completed: false,
        last_maintenance: new Date('2024-03-08'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-chotycany",
        name: "VDJ Chotýčany",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 4775,
        fence_length_m: 338,
        lat: 49.070748,
        lng: 14.519460,
        is_completed: true,
        last_maintenance: new Date('2024-09-15'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-rudolfov-iii",
        name: "VDJ Rudolfov III",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "VDJ",
        area_sqm: 1868,
        fence_length_m: 174,
        lat: 48.986207,
        lng: 14.547076,
        is_completed: true,
        last_maintenance: new Date('2024-06-30'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-rimov-vesce",
        name: "VDJ Rimov - Vesce",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "VDJ",
        area_sqm: 662,
        fence_length_m: 99,
        lat: 48.847847,
        lng: 14.466957,
        is_completed: false,
        last_maintenance: new Date('2024-02-14'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-hosin",
        name: "VDJ Hosin",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 809,
        fence_length_m: 125,
        lat: 49.033641,
        lng: 14.492878,
        is_completed: true,
        last_maintenance: new Date('2024-07-20'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-vcelna",
        name: "VDJ Včelná",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 8660,
        fence_length_m: 476,
        lat: 48.924663,
        lng: 14.463506,
        is_completed: true,
        last_maintenance: new Date('2024-10-12'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-hury",
        name: "VDJ Húry",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "VDJ",
        area_sqm: 395,
        fence_length_m: 0,
        lat: 49.006417,
        lng: 14.549815,
        is_completed: false,
        last_maintenance: null,
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-chlumec",
        name: "VDJ Chlumec",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 811,
        fence_length_m: 110,
        lat: 49.124766,
        lng: 14.431321,
        is_completed: true,
        last_maintenance: new Date('2024-08-28'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-olesnik",
        name: "VDJ Olešník",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "VDJ",
        area_sqm: 380,
        fence_length_m: 117,
        lat: 49.111103,
        lng: 14.377766,
        is_completed: false,
        last_maintenance: new Date('2024-01-22'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-cs-bukovec",
        name: "ČS Bukovec",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "ČS",
        area_sqm: 4943,
        fence_length_m: 300,
        lat: 48.881608,
        lng: 14.449233,
        is_completed: true,
        last_maintenance: new Date('2024-09-20'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-herman",
        name: "VDJ Heřman",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "VDJ",
        area_sqm: 982,
        fence_length_m: 119,
        lat: 48.909479,
        lng: 14.499876,
        is_completed: true,
        last_maintenance: new Date('2024-07-08'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-cs-vidov",
        name: "ČS Vidov u řeky",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "ČS",
        area_sqm: 2501,
        fence_length_m: 212,
        lat: 48.924157,
        lng: 14.489619,
        is_completed: true,
        last_maintenance: new Date('2024-06-18'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-vrt-vidov",
        name: "Vrt Vidov",
        district: "CB",
        district_name: "České Budějovice",
        category: "II.",
        type: "Vrt",
        area_sqm: 470,
        fence_length_m: 164,
        lat: 48.924066,
        lng: 14.489679,
        is_completed: true,
        last_maintenance: new Date('2024-06-18'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "cb-uv-plav",
        name: "ÚV Plav",
        district: "CB",
        district_name: "České Budějovice",
        category: "I.",
        type: "ÚV",
        area_sqm: 74777,
        fence_length_m: 1413,
        lat: 48.912611,
        lng: 14.494018,
        is_completed: true,
        last_maintenance: new Date('2024-11-01'),
        created_at: new Date(),
        updated_at: new Date()
    },

    // TÁBOR (10 areálů)
    {
        id: "ta-cekanice",
        name: "VDJ Čekanice",
        district: "TA",
        district_name: "Tábor",
        category: "I.",
        type: "VDJ",
        area_sqm: 6344,
        fence_length_m: 450,
        lat: 49.422197,
        lng: 14.689896,
        is_completed: true,
        last_maintenance: new Date('2024-10-15'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-svata-anna",
        name: "VDJ Svatá Anna",
        district: "TA",
        district_name: "Tábor",
        category: "I.",
        type: "VDJ",
        area_sqm: 4192,
        fence_length_m: 264,
        lat: 49.401133,
        lng: 14.698640,
        is_completed: true,
        last_maintenance: new Date('2024-09-25'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-bezdecin",
        name: "VDJ Bezděčín",
        district: "TA",
        district_name: "Tábor",
        category: "I.",
        type: "VDJ",
        area_sqm: 1996,
        fence_length_m: 169,
        lat: 49.323096,
        lng: 14.628405,
        is_completed: false,
        last_maintenance: new Date('2024-04-10'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-milevsko",
        name: "VDJ Milevsko",
        district: "TA",
        district_name: "Tábor",
        category: "I.",
        type: "VDJ",
        area_sqm: 823,
        fence_length_m: 129,
        lat: 49.452521,
        lng: 14.344102,
        is_completed: true,
        last_maintenance: new Date('2024-08-20'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-hodusin",
        name: "VDJ Hodušín",
        district: "TA",
        district_name: "Tábor",
        category: "II.",
        type: "VDJ",
        area_sqm: 1708,
        fence_length_m: 205,
        lat: 49.429670,
        lng: 14.474214,
        is_completed: false,
        last_maintenance: new Date('2024-03-15'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-vsechov",
        name: "VDJ Všechov",
        district: "TA",
        district_name: "Tábor",
        category: "I.",
        type: "VDJ",
        area_sqm: 1574,
        fence_length_m: 199,
        lat: 49.430159,
        lng: 14.623205,
        is_completed: true,
        last_maintenance: new Date('2024-07-30'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-zlukov",
        name: "VDJ Zlukov",
        district: "TA",
        district_name: "Tábor",
        category: "II.",
        type: "VDJ",
        area_sqm: 1520,
        fence_length_m: 184,
        lat: 49.196289,
        lng: 14.736382,
        is_completed: false,
        last_maintenance: new Date('2024-02-05'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-uv-tabor",
        name: "ÚV Tábor",
        district: "TA",
        district_name: "Tábor",
        category: "II.",
        type: "ÚV",
        area_sqm: 12262,
        fence_length_m: 350,
        lat: 49.422872,
        lng: 14.666426,
        is_completed: true,
        last_maintenance: new Date('2024-10-20'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-cs-sudomerice",
        name: "ČS Sudoměřice",
        district: "TA",
        district_name: "Tábor",
        category: "I.",
        type: "ČS",
        area_sqm: 2508,
        fence_length_m: 220,
        lat: 49.286580,
        lng: 14.547794,
        is_completed: true,
        last_maintenance: new Date('2024-09-05'),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "ta-provozni-vodojem",
        name: "Provozní Vodojem Tábor",
        district: "TA",
        district_name: "Tábor",
        category: "II.",
        type: "Provozní Vodojem",
        area_sqm: 1853,
        fence_length_m: 155,
        lat: 49.424264,
        lng: 14.666384,
        is_completed: true,
        last_maintenance: new Date('2024-10-18'),
        created_at: new Date(),
        updated_at: new Date()
    }
];

/**
 * Main Migration Function
 */
async function migrateData() {
    console.log('🚀 Starting Firestore migration...\n');
    
    try {
        // Initialize Firebase
        console.log('📡 Initializing Firebase...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        console.log('✅ Firebase initialized\n');
        
        // Check existing data
        console.log('🔍 Checking existing data...');
        const existingSnapshot = await getDocs(collection(db, 'areals'));
        console.log(`📊 Found ${existingSnapshot.size} existing documents\n`);
        
        if (existingSnapshot.size > 0) {
            console.log('⚠️  WARNING: Collection already contains data!');
            console.log('   This will overwrite existing documents with matching IDs.\n');
        }
        
        // Migrate areals
        console.log(`📤 Migrating ${AREALS_DATA.length} areals...\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const areal of AREALS_DATA) {
            try {
                await setDoc(doc(db, 'areals', areal.id), areal);
                successCount++;
                console.log(`✅ [${successCount}/${AREALS_DATA.length}] ${areal.name} (${areal.id})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to migrate ${areal.name}:`, error.message);
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${errorCount}`);
        console.log(`📍 Total: ${AREALS_DATA.length}`);
        console.log('='.repeat(60));
        
        // Statistics
        const stats = {
            total: AREALS_DATA.length,
            by_category: {
                "I.": AREALS_DATA.filter(a => a.category === "I.").length,
                "II.": AREALS_DATA.filter(a => a.category === "II.").length,
                "null": AREALS_DATA.filter(a => a.category === null).length
            },
            by_district: {
                "CB": AREALS_DATA.filter(a => a.district === "CB").length,
                "TA": AREALS_DATA.filter(a => a.district === "TA").length,
                "CK": AREALS_DATA.filter(a => a.district === "CK").length,
                "PT": AREALS_DATA.filter(a => a.district === "PT").length,
                "PI": AREALS_DATA.filter(a => a.district === "PI").length,
                "ST": AREALS_DATA.filter(a => a.district === "ST").length
            },
            total_area: AREALS_DATA.reduce((sum, a) => sum + a.area_sqm, 0),
            total_fence: AREALS_DATA.reduce((sum, a) => sum + a.fence_length_m, 0)
        };
        
        console.log('\n📈 DATASET STATISTICS');
        console.log('='.repeat(60));
        console.log(`Total Areals: ${stats.total}`);
        console.log(`Total Area: ${stats.total_area.toLocaleString()} m²`);
        console.log(`Total Fence: ${stats.total_fence.toLocaleString()} m`);
        console.log('\nBy Category:');
        console.log(`  I.:  ${stats.by_category["I."]} areals`);
        console.log(`  II.: ${stats.by_category["II."]} areals`);
        console.log(`  None: ${stats.by_category["null"]} areals`);
        console.log('\nBy District:');
        console.log(`  České Budějovice: ${stats.by_district.CB}`);
        console.log(`  Tábor: ${stats.by_district.TA}`);
        console.log(`  Český Krumlov: ${stats.by_district.CK}`);
        console.log(`  Prachatice: ${stats.by_district.PT}`);
        console.log(`  Písek: ${stats.by_district.PI}`);
        console.log(`  Strakonice: ${stats.by_district.ST}`);
        console.log('='.repeat(60));
        
        console.log('\n✨ Migration completed successfully!');
        console.log('🌐 View your data: https://console.firebase.google.com/project/jvs-management/firestore\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateData();
