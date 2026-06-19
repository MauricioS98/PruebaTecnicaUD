import { Router } from 'express';
import { googleLogin, googleRegister, me } from './auth.controller.js';
import { authJwt } from '../../middlewares/authJwt.js';

const router = Router();

router.post('/google', googleLogin);
router.post('/google/register', googleRegister);
router.get('/me', authJwt, me);

export default router;
