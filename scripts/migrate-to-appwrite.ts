import { Client, Databases, Storage, ID, Permission, Role, InputFile, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import { allCandidatesData } from '../lib/candidatesData';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
    console.error('Error: NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY are required.');
    console.error('Please add them to .env.local');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_ID = 'nb-dance-award-db';
const COLLECTION_ID = 'candidates';
const BUCKET_ID = 'candidates-images';

async function migrate() {
    try {
        console.log('🚀 Starting migration to Appwrite...');

        // 1. Create Database if not exists
        try {
            await databases.get(DB_ID);
            console.log('✅ Database exists');
        } catch (error: any) {
            if (error.code === 404) {
                console.log('Creating database...');
                await databases.create(DB_ID, 'NBDanceAward');
                console.log('✅ Database created');
            } else {
                throw error;
            }
        }

        // 2. Create Collection if not exists
        try {
            await databases.getCollection(DB_ID, COLLECTION_ID);
            console.log('✅ Collection exists');
        } catch (error: any) {
            if (error.code === 404) {
                console.log('Creating collection...');
                await databases.createCollection(DB_ID, COLLECTION_ID, 'Candidates', [
                    Permission.read(Role.any()), // Public read
                    Permission.write(Role.any()), // Public write (for votes - ideally should be restricted)
                    // Better: Permission.update(Role.any()) ? No, votes should probably be updated via server function
                ]);
                console.log('✅ Collection created');
            } else {
                throw error;
            }
        }

        // 3. Create Storage Bucket if not exists
        try {
            await storage.getBucket(BUCKET_ID);
            console.log('✅ Storage bucket exists');
        } catch (error: any) {
            if (error.code === 404) {
                console.log('Creating storage bucket...');
                await storage.createBucket(BUCKET_ID, 'Candidates Images', [
                    Permission.read(Role.any()), // Public read
                ], false, true, undefined, ['jpg', 'jpeg', 'png', 'webp', 'gif']);
                console.log('✅ Storage bucket created');
            } else {
                throw error;
            }
        }

        // 4. Create Attributes
        const attributes = [
            { key: 'name', type: 'string', size: 128, required: true },
            { key: 'title', type: 'string', size: 128, required: true },
            { key: 'imageId', type: 'string', size: 256, required: true }, // Changed from image to imageId
            { key: 'category', type: 'string', size: 128, required: true },
            { key: 'votes', type: 'integer', required: false, default: 0 },
            { key: 'percentage', type: 'integer', required: false, default: 0 },
            { key: 'badge', type: 'integer', required: false, default: null },
        ];

        console.log('Checking attributes...');
        // We just try to create them, if they exist it throws 409 which we ignore
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DB_ID, COLLECTION_ID, attr.key, attr.size, attr.required);
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(DB_ID, COLLECTION_ID, attr.key, attr.required, 0, 1000000, attr.default);
                }
                console.log(`✅ Attribute ${attr.key} created`);
                // Wait a bit because attribute creation is async
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`✅ Attribute ${attr.key} already exists`);
                } else {
                    console.error(`Error creating attribute ${attr.key}:`, error.message);
                }
            }
        }

        // Wait for attributes to be available
        console.log('Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 5. Import Candidates & Upload Images
        console.log(`Importing ${allCandidatesData.length} candidates...`);

        for (const candidate of allCandidatesData) {
            const docId = candidate.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 36);

            try {
                // Check if document exists
                await databases.getDocument(DB_ID, COLLECTION_ID, docId);
                console.log(`Skipping ${candidate.name} (already exists)`);
                continue;
            } catch (error: any) {
                if (error.code !== 404) throw error;
            }

            // Upload Image
            let imageId = 'default';
            try {
                const localImagePath = path.join(process.cwd(), 'public', candidate.image);
                if (fs.existsSync(localImagePath)) {
                    const fileId = ID.unique();
                    const fileStream = fs.createReadStream(localImagePath);
                    const filename = path.basename(localImagePath);

                    // Use InputFile.fromStream or similar if needed, but createFile supports stream
                    // Note: node-appwrite v11+ might use InputFile.fromPath or similar
                    // Let's try standard approach
                    const file = await InputFile.fromPath(localImagePath, filename);

                    const uploaded = await storage.createFile(BUCKET_ID, fileId, file);
                    imageId = uploaded.$id;
                    console.log(`   📸 Uploaded image for ${candidate.name}`);
                } else {
                    console.warn(`   ⚠️ Image not found: ${localImagePath}`);
                }
            } catch (uploadError: any) {
                console.error(`   ❌ Failed to upload image for ${candidate.name}:`, uploadError.message);
            }

            // Create Document
            try {
                await databases.createDocument(DB_ID, COLLECTION_ID, docId, {
                    name: candidate.name,
                    title: candidate.title,
                    imageId: imageId, // Store the file ID
                    category: candidate.category,
                    votes: candidate.votes || 0,
                    percentage: candidate.percentage || 0,
                    badge: candidate.badge || null,
                });
                console.log(`✅ Imported ${candidate.name}`);
            } catch (createError: any) {
                console.error(`Error importing ${candidate.name}:`, createError.message);
            }
        }

        console.log('🎉 Migration complete!');

    } catch (error: any) {
        console.error('Migration failed:', error);
    }
}

migrate();
