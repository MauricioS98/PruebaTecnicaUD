import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import * as ctrl from './admin.controller.js';

const router = Router();

router.get('/users', authJwt, requireAdmin, ctrl.index);
router.patch('/users/:id', authJwt, requireAdmin, ctrl.updateAdminStatus);

export default router;
