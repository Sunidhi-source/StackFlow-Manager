import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type:        { type: String, enum: ['TASK', 'BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER'], default: 'TASK' },
  status:      { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'], default: 'TODO' },
  priority:    { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  assignee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  due_date:    { type: Date },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

taskSchema.index({ projectId: 1 });
export default mongoose.model('Task', taskSchema);
