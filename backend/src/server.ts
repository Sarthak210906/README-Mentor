import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'README Mentor API' });
});

// Serve frontend if built
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.listen(PORT, () => {
  console.log(`[README Mentor] Server running on http://localhost:${PORT}`);
  console.log(`[README Mentor] Demo Mode: ${!process.env.GEMMA_API_KEY ? 'ACTIVE (fallback mode ready)' : 'OFF (API key active)'}`);
});
