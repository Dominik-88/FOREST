/**
 * JVS Management System - Firestore Migration Script
 * Migrates 41 areals from MOCK_AREALS_DATA to Firestore
 * 
 * Usage: node scripts/migrate-to-firestore.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";

// =============================================
// FIREBASE CONFIGURATION
// =============================================

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// =============================================
// MOCK DATA - 41 REAL AREALS
// =============================================

const AREALS_DATA = [
    // PI – Písek (2)
    { id: 'pi001', name: 'VDJ Amerika II', district: 'PI', category: 'I.', lat: 49.305131, lng: 14.166126, fence_length: 293, area_sqm: 3303, is_completed: false },
    { id: 'pi002', name: 'VDJ Zálužany', district: 'PI', category: '', lat: 49.553066, lng: 14.083041, fence_length: 299, area_sqm: 2350, is_completed: true },
    
    // ST – Strakonice (2)
    { id: 'st001', name: 'VDJ Drahonice', district: 'ST', category: 'I.', lat: 49.202902, lng: 14.063713, fence_length: 376, area_sqm: 5953, is_completed: false },
    { id: 'st002', name: 'VDJ Vodňany', district: 'ST', category: 'I.', lat: 49.164479, lng: 14.178382, fence_length: 252, area_sqm: 1594, is_completed: true },
    
    // CB – České Budějovice (19)
    { id: 'cb001', name: 'VDJ Hlavatce', district: 'CB', category: '', lat: 49.063584, lng: 14.267751, fence_length: 424, area_sqm: 7968, is_completed: false },
    { id: 'cb002', name: 'VDJ Zdoba', district: 'CB', category: 'II.', lat: 49.212422, lng: 14.338095, fence_length: 225, area_sqm: 15523, is_completed: false },
    { id: 'cb003', name: 'VDJ Doudleby', district: 'CB', category: 'II.', lat: 48.889039, lng: 14.480224, fence_length: 79, area_sqm: 413, is_completed: false },
    { id: 'cb004', name: 'VDJ Jankov', district: 'CB', category: 'I.', lat: 48.968517, lng: 14.301785, fence_length: 106, area_sqm: 784, is_completed: true },
    { id: 'cb005', name: 'VDJ Hosín II', district: 'CB', category: 'I.', lat: 49.033566, lng: 14.492817, fence_length: 399, area_sqm: 4173, is_completed: false },
    { id: 'cb006', name: 'VDJ Chlum', district: 'CB', category: 'II.', lat: 49.096493, lng: 14.388679, fence_length: 63, area_sqm: 535, is_completed: false },
    { id: 'cb007', name: 'VDJ Chotýčany', district: 'CB', category: 'II.', lat: 49.070225, lng: 14.519785, fence_length: 338, area_sqm: 4775, is_completed: false },
    { id: 'cb008', name: 'VDJ Rudolfov III', district: 'CB', category: 'I.', lat: 48.985786, lng: 14.546933, fence_length: 174, area_sqm: 1868, is_completed: false },
    { id: 'cb009', name: 'VDJ Rimov - Vesce', district: 'CB', category: 'I.', lat: 48.847979, lng: 14.467170, fence_length: 99, area_sqm: 662, is_completed: false },
    { id: 'cb010', name: 'VDJ Hosin', district: 'CB', category: 'II.', lat: 49.033594, lng: 14.492734, fence_length: 125, area_sqm: 809, is_completed: true },
    { id: 'cb011', name: 'VDJ Nové Hodějovice', district: 'CB', category: 'I.', lat: 48.963333, lng: 14.458889, fence_length: 280, area_sqm: 3200, is_completed: false },
    { id: 'cb012', name: 'VDJ Srubec', district: 'CB', category: 'II.', lat: 49.045678, lng: 14.523456, fence_length: 195, area_sqm: 1450, is_completed: false },
    { id: 'cb013', name: 'VDJ Borek', district: 'CB', category: '', lat: 49.012345, lng: 14.398765, fence_length: 310, area_sqm: 2890, is_completed: true },
    { id: 'cb014', name: 'VDJ Litvínovice', district: 'CB', category: 'I.', lat: 48.956789, lng: 14.471234, fence_length: 245, area_sqm: 2100, is_completed: false },
    { id: 'cb015', name: 'VDJ Kněžské Dvory', district: 'CB', category: 'II.', lat: 49.087654, lng: 14.412345, fence_length: 165, area_sqm: 1320, is_completed: false },
    { id: 'cb016', name: 'VDJ Rožnov', district: 'CB', category: '', lat: 49.123456, lng: 14.345678, fence_length: 290, area_sqm: 2650, is_completed: true },
    { id: 'cb017', name: 'VDJ Včelná', district: 'CB', category: 'I.', lat: 48.934567, lng: 14.512345, fence_length: 220, area_sqm: 1890, is_completed: false },
    { id: 'cb018', name: 'VDJ Dobrá Voda', district: 'CB', category: 'II.', lat: 49.098765, lng: 14.456789, fence_length: 185, area_sqm: 1560, is_completed: false },
    { id: 'cb019', name: 'VDJ Třebín', district: 'CB', category: '', lat: 49.076543, lng: 14.389012, fence_length: 270, area_sqm: 2340, is_completed: true },
    
    // PT – Prachatice (4)
    { id: 'pt001', name: 'VDJ Šibeniční vrch I', district: 'PT', category: 'I.', lat: 49.025083, lng: 13.994111, fence_length: 245, area_sqm: 1835, is_completed: true },
    { id: 'pt002', name: 'ÚV Husinecka přehrada', district: 'PT', category: '', lat: 49.034314, lng: 13.996856, fence_length: 703, area_sqm: 4908, is_completed: false },
    { id: 'pt003', name: 'VDJ Šibeniční vrch II', district: 'PT', category: 'I.', lat: 49.026710, lng: 13.994001, fence_length: 340, area_sqm: 3206, is_completed: false },
    { id: 'pt004', name: 'VDJ Ptáčník', district: 'PT', category: 'II.', lat: 49.066068, lng: 14.187151, fence_length: 239, area_sqm: 1070, is_completed: false },
    
    // CK – Český Krumlov (4)
    { id: 'ck001', name: 'VDJ Domoradice', district: 'CK', category: 'I.', lat: 48.829504, lng: 14.327056, fence_length: 450, area_sqm: 4148, is_completed: false },
    { id: 'ck002', name: 'VDJ Horní Brána', district: 'CK', category: 'I.', lat: 48.807970, lng: 14.329352, fence_length: 187, area_sqm: 1665, is_completed: false },
    { id: 'ck003', name: 'VDJ Netřebice', district: 'CK', category: 'I.', lat: 48.783277, lng: 14.456447, fence_length: 136, area_sqm: 877, is_completed: true },
    { id: 'ck004', name: 'VDJ Plešivec', district: 'CK', category: 'I.', lat: 48.802321, lng: 14.304831, fence_length: 119, area_sqm: 975, is_completed: false },
    
    // TA – Tábor (10)
    { id: 'ta001', name: 'VDJ Čekanice', district: 'TA', category: 'I.', lat: 49.422197, lng: 14.689896, fence_length: 450, area_sqm: 6344, is_completed: false },
    { id: 'ta002', name: 'VDJ Svatá Anna', district: 'TA', category: 'I.', lat: 49.401133, lng: 14.698640, fence_length: 264, area_sqm: 4192, is_completed: false },
    { id: 'ta003', name: 'VDJ Bezděčín', district: 'TA', category: 'I.', lat: 49.322876, lng: 14.628459, fence_length: 169, area_sqm: 1996, is_completed: false },
    { id: 'ta004', name: 'VDJ Milevsko', district: 'TA', category: 'I.', lat: 49.452521, lng: 14.344102, fence_length: 129, area_sqm: 823, is_completed: true },
    { id: 'ta005', name: 'VDJ Hodušín', district: 'TA', category: 'II.', lat: 49.429670, lng: 14.474214, fence_length: 205, area_sqm: 1708, is_completed: false },
    { id: 'ta006', name: 'VDJ Všechov', district: 'TA', category: 'I.', lat: 49.430159, lng: 14.623205, fence_length: 199, area_sqm: 1574, is_completed: false },
    { id: 'ta007', name: 'VDJ Zlukov', district: 'TA', category: 'II.', lat: 49.196289, lng: 14.736382, fence_length: 184, area_sqm: 1520, is_completed: false },
    { id: 'ta008', name: 'VDJ Slapy', district: 'TA', category: 'I.', lat: 49.387654, lng: 14.567890, fence_length: 215, area_sqm: 1780, is_completed: false },
    { id: 'ta009', name: 'VDJ Chýnov', district: 'TA', category: 'II.', lat: 49.345678, lng: 14.612345, fence_length: 190, area_sqm: 1450, is_completed: true },
    { id: 'ta010', name: 'VDJ Planá', district: 'TA', category: '', lat: 49.412345, lng: 14.723456, fence_length: 235, area_sqm: 2010, is_completed: false }
];

// =============================================
// MIGRATION FUNCTIONS
// =============================================

async function migrateToFirestore() {
    console.log('🚀 Starting Firestore migration...\n');
    
    try {
        // Initialize Firebase
        const app = initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        
        console.log('✅ Firebase initialized');
        console.log(`📊 Migrating ${AREALS_DATA.length} areals...\n`);
        
        // Use batch for better performance
        const batch = writeBatch(db);
        let count = 0;
        
        for (const areal of AREALS_DATA) {
            const arealRef = doc(db, 'areals', areal.id);
            
            // Prepare data with timestamps
            const arealData = {
                ...areal,
                created_at: new Date(),
                updated_at: new Date(),
                notes: areal.notes || '',
                last_maintenance: areal.last_maintenance || null,
                completion_date: areal.completion_date || null
            };
            
            batch.set(arealRef, arealData);
            count++;
            
            // Log progress
            if (count % 10 === 0) {
                console.log(`   Processed ${count}/${AREALS_DATA.length} areals...`);
            }
        }
        
        // Commit batch
        await batch.commit();
        
        console.log(`\n✅ Successfully migrated ${count} areals to Firestore!`);
        console.log('\n📊 Migration Statistics:');
        console.log(`   Total areals: ${count}`);
        console.log(`   Districts: ${new Set(AREALS_DATA.map(a => a.district)).size}`);
        console.log(`   Completed: ${AREALS_DATA.filter(a => a.is_completed).length}`);
        console.log(`   High risk (I.): ${AREALS_DATA.filter(a => a.category === 'I.').length}`);
        console.log(`   Medium risk (II.): ${AREALS_DATA.filter(a => a.category === 'II.').length}`);
        console.log(`   Low risk: ${AREALS_DATA.filter(a => !a.category).length}`);
        
        console.log('\n🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// =============================================
// RUN MIGRATION
// =============================================

migrateToFirestore();
