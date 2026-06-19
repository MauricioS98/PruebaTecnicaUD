import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import { requireWriteAccess } from '../../middlewares/requireWrite.js';
import * as ctrl from './catalog.controller.js';

const router = Router();

router.get('/catalogs', authJwt, ctrl.listCatalogs);

router.get('/works', authJwt, ctrl.listWorks);
router.get('/works/:id', authJwt, ctrl.getWork);
router.post('/works', authJwt, requireWriteAccess, ctrl.createWork);
router.put('/works/:id', authJwt, requireWriteAccess, ctrl.updateWork);
router.delete('/works/:id', authJwt, requireWriteAccess, ctrl.deleteWork);

router.get('/composers', authJwt, ctrl.listComposers);
router.put('/composers/:id', authJwt, requireWriteAccess, ctrl.updateComposer);

router.get('/directors', authJwt, ctrl.listDirectors);
router.put('/directors/:id', authJwt, requireWriteAccess, ctrl.updateDirector);

router.get('/artists', authJwt, ctrl.listArtists);
router.put('/artists/:id', authJwt, requireWriteAccess, ctrl.updateArtist);

router.get('/interpretations', authJwt, ctrl.listInterpretations);
router.post('/interpretations', authJwt, requireWriteAccess, ctrl.createInterpretation);
router.delete('/interpretations/:id', authJwt, requireWriteAccess, ctrl.deleteInterpretation);

export default router;
