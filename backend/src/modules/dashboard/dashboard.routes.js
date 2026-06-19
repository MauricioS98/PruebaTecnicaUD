import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import { requireDashboardAccess } from '../../middlewares/requireDashboard.js';
import * as ctrl from './dashboard.controller.js';

const router = Router();

router.get('/', authJwt, requireDashboardAccess, ctrl.index);

export default router;
