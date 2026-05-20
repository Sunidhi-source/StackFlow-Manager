import { Router } from 'express';
import { createWorkspace, getWorkspacesByOwner, updateWorkspace, deleteWorkspace, inviteMember, joinWorkspace } from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/',              authenticate, createWorkspace);
router.get('/owner/:ownerId', authenticate, getWorkspacesByOwner);
router.put('/:id',            authenticate, updateWorkspace);
router.delete('/:id',         authenticate, deleteWorkspace);
router.post('/invite',        authenticate, inviteMember);
router.post('/join',          joinWorkspace);
export default router;
