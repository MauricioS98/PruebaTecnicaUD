import 'dotenv/config';

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
};

export function assertAuthConfig() {
  if (!authConfig.jwtSecret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  if (!authConfig.googleClientId) {
    throw new Error('GOOGLE_CLIENT_ID no está definido en las variables de entorno');
  }
}
