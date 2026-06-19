import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import * as ctrl from './profile.controller.js';

const router = Router();

router.get('/', authJwt, ctrl.status);
router.patch('/account', authJwt, ctrl.patchAccount);
router.patch('/account/email', authJwt, ctrl.patchAccountEmail);
router.post('/composer', authJwt, ctrl.activateComposer);
router.patch('/composer', authJwt, ctrl.patchComposer);
router.delete('/composer', authJwt, ctrl.deactivateComposer);
router.post('/director', authJwt, ctrl.activateDirector);
router.patch('/director', authJwt, ctrl.patchDirector);
router.delete('/director', authJwt, ctrl.deactivateDirector);
router.post('/artist', authJwt, ctrl.activateArtist);
router.patch('/artist', authJwt, ctrl.patchArtist);
router.delete('/artist', authJwt, ctrl.deactivateArtist);

export default router;
