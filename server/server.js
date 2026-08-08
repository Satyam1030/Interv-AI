import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import interviewRoutes from './routes/interviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import { seedPredefinedCandidates } from './services/seedService.js';

try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore fallback if unsupported
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection & Data Seeding
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intervai';
const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ':****@');

if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string_here') {
  console.log(`Attempting connection to MongoDB database...`);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB database successfully.');
    seedPredefinedCandidates();
  })
  .catch(err => {
    console.warn(`⚠️ MongoDB connection warning (${err.message}). Defaulting to In-Memory Session Store.`);
    seedPredefinedCandidates();
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api', interviewRoutes);

app.get('/api/demo/candidates', (req, res) => {
  try {
    const candidatesPath = path.join(__dirname, 'data/candidates.json');
    if (!fs.existsSync(candidatesPath)) return res.json({ candidates: [] });
    const data = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Root & Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', project: 'IntervAI', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>IntervAI Server</title></head>
      <body style="font-family: system-ui; background: #0f172a; color: #f8fafc; padding: 2rem;">
        <h1>🚀 IntervAI Server Active</h1>
        <p>The AI Interview Agent API is running.</p>
        <ul>
          <li><strong>POST /api/interview</strong> - Main interview session endpoint</li>
          <li><strong>GET /api/candidates</strong> - List cohort candidate profiles</li>
          <li><strong>GET /api/curriculum</strong> - List 31-day AI Cohort curriculum</li>
          <li><strong>POST /api/test-suite/run</strong> - Run automated API contract test</li>
        </ul>
      </body>
    </html>
  `);
});

// Serve frontend static build if available
const clientBuildPath = path.join(__dirname, '../client/dist');
if (express.static(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 IntervAI Server listening on http://localhost:${PORT}`);
  console.log(`Endpoint contract: POST http://localhost:${PORT}/api/interview`);
  console.log(`====================================================`);
});
