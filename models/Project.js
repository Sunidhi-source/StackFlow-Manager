import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  status: String,
  priority: String,
  progress: Number,
  team_members: { type: [String], default: [] }, 
  team_lead: String,
  tasks: Array 
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);