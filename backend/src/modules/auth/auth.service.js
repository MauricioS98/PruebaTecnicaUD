import { OAuth2Client } from 'google-auth-library';
import { authConfig } from '../../config/auth.js';
import { UserApp, Composer, Director, Artist } from '../../models/index.js';
import { signToken } from '../../middlewares/authJwt.js';
import { ApiError } from '../../utils/ApiError.js';
import { setAuditUser } from '../../utils/audit.js';
import sequelize from '../../config/database.js';

const googleClient = new OAuth2Client(authConfig.googleClientId);

export const SPECIAL_PROFILE_TYPES = ['composer', 'director', 'artist'];

async function verifyGoogleToken(idToken) {
  if (!idToken) {
    throw new ApiError(400, 'idToken es requerido');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: authConfig.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new ApiError(401, 'Token de Google inválido');
  }

  return payload;
}

export async function resolveUserProfiles(userId) {
  const [composer, director, artist] = await Promise.all([
    Composer.findOne({ where: { id_user: userId }, attributes: ['id_composer'] }),
    Director.findOne({ where: { id_user: userId }, attributes: ['id_director'] }),
    Artist.findOne({ where: { id_user: userId }, attributes: ['id_artist'] }),
  ]);

  const profiles = [];

  if (composer) {
    profiles.push({ type: 'composer', id: composer.id_composer, label: 'Compositor' });
  }
  if (director) {
    profiles.push({ type: 'director', id: director.id_director, label: 'Director' });
  }
  if (artist) {
    profiles.push({ type: 'artist', id: artist.id_artist, label: 'Artista' });
  }

  const isOyente = profiles.length === 0;

  return {
    profiles,
    isOyente,
    isViewer: isOyente,
    profileLabel: isOyente ? 'Oyente' : `Oyente · ${profiles.map((p) => p.label).join(' · ')}`,
  };
}

async function buildAuthResponse(user, extra = {}) {
  const context = await resolveUserProfiles(user.id_user);
  const token = signToken(user);

  return {
    token,
    user: {
      id: user.id_user,
      name: user.name,
      email: user.email,
      ...context,
      ...extra,
    },
  };
}

export async function loginWithGoogle(idToken) {
  const payload = await verifyGoogleToken(idToken);

  const user = await UserApp.findOne({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError(404, 'No existe una cuenta con este correo. Regístrate primero.');
  }

  if (payload.name && user.name !== payload.name) {
    user.name = payload.name;
    await user.save();
  }

  return buildAuthResponse(user, { picture: payload.picture ?? null });
}

export async function registerWithGoogle(idToken) {
  const payload = await verifyGoogleToken(idToken);

  const existing = await UserApp.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'Ya existe una cuenta con este correo. Inicia sesión.');
  }

  const user = await sequelize.transaction(async (transaction) => {
    await setAuditUser(payload.email, transaction);

    return UserApp.create(
      {
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
      },
      { transaction }
    );
  });

  return buildAuthResponse(user, { picture: payload.picture ?? null, isNew: true });
}

export async function getCurrentUser(req) {
  const context = await resolveUserProfiles(req.user.id_user);
  return {
    id: req.user.id_user,
    name: req.user.name,
    email: req.user.email,
    ...context,
  };
}
