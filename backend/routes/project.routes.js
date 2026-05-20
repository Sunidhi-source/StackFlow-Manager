import { Router } from 'express';
import { createProject, updateProject, deleteProject } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/',      authenticate, createProject);
router.put('/:id',    authenticate, updateProject);
router.delete('/:id', authenticate, deleteProject);
export default router;
