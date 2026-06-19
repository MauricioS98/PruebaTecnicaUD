import { Composer, Director, Artist } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireWriteAccess(req, _res, next) {
  if (!req.user) {
    next(new ApiError(401, 'No autenticado'));
    return;
  }

  const userId = req.user.id_user;
  const [composer, director, artist] = await Promise.all([
    Composer.findOne({ where: { id_user: userId }, attributes: ['id_composer'] }),
    Director.findOne({ where: { id_user: userId }, attributes: ['id_director'] }),
    Artist.findOne({ where: { id_user: userId }, attributes: ['id_artist'] }),
  ]);

  if (!composer && !director && !artist) {
    next(new ApiError(403, 'Tu cuenta solo tiene permisos de consulta'));
    return;
  }

  next();
}
