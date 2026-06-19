import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import * as ctrl from './profile.controller.js';

const router = Router();

router.get('/', authJwt, ctrl.status);
router.post('/composer', authJwt, ctrl.activateComposer);
router.delete('/composer', authJwt, ctrl.deactivateComposer);
router.post('/director', authJwt, ctrl.activateDirector);
router.delete('/director', authJwt, ctrl.deactivateDirector);
router.post('/artist', authJwt, ctrl.activateArtist);
router.delete('/artist', authJwt, ctrl.deactivateArtist);

export default router;
