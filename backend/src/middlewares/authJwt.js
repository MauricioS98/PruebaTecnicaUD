import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { UserApp } from '../models/index.js';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id_user,
      email: user.email,
      name: user.name,
    },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );
}

export async function authJwt(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token no proporcionado');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, authConfig.jwtSecret);

    const user = await UserApp.findByPk(payload.sub);
    if (!user) {
      throw new ApiError(401, 'Usuario no encontrado');
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(new ApiError(401, 'Token inválido o expirado'));
  }
}
