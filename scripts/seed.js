import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load ENV variables from the root .env file if running locally
dotenv.config({ path: resolve(process.cwd(), '../.env') });
dotenv.config();

console.log("🌱 Starting GreenCore AI Database Reset...");

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.FIREBASE_DATABASE_URL) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_DATABASE_URL in environment.");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log("✅ Firebase Admin Initialized.");
  } catch (error) {
    console.error("❌ Firebase initialization error. Check your ENV variables.", error.message);
    process.exit(1);
  }
}

const db = admin.database();

// The "Perfect" Calibrated Baseline State for the Demo
// All servers starting at a clean 40°C, idle modes, no manual overrides.
const demoBaselineState = {
  1: { mode: 'idle', cpu: 12, gpu: 2, temp: 40, rpm: 1500, state: 'normal', manualOverride: false },
  2: { mode: 'compute', cpu: 85, gpu: 92, temp: 88, rpm: 4500, state: 'normal', manualOverride: false },
  3: { mode: 'idle', cpu: 18, gpu: 5, temp: 40, rpm: 1800, state: 'normal', manualOverride: false },
  4: { mode: 'compute', cpu: 78, gpu: 88, temp: 85, rpm: 4300, state: 'normal', manualOverride: false },
  5: { mode: 'idle', cpu: 22, gpu: 1, temp: 40, rpm: 2000, state: 'normal', manualOverride: false },
  6: { mode: 'idle', cpu: 15, gpu: 4, temp: 40, rpm: 1600, state: 'normal', manualOverride: false },
};

const resetDatabase = async () => {
    try {
        console.log("🧹 Wiping current serverStates tree...");
        const ref = db.ref('serverStates');
        
        console.log("📦 Seeding baseline demo state...");
        await ref.set(demoBaselineState);
        
        console.log("✅ Database successfully reset to V10.0 Demo Baseline!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to reset database:", err);
        process.exit(1);
    }
};

resetDatabase();
