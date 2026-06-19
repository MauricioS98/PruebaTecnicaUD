import { Router } from 'express';
import { authJwt } from '../../middlewares/authJwt.js';
import { requireWriteAccess } from '../../middlewares/requireWrite.js';
import { requireComposerProfile } from '../../middlewares/requireComposer.js';
import { uploadScorePdf, handleUploadError } from '../../middlewares/uploadScore.js';
import { requireDirectorProfile } from '../../middlewares/requireDirector.js';
import { uploadInterpretationAudio, handleAudioUploadError } from '../../middlewares/uploadAudio.js';
import * as ctrl from './catalog.controller.js';

const router = Router();

router.get('/catalogs', authJwt, ctrl.listCatalogs);

router.get('/works', authJwt, ctrl.listWorks);
router.get('/works/:id', authJwt, ctrl.getWork);
router.post(
  '/works',
  authJwt,
  requireComposerProfile,
  uploadScorePdf,
  handleUploadError,
  ctrl.createWork
);
router.put(
  '/works/:id',
  authJwt,
  requireComposerProfile,
  uploadScorePdf,
  handleUploadError,
  ctrl.updateWork
);
router.delete('/works/:id', authJwt, requireComposerProfile, ctrl.deleteWork);

router.get('/composers', authJwt, ctrl.listComposers);
router.put('/composers/:id', authJwt, requireWriteAccess, ctrl.updateComposer);

router.get('/directors', authJwt, ctrl.listDirectors);
router.get('/directors/:id', authJwt, ctrl.getDirector);
router.put('/directors/:id', authJwt, requireWriteAccess, ctrl.updateDirector);

router.get('/artists', authJwt, ctrl.listArtists);
router.get('/artists/:id', authJwt, ctrl.getArtist);
router.put('/artists/:id', authJwt, requireWriteAccess, ctrl.updateArtist);

router.get('/interpretations', authJwt, ctrl.listInterpretations);
router.post(
  '/interpretations',
  authJwt,
  requireDirectorProfile,
  uploadInterpretationAudio,
  handleAudioUploadError,
  ctrl.createInterpretation
);
router.put(
  '/interpretations/:id',
  authJwt,
  requireDirectorProfile,
  uploadInterpretationAudio,
  handleAudioUploadError,
  ctrl.updateInterpretation
);
router.delete('/interpretations/:id', authJwt, requireDirectorProfile, ctrl.deleteInterpretation);

export default router;
