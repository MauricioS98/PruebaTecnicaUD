import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import * as ctrl from './admin.controller.js';

const router = Router();

router.get('/users', authJwt, requireAdmin, ctrl.index);
router.patch('/users/:id', authJwt, requireAdmin, ctrl.updateAdminStatus);

router.get('/instruments-catalog', authJwt, requireAdmin, ctrl.getInstrumentsCatalog);
router.post('/type-instruments', authJwt, requireAdmin, ctrl.createTypeInstrument);
router.put('/type-instruments/:id', authJwt, requireAdmin, ctrl.updateTypeInstrument);
router.delete('/type-instruments/:id', authJwt, requireAdmin, ctrl.deleteTypeInstrument);
router.post('/instruments', authJwt, requireAdmin, ctrl.createInstrument);
router.put('/instruments/:id', authJwt, requireAdmin, ctrl.updateInstrument);
router.delete('/instruments/:id', authJwt, requireAdmin, ctrl.deleteInstrument);

export default router;
