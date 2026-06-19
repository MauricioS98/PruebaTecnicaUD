import {
  Composer,
  Director,
  Artist,
  Composition,
  Interpretation,
  InterpretationArtist,
} from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { setAuditUser } from '../../utils/audit.js';
import { resolveUserProfiles, getCurrentUser } from '../auth/auth.service.js';
import sequelize from '../../config/database.js';

export const SPECIAL_PROFILE_TYPES = ['composer', 'director', 'artist'];

const PROFILE_META = {
  composer: { label: 'Compositor', description: 'Creas y gestionas obras musicales' },
  director: { label: 'Director', description: 'Diriges interpretaciones orquestales' },
  artist: { label: 'Artista', description: 'Participas como intérprete' },
};

const DEACTIVATE_BLOCK_REASON = {
  composer: 'No puedes desactivar este perfil porque tienes obras registradas.',
  director: 'No puedes desactivar este perfil porque tienes interpretaciones como director.',
  artist: 'No puedes desactivar este perfil porque tienes interpretaciones como artista.',
};

async function findProfileRecord(userId, profileType) {
  if (profileType === 'composer') {
    return Composer.findOne({ where: { id_user: userId } });
  }
  if (profileType === 'director') {
    return Director.findOne({ where: { id_user: userId } });
  }
  if (profileType === 'artist') {
    return Artist.findOne({ where: { id_user: userId } });
  }
  return null;
}

async function getProfileDeactivationStatus(profileType, record) {
  if (!record) {
    return { canDeactivate: false, deactivateBlockedReason: 'Perfil no encontrado' };
  }

  if (profileType === 'composer') {
    const worksCount = await Composition.count({ where: { id_composer: record.id_composer } });
    return {
      canDeactivate: worksCount === 0,
      deactivateBlockedReason: worksCount > 0 ? DEACTIVATE_BLOCK_REASON.composer : null,
      usageCount: worksCount,
    };
  }

  if (profileType === 'director') {
    const interpretationsCount = await Interpretation.count({
      where: { id_director: record.id_director },
    });
    return {
      canDeactivate: interpretationsCount === 0,
      deactivateBlockedReason:
        interpretationsCount > 0 ? DEACTIVATE_BLOCK_REASON.director : null,
      usageCount: interpretationsCount,
    };
  }

  if (profileType === 'artist') {
    const interpretationsCount = await InterpretationArtist.count({
      where: { id_artist: record.id_artist },
    });
    return {
      canDeactivate: interpretationsCount === 0,
      deactivateBlockedReason: interpretationsCount > 0 ? DEACTIVATE_BLOCK_REASON.artist : null,
      usageCount: interpretationsCount,
    };
  }

  return { canDeactivate: false, deactivateBlockedReason: 'Tipo de perfil inválido' };
}

async function createProfileRecord(user, profileType, nickname, transaction) {
  const data = {
    id_user: user.id_user,
    nickname: nickname?.trim() || user.name,
    description: '',
  };

  if (profileType === 'composer') {
    return Composer.create(data, { transaction });
  }
  if (profileType === 'director') {
    return Director.create(data, { transaction });
  }
  if (profileType === 'artist') {
    return Artist.create(data, { transaction });
  }

  throw new ApiError(400, 'Tipo de perfil inválido');
}

export async function getProfileStatus(req) {
  const userId = req.user.id_user;
  const context = await resolveUserProfiles(userId);

  const available = [];
  const active = [];

  for (const type of SPECIAL_PROFILE_TYPES) {
    const meta = { type, ...PROFILE_META[type] };
    const record = await findProfileRecord(userId, type);

    if (record) {
      const idField = { composer: 'id_composer', director: 'id_director', artist: 'id_artist' }[type];
      const deactivation = await getProfileDeactivationStatus(type, record);
      active.push({
        ...meta,
        id: record[idField],
        profileDescription: record.description ?? '',
        ...deactivation,
      });
    } else {
      available.push(meta);
    }
  }

  return {
    user: await getCurrentUser(req),
    baseRole: 'oyente',
    activeProfiles: active,
    availableProfiles: available,
    ...context,
  };
}

export async function activateProfile(req, profileType, payload = {}) {
  if (!SPECIAL_PROFILE_TYPES.includes(profileType)) {
    throw new ApiError(400, 'Tipo de perfil inválido');
  }

  const existing = await findProfileRecord(req.user.id_user, profileType);
  if (existing) {
    throw new ApiError(409, `Ya tienes el perfil de ${PROFILE_META[profileType].label}`);
  }

  await sequelize.transaction(async (transaction) => {
    await setAuditUser(req.user.email, transaction);
    await createProfileRecord(req.user, profileType, payload.nickname, transaction);
  });

  return getProfileStatus(req);
}

export async function deactivateProfile(req, profileType) {
  if (!SPECIAL_PROFILE_TYPES.includes(profileType)) {
    throw new ApiError(400, 'Tipo de perfil inválido');
  }

  const record = await findProfileRecord(req.user.id_user, profileType);
  if (!record) {
    throw new ApiError(404, `No tienes el perfil de ${PROFILE_META[profileType].label}`);
  }

  const deactivation = await getProfileDeactivationStatus(profileType, record);
  if (!deactivation.canDeactivate) {
    throw new ApiError(409, deactivation.deactivateBlockedReason);
  }

  await sequelize.transaction(async (transaction) => {
    await setAuditUser(req.user.email, transaction);
    await record.destroy({ transaction });
  });

  return getProfileStatus(req);
}

export async function updateProfileDescription(req, profileType, description) {
  if (!SPECIAL_PROFILE_TYPES.includes(profileType)) {
    throw new ApiError(400, 'Tipo de perfil inválido');
  }

  const record = await findProfileRecord(req.user.id_user, profileType);
  if (!record) {
    throw new ApiError(404, `No tienes el perfil de ${PROFILE_META[profileType].label}`);
  }

  await sequelize.transaction(async (transaction) => {
    await setAuditUser(req.user.email, transaction);
    await record.update({ description: String(description ?? '').trim() }, { transaction });
  });

  return getProfileStatus(req);
}
