import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import interviewRoutes from './routes/interviewRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB optional connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/intervai';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB database successfully.'))
  .catch(err => console.log('MongoDB connection skipped/failed. Running with high-performance In-Memory Session Store:', err.message));

// API Routes
app.use('/api', interviewRoutes);

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
