import { Router } from 'express';
import { getComments, createComment } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/:taskId/comments',  authenticate, getComments);
router.post('/:taskId/comments', authenticate, createComment);
export default router;
