import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyDW7wbUtGivk_uosXs_gZ_fKAAozVXEk7c",
  authDomain: "project-5583295336911612869.firebaseapp.com",
  databaseURL: "https://project-5583295336911612869-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "project-5583295336911612869",
  storageBucket: "project-5583295336911612869.firebasestorage.app",
  messagingSenderId: "816715936754",
  appId: "1:816715936754:web:28d23b835fad9e6b33b16b",
  measurementId: "G-95FMJ6SP7W"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const database = getDatabase(app)
export const storage = getStorage(app)
export const functions = getFunctions(app, 'europe-west1') // Use same region as database

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment to use emulator:
  // connectFunctionsEmulator(functions, 'localhost', 5001)
}

// Initialize Analytics (optional)
if (typeof window !== 'undefined') {
  getAnalytics(app)
}
