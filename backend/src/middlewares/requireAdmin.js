import { ApiError } from '../utils/ApiError.js';

export function requireAdmin(req, _res, next) {
  if (!req.user) {
    next(new ApiError(401, 'No autenticado'));
    return;
  }

  if (!req.user.is_admin) {
    next(new ApiError(403, 'Se requiere rol de administrador'));
    return;
  }

  next();
}
