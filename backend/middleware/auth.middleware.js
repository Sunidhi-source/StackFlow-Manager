import jwt from 'jsonwebtoken';
import Workspace from '../models/Workspace.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const member = workspace.members.find((m) => m.user.toString() === req.user.id);
    if (!member || member.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    req.workspace = workspace;
    next();
  } catch (err) {
    next(err);
  }
};
