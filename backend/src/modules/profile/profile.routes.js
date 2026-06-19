import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import * as ctrl from './profile.controller.js';

const router = Router();

router.get('/', authJwt, ctrl.status);
router.post('/composer', authJwt, ctrl.activateComposer);
router.post('/director', authJwt, ctrl.activateDirector);
router.post('/artist', authJwt, ctrl.activateArtist);

export default router;
