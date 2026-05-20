import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { getIO } from '../config/socket.js';

export const createTask = async (req, res, next) => {
  try {
    const { title, description, type, status, priority, assigneeId, due_date, projectId } = req.body;
    const task = await Task.create({
      title, description, type, status, priority,
      assignee: assigneeId || null,
      due_date, projectId,
    });
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });
    const populated = await task.populate('assignee', '-password');
    getIO().to(`project:${projectId}`).emit('task:created', populated);
    res.status(201).json(populated);
  } catch (err) { next(err); }
};

export const updateTask = async (req, res, next) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignee', '-password');
    if (!updated) return res.status(404).json({ message: 'Task not found' });
    getIO().to(`project:${updated.projectId}`).emit('task:updated', updated);
    res.json(updated);
  } catch (err) { next(err); }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      await Project.findByIdAndUpdate(task.projectId, { $pull: { tasks: task._id } });
      getIO().to(`project:${task.projectId}`).emit('task:deleted', { taskId: req.params.id, projectId: task.projectId });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};
