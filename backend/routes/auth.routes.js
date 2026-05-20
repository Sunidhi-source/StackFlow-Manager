import { Router } from 'express';
import { register, login, updatePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/register',       register);
router.post('/login',          login);
router.put('/update-password', authenticate, updatePassword);
export default router;
