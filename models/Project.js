import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  team_members: { type: [String], default: [] },
  team_lead: { type: String, default: '' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  startDate: { type: Date },
  dueDate: { type: Date },
}, { timestamps: true });

// Auto-calculate progress from tasks
projectSchema.methods.recalculateProgress = async function () {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ projectId: this._id });
  if (tasks.length === 0) { this.progress = 0; return; }
  const done = tasks.filter(t => t.status === 'DONE').length;
  this.progress = Math.round((done / tasks.length) * 100);
};

export default mongoose.model('Project', projectSchema);
