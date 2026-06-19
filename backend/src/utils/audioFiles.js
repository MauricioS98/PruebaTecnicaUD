import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AUDIO_DIR = path.join(__dirname, '../../uploads/audio');

export function ensureAudioDir() {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export function generateAudioFilename() {
  return `${randomUUID()}.mp3`;
}

export async function deleteAudioFile(audioMp3Url) {
  if (!audioMp3Url) return;

  const filename = path.basename(audioMp3Url);
  const filePath = path.join(AUDIO_DIR, filename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
