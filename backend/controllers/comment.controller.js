import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { getIO } from '../config/socket.js';

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) { next(err); }
};

export const createComment = async (req, res, next) => {
  try {
    const { content, userName, userAvatar } = req.body;
    const comment = await Comment.create({
      taskId: req.params.taskId,
      userId: req.user.id,
      content, userName, userAvatar,
    });
    const task = await Task.findById(req.params.taskId);
    if (task) getIO().to(`project:${task.projectId}`).emit('comment:created', comment);
    res.status(201).json(comment);
  } catch (err) { next(err); }
};
