import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ensureScoresDir, SCORES_DIR } from './utils/scoreFiles.js';
import { ensureAudioDir, AUDIO_DIR } from './utils/audioFiles.js';

ensureScoresDir();
ensureAudioDir();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads/scores', express.static(SCORES_DIR));
app.use('/uploads/audio', express.static(AUDIO_DIR));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'OrchestApp API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', catalogRoutes);

app.use(errorHandler);

export default app;
