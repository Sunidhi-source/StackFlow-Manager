import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['TASK', 'BUG', 'STORY'], 
        default: 'TASK'
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'DONE', 'OVERDUE'],
        default: 'TODO'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null
    },
    due_date: {
        type: Date
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project', 
        required: true
    }
}, { timestamps: true });

taskSchema.index({ projectId: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;