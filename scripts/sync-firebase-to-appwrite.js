#!/usr/bin/env node

/**
 * Sync Firebase data to Appwrite
 * This script reads firebase_db.json and pushes all data to Appwrite
 */

const { Client, Databases, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!PROJECT_ID || !ENDPOINT || !DB_ID) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_APPWRITE_PROJECT_ID');
    console.error('   - NEXT_PUBLIC_APPWRITE_ENDPOINT');
    console.error('   - NEXT_PUBLIC_APPWRITE_DB_ID');
    console.error('\nAdd them to .env.local');
    process.exit(1);
}

if (!API_KEY) {
    console.error('❌ APPWRITE_API_KEY is required for server-side operations');
    console.error('   Get it from: https://fra.cloud.appwrite.io/console → Settings → API Keys');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

// Collection IDs from environment
const COLLECTIONS = {
    candidates: process.env.NEXT_PUBLIC_APPWRITE_CANDIDATES_COLLECTION || 'candidates',
    categories: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION || 'categories',
    candidateCategories: process.env.NEXT_PUBLIC_APPWRITE_CANDIDATE_CATEGORIES_COLLECTION || 'candidateCategories',
};

async function createCollectionsIfNeeded() {
    console.log('📋 Checking collections...\n');

    for (const [key, collectionId] of Object.entries(COLLECTIONS)) {
        try {
            await databases.getCollection(DB_ID, collectionId);
            console.log(`✅ Collection "${collectionId}" exists`);
        } catch (error) {
            if (error.code === 404) {
                console.log(`📝 Creating collection "${collectionId}"...`);
                try {
                    await databases.createCollection(DB_ID, collectionId, collectionId);
                    console.log(`✅ Collection "${collectionId}" created`);
                    
                    // Wait for collection to be ready
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (createError) {
                    console.error(`❌ Failed to create collection "${collectionId}":`, createError.message);
                }
            } else {
                console.error(`❌ Error checking collection "${collectionId}":`, error.message);
            }
        }
    }
    console.log('');
}

async function syncCategories(categoriesData) {
    console.log('📂 Syncing categories...\n');
    let count = 0;

    for (const [id, category] of Object.entries(categoriesData)) {
        try {
            // Check if exists
            try {
                await databases.getDocument(DB_ID, COLLECTIONS.categories, id);
                console.log(`⏭️  Skipping category "${category.name}" (already exists)`);
                continue;
            } catch (e) {
                if (e.code !== 404) throw e;
            }

            // Create document
            await databases.createDocument(
                DB_ID,
                COLLECTIONS.categories,
                id,
                {
                    id,
                    name: category.name,
                    order: category.order || 0,
                    createdAt: new Date().toISOString(),
                }
            );
            console.log(`✅ Created category: "${category.name}"`);
            count++;
        } catch (error) {
            console.error(`❌ Error syncing category "${category.name}":`, error.message);
        }
    }
    console.log(`\n✨ Synced ${count} categories\n`);
}

async function syncCandidates(candidatesData) {
    console.log('🎭 Syncing candidates...\n');
    let count = 0;

    for (const [id, candidate] of Object.entries(candidatesData)) {
        try {
            // Check if exists
            try {
                await databases.getDocument(DB_ID, COLLECTIONS.candidates, id);
                console.log(`⏭️  Skipping candidate "${candidate.name}" (already exists)`);
                continue;
            } catch (e) {
                if (e.code !== 404) throw e;
            }

            // Create document
            await databases.createDocument(
                DB_ID,
                COLLECTIONS.candidates,
                id,
                {
                    id,
                    name: candidate.name,
                    title: candidate.title || candidate.name,
                    image: candidate.image || '/dancers/placeholder.svg',
                    votes: candidate.votes || 0,
                    percentage: candidate.percentage || 0,
                    badge: candidate.badge || null,
                    category: candidate.category || '',
                    categoryId: candidate.categoryId || '',
                    baseId: candidate.baseId || '',
                    createdAt: new Date().toISOString(),
                }
            );
            console.log(`✅ Created candidate: "${candidate.name}"`);
            count++;
        } catch (error) {
            console.error(`❌ Error syncing candidate "${candidate.name}":`, error.message);
        }
    }
    console.log(`\n✨ Synced ${count} candidates\n`);
}

async function syncCandidateCategories(candidatesData) {
    console.log('🔗 Syncing candidate-category links...\n');
    let count = 0;

    for (const [id, candidate] of Object.entries(candidatesData)) {
        if (!candidate.categoryId) continue;

        try {
            const linkId = `${id}_${candidate.categoryId}`;

            // Check if exists
            try {
                await databases.getDocument(DB_ID, COLLECTIONS.candidateCategories, linkId);
                console.log(`⏭️  Skipping link for "${candidate.name}" (already exists)`);
                continue;
            } catch (e) {
                if (e.code !== 404) throw e;
            }

            // Create link
            await databases.createDocument(
                DB_ID,
                COLLECTIONS.candidateCategories,
                linkId,
                {
                    candidateId: id,
                    categoryId: candidate.categoryId,
                    createdAt: new Date().toISOString(),
                }
            );
            console.log(`✅ Linked "${candidate.name}" to category`);
            count++;
        } catch (error) {
            console.error(`❌ Error linking candidate "${candidate.name}":`, error.message);
        }
    }
    console.log(`\n✨ Synced ${count} candidate-category links\n`);
}

async function main() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║         Firebase → Appwrite Data Sync                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // Read Firebase data
        const firebaseDataPath = path.join(process.cwd(), 'firebase_db.json');
        if (!fs.existsSync(firebaseDataPath)) {
            console.error(`❌ firebase_db.json not found at ${firebaseDataPath}`);
            process.exit(1);
        }

        const firebaseData = JSON.parse(fs.readFileSync(firebaseDataPath, 'utf8'));
        console.log(`📂 Loaded Firebase data from firebase_db.json\n`);

        // Create collections if needed
        await createCollectionsIfNeeded();

        // Sync data
        if (firebaseData.categories) {
            await syncCategories(firebaseData.categories);
        }

        if (firebaseData.candidates) {
            await syncCandidates(firebaseData.candidates);
        }

        if (firebaseData.candidates) {
            await syncCandidateCategories(firebaseData.candidates);
        }

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║                    ✅ SYNC COMPLETE                            ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        console.log('Your Appwrite database now has the same data as Firebase!');
        console.log('Next: Create votes and users collections if needed.\n');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

main();
