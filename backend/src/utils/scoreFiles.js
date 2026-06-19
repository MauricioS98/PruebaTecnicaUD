import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCORES_DIR = path.join(__dirname, '../../uploads/scores');

export function ensureScoresDir() {
  fs.mkdirSync(SCORES_DIR, { recursive: true });
}

export function buildScorePublicUrl(filename) {
  return `/uploads/scores/${filename}`;
}

export function generateScoreFilename() {
  return `${randomUUID()}.pdf`;
}

export async function deleteScoreFile(scorePdfUrl) {
  if (!scorePdfUrl) return;

  const filename = path.basename(scorePdfUrl);
  const filePath = path.join(SCORES_DIR, filename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
