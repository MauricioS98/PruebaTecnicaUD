import { Composer } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireComposerProfile(req, _res, next) {
  if (!req.user) {
    next(new ApiError(401, 'No autenticado'));
    return;
  }

  const composer = await Composer.findOne({
    where: { id_user: req.user.id_user },
    attributes: ['id_composer', 'nickname'],
  });

  if (!composer) {
    next(new ApiError(403, 'Se requiere el perfil de Compositor para gestionar obras'));
    return;
  }

  req.composerProfile = composer;
  next();
}
