#!/usr/bin/env node

/**
 * Script to reset Firebase candidates data
 * Run this after updating EXAMPLE_CANDIDATES.json
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app'
  });
} catch (error) {
  console.error('❌ Error: firebase-service-account.json not found');
  console.error('Please create this file with your Firebase Admin SDK credentials');
  process.exit(1);
}

const db = admin.database();

async function resetCandidates() {
  try {
    console.log('🔄 Resetting candidates data...');
    
    // Delete existing candidates
    await db.ref('candidates').remove();
    console.log('✅ Old candidates deleted');
    
    // Load new candidates from JSON
    const candidatesData = require('../EXAMPLE_CANDIDATES.json');
    const candidates = candidatesData.candidates || [];
    
    if (candidates.length === 0) {
      console.error('❌ No candidates found in EXAMPLE_CANDIDATES.json');
      process.exit(1);
    }
    
    // Convert array to object with IDs as keys
    const candidatesObj = {};
    candidates.forEach((candidate, index) => {
      const id = candidate.id || `candidate-${index + 1}`;
      candidatesObj[id] = {
        ...candidate,
        id,
        votes: candidate.votes || 0,
      };
    });
    
    // Write to Firebase
    await db.ref('candidates').set(candidatesObj);
    console.log(`✅ Successfully loaded ${candidates.length} candidates into Firebase`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetCandidates();
