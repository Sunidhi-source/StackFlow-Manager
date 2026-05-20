import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';
import { getIO } from '../config/socket.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, workspace: req.body.workspaceId });
    await Workspace.findByIdAndUpdate(req.body.workspaceId, { $push: { projects: project._id } });
    getIO().to(`workspace:${req.body.workspaceId}`).emit('project:created', project);
    res.status(201).json(project);
  } catch (err) { next(err); }
};

export const updateProject = async (req, res, next) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    getIO().to(`workspace:${updated.workspace}`).emit('project:updated', updated);
    res.json(updated);
  } catch (err) { next(err); }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (project) {
      await Workspace.findByIdAndUpdate(project.workspace, { $pull: { projects: project._id } });
      getIO().to(`workspace:${project.workspace}`).emit('project:deleted', req.params.id);
    }
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};
