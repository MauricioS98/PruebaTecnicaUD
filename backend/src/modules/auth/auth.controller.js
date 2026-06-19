import { loginWithGoogle, registerWithGoogle, getCurrentUser } from './auth.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    const result = await loginWithGoogle(idToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error en autenticación'));
  }
}

export async function googleRegister(req, res, next) {
  try {
    const { idToken } = req.body;
    const result = await registerWithGoogle(idToken);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error en registro'));
  }
}

export async function me(req, res, next) {
  try {
    const data = await getCurrentUser(req);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
