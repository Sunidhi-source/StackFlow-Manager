import { Router } from 'express';
import { updateProfile, deleteAccount } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.put('/update',   authenticate, updateProfile);
router.delete('/:id',   authenticate, deleteAccount);
export default router;
