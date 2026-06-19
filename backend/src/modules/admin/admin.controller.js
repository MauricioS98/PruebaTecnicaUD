import { listUsers, setUserAdminStatus } from './admin.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function index(req, res, next) {
  try {
    const data = await listUsers();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminStatus(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      throw new ApiError(400, 'Identificador de usuario inválido');
    }

    if (typeof req.body?.isAdmin !== 'boolean') {
      throw new ApiError(400, 'isAdmin debe ser un valor booleano');
    }

    const data = await setUserAdminStatus(req.user, targetUserId, req.body.isAdmin);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
