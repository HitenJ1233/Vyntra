import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import { connectDB, closeDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), { maxAge: '1h', setHeaders(res) { res.setHeader('X-Content-Type-Options', 'nosniff'); } }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Vyntra API' }));
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5001;
connectDB().then(() => {
  const server = app.listen(port, () => console.log(`Vyntra API running at http://localhost:${port}`));
  const handleExit = async () => {
    server.close();
    await closeDB();
    process.exit(0);
  };
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
  process.once('SIGUSR2', async () => {
    server.close();
    await closeDB();
    process.kill(process.pid, 'SIGUSR2');
  });
}).catch(err => {
  console.error('Could not start API:', err.message);
  process.exit(1);
});

