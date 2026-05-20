import { Router } from 'express';
import { createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/',      authenticate, createTask);
router.put('/:id',    authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);
export default router;
