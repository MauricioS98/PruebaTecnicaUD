import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, '../src/environments/environment.prod.ts');

const apiBase = (process.env.API_URL || 'https://pruebatecnicaud.onrender.com').replace(
  /\/$/,
  ''
);

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  '735419800912-ln99fu46hvruja0ejttb6uuviq21p3dq.apps.googleusercontent.com';

const contents = `export const environment = {
  production: true,
  apiUrl: '${apiBase}/api',
  filesUrl: '${apiBase}',
  googleClientId: '${googleClientId}',
  loadingOverlayShowDelayMs: 350,
  loadingOverlayMinVisibleMs: 400,
};
`;

fs.writeFileSync(target, contents, 'utf8');
console.log('environment.prod.ts generado con API_URL =', apiBase);
