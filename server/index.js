import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.error("Firebase initialization error. Check your ENV variables.", error);
  }
}

const db = admin.database();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper function to generate random values in a range
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Initial state template if Firebase is empty
const initialServerStates = {
  1: { mode: 'idle', cpu: 12, gpu: 2, temp: 42, rpm: 1500, state: 'normal', manualOverride: false },
  2: { mode: 'compute', cpu: 85, gpu: 92, temp: 88, rpm: 4500, state: 'normal', manualOverride: false },
  3: { mode: 'idle', cpu: 18, gpu: 5, temp: 45, rpm: 1800, state: 'normal', manualOverride: false },
  4: { mode: 'compute', cpu: 78, gpu: 88, temp: 85, rpm: 4300, state: 'normal', manualOverride: false },
  5: { mode: 'idle', cpu: 22, gpu: 1, temp: 48, rpm: 2000, state: 'normal', manualOverride: false },
  6: { mode: 'idle', cpu: 15, gpu: 4, temp: 43, rpm: 1600, state: 'normal', manualOverride: false },
};

app.get('/metrics', async (req, res) => {
  try {
    const ref = db.ref('serverStates');
    const snapshot = await ref.once('value');
    let dbStates = snapshot.val();

    // Seed database if empty
    if (!dbStates) {
      await ref.set(initialServerStates);
      dbStates = initialServerStates;
    }

    const servers = [];
    
    for (let i = 1; i <= 6; i++) {
      const sId = `SRV-0${i}`;
      const s = dbStates[i] || initialServerStates[i];
      let currentRpm = s.rpm;
      let currentState = s.state;
      let currentCpu = s.cpu;
      let currentGpu = s.gpu;
      let currentTemp = s.temp;

      // Only apply random fluctuations if manualOverride is not true for RPM/State
      if (!s.manualOverride) {
        if (s.mode === 'compute') {
          currentCpu = Math.max(70, Math.min(100, currentCpu + rand(-2, 2)));
          currentGpu = Math.max(65, Math.min(100, currentGpu + rand(-2, 2)));
          currentTemp = Math.max(75, Math.min(95, currentTemp + rand(-1, 1))); 
          currentRpm = Math.max(3800, Math.min(4800, currentRpm + rand(-50, 50)));
        } else {
          currentCpu = Math.max(5, Math.min(35, currentCpu + rand(-1, 2)));
          currentGpu = Math.max(0, Math.min(15, currentGpu + rand(-1, 1)));
          currentTemp = Math.max(35, Math.min(55, currentTemp + rand(-1, 1)));
          currentRpm = Math.max(1200, Math.min(2200, currentRpm + rand(-20, 20)));
        }
      }

      let workloadLabel = s.mode === 'compute' ? 'Model Training' : 'Idle / Inference';
      let currentPower = s.mode === 'compute' ? rand(480, 520) : rand(180, 210);

      // Handle the migration state
      if (currentState === 'migration') {
          workloadLabel = 'Live Migration';
          currentPower = rand(300, 350); 
          currentTemp = Math.max(60, Math.min(80, currentTemp + rand(-2, 2))); // Example thermal shift
      }

      // Save the micro-fluctuations back to Firebase so they persist across requests
      if (!s.manualOverride) {
        await db.ref(`serverStates/${i}`).update({
          cpu: currentCpu,
          gpu: currentGpu,
          temp: currentTemp,
          rpm: currentRpm
        });
      }

      servers.push({
        id: sId,
        cpu: currentCpu,
        gpu_usage: currentGpu,
        temp: currentTemp,
        fan_rpm: currentRpm,
        workload: workloadLabel,
        power: currentPower
      });
    }

    const acSystem = {
      vzg_ambient_c: rand(28, 35),
      chiller_load: rand(60, 90)
    };

    const geminiRecs = [
      { priority: 'HIGH', action: 'Scale down SRV-02 GPU workload', saving: '120W' },
      { priority: 'MEDIUM', action: 'Increase CRAC-1 flow rate by 15%', saving: 'Optimal Temp Range' },
      { priority: 'LOW', action: 'Shift batch processing to Night cycle', saving: '15% Cost' }
    ];

    res.json({
      timestamp: new Date().toISOString(),
      servers,
      acSystem,
      geminiRecs
    });
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /server/fan
app.post('/server/fan', async (req, res) => {
    const { id, rpm } = req.body;
    if (!id || typeof rpm !== 'number') return res.status(400).json({ error: 'Missing or invalid id/rpm' });
    
    const numericId = parseInt(id.replace('SRV-0', ''), 10);
    
    try {
      await db.ref(`serverStates/${numericId}`).update({
        rpm: rpm,
        manualOverride: true
      });
      res.json({ success: true, message: `Fan RPM for ${id} overridden to ${rpm}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update Firebase' });
    }
});

// POST /workload/shift
app.post('/workload/shift', async (req, res) => {
    const { id, state } = req.body;
    if (!id || !state) return res.status(400).json({ error: 'Missing id or state' });

    const numericId = parseInt(id.replace('SRV-0', ''), 10);
    
    try {
      await db.ref(`serverStates/${numericId}`).update({
        state: state
      });
      res.json({ success: true, message: `Workload state for ${id} shifted to ${state}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update Firebase' });
    }
});

// For local testing (Vercel uses the exported app)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GreenCore AI Backend running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
