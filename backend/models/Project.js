import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  status:       { type: String, enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'], default: 'PLANNING' },
  priority:     { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  progress:     { type: Number, default: 0, min: 0, max: 100 },
  team_members: { type: [String], default: [] },
  team_lead:    { type: String, default: '' },
  workspace:    { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  tasks:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  start_date:   { type: Date },
  end_date:     { type: Date },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
