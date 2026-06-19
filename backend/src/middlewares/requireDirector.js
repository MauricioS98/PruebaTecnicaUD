import { Director } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireDirectorProfile(req, _res, next) {
  if (!req.user) {
    next(new ApiError(401, 'No autenticado'));
    return;
  }

  const director = await Director.findOne({
    where: { id_user: req.user.id_user },
    attributes: ['id_director', 'nickname'],
  });

  if (!director) {
    next(new ApiError(403, 'Se requiere el perfil de Director para gestionar interpretaciones'));
    return;
  }

  req.directorProfile = director;
  next();
}
