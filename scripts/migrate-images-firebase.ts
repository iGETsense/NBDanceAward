
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { allCandidatesData } from '../lib/candidatesData';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: "AIzaSyDW7wbUtGivk_uosXs_gZ_fKAAozVXEk7c",
    authDomain: "project-5583295336911612869.firebaseapp.com",
    databaseURL: "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "project-5583295336911612869",
    storageBucket: "project-5583295336911612869.firebasestorage.app",
    messagingSenderId: "816715936754",
    appId: "1:816715936754:web:28d23b835fad9e6b33b16b",
    measurementId: "G-95FMJ6SP7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

async function migrateImages() {
    console.log('🚀 Starting image migration to Firebase Storage...');

    let successCount = 0;
    let failCount = 0;

    for (const candidate of allCandidatesData) {
        try {
            // 1. Prepare local file
            const localImagePath = path.join(process.cwd(), 'public', candidate.image);
            if (!fs.existsSync(localImagePath)) {
                console.warn(`⚠️ Image not found locally: ${localImagePath}`);
                failCount++;
                continue;
            }

            const fileBuffer = fs.readFileSync(localImagePath);
            const fileName = path.basename(localImagePath);
            const storagePath = `candidates/${fileName}`;

            // 2. Upload to Firebase Storage
            const fileRef = storageRef(storage, storagePath);
            const metadata = {
                contentType: 'image/webp', // Assuming webp based on file extension, or detect
            };

            // Convert buffer to Uint8Array for Firebase SDK
            const uint8Array = new Uint8Array(fileBuffer);

            console.log(`Uploading ${fileName}...`);
            await uploadBytes(fileRef, uint8Array, metadata);

            // 3. Get Download URL
            const downloadURL = await getDownloadURL(fileRef);
            console.log(`✅ Uploaded: ${downloadURL}`);

            // 4. Update Realtime Database
            // We need to find the candidate in the DB. 
            // Assuming the ID generation logic matches what's in the DB or we search by name.
            // Let's try to find by name first to be safe, or construct ID.

            // Construct ID as done in previous scripts/code
            // Note: In route.ts it was: name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') + `-${index}`
            // But here we might not have the index easily matching the DB if the DB changed.
            // Safer to search DB for matching name.

            // Fetch all candidates to find match
            // Optimization: Fetch once
            // But for script simplicity, let's fetch all once at start? No, let's just construct ID and try.
            // Actually, the most reliable way is to query by name if possible, or just iterate all DB candidates.

            // Let's fetch all candidates from DB first
            const dbRef = ref(database, 'candidates');
            const snapshot = await get(dbRef);

            if (snapshot.exists()) {
                const dbCandidates = snapshot.val();
                let matchFound = false;

                for (const [key, dbCandidate] of Object.entries(dbCandidates) as [string, any][]) {
                    if (dbCandidate.name === candidate.name) {
                        // Update this candidate
                        const candidateRef = ref(database, `candidates/${key}`);
                        await update(candidateRef, {
                            image: downloadURL
                        });
                        console.log(`✨ Updated DB for ${candidate.name}`);
                        matchFound = true;
                        break;
                    }
                }

                if (!matchFound) {
                    console.warn(`⚠️ Candidate not found in DB: ${candidate.name}`);
                    // Optional: Create it? No, just warn.
                }
            } else {
                console.error('❌ No candidates found in Database. Is it empty?');
                return;
            }

            successCount++;

        } catch (error: any) {
            console.error(`❌ Error processing ${candidate.name}:`, error.message);
            failCount++;
        }
    }

    console.log(`\nMigration finished!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    process.exit(0);
}

migrateImages();
