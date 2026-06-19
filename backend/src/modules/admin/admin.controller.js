import { listUsers, setUserAdminStatus } from './admin.service.js';
import * as instrumentsService from './admin.instruments.service.js';
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

export async function getInstrumentsCatalog(_req, res, next) {
  try {
    const data = await instrumentsService.getInstrumentsCatalog();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createTypeInstrument(req, res, next) {
  try {
    const data = await instrumentsService.createTypeInstrument(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateTypeInstrument(req, res, next) {
  try {
    const data = await instrumentsService.updateTypeInstrument(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deleteTypeInstrument(req, res, next) {
  try {
    const data = await instrumentsService.deleteTypeInstrument(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createInstrument(req, res, next) {
  try {
    const data = await instrumentsService.createInstrument(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateInstrument(req, res, next) {
  try {
    const data = await instrumentsService.updateInstrument(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deleteInstrument(req, res, next) {
  try {
    const data = await instrumentsService.deleteInstrument(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
