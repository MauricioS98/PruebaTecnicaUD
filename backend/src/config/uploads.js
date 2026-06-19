import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function resolveUploadsRoot() {
  if (process.env.UPLOADS_DIR) {
    return process.env.UPLOADS_DIR;
  }
  if (process.env.VERCEL) {
    return '/tmp/uploads';
  }
  return path.join(__dirname, '../../uploads');
}

export const UPLOADS_ROOT = resolveUploadsRoot();
