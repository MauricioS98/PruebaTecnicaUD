import { getProfileStatus, activateProfile, deactivateProfile, updateProfile, updateAccount, updateAccountEmailWithGoogle } from './profile.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function status(req, res, next) {
  try {
    const data = await getProfileStatus(req);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function patchAccount(req, res, next) {
  try {
    const data = await updateAccount(req, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al actualizar la cuenta'));
  }
}

export async function patchAccountEmail(req, res, next) {
  try {
    const data = await updateAccountEmailWithGoogle(req, req.body?.idToken);
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al actualizar el correo'));
  }
}

export async function activateComposer(req, res, next) {
  try {
    const data = await activateProfile(req, 'composer', req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al activar perfil'));
  }
}

export async function activateDirector(req, res, next) {
  try {
    const data = await activateProfile(req, 'director', req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al activar perfil'));
  }
}

export async function activateArtist(req, res, next) {
  try {
    const data = await activateProfile(req, 'artist', req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al activar perfil'));
  }
}

export async function deactivateComposer(req, res, next) {
  try {
    const data = await deactivateProfile(req, 'composer');
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al desactivar perfil'));
  }
}

export async function deactivateDirector(req, res, next) {
  try {
    const data = await deactivateProfile(req, 'director');
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al desactivar perfil'));
  }
}

export async function deactivateArtist(req, res, next) {
  try {
    const data = await deactivateProfile(req, 'artist');
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al desactivar perfil'));
  }
}

export async function patchComposer(req, res, next) {
  try {
    const data = await updateProfile(req, 'composer', req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al actualizar perfil'));
  }
}

export async function patchDirector(req, res, next) {
  try {
    const data = await updateProfile(req, 'director', req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al actualizar perfil'));
  }
}

export async function patchArtist(req, res, next) {
  try {
    const data = await updateProfile(req, 'artist', req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(500, 'Error al actualizar perfil'));
  }
}
