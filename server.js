import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Models - Double check these filenames in your sidebar!
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import Project from './models/Project.js';
import Comment from './models/Comments.js'; 
import Task from './models/Task.js';

// Controllers
import { inviteMember, joinWorkspace } from "./controllers/workspaceController.js";

const app = express();

// 🔹 FIXED: Improved CORS for professional deployment
app.use(cors()); 
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((err) => console.error("❌ Database Connection Error:", err.message));

// Health Checks
app.get('/', (req, res) => {
    res.send("<h1>StackFlow Manager API is Running!</h1>");
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: "alive", 
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" 
    });
});

// --- COMMENT ROUTES ---
app.get('/api/tasks/:taskId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

app.post('/api/tasks/:taskId/comments', async (req, res) => {
    try {
        const { content, userId, userName, userAvatar } = req.body;
        const newComment = new Comment({
            taskId: req.params.taskId,
            userId,
            content,
            userName,
            userAvatar
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ error: "Failed to save comment" });
    }
});

// --- TASK ROUTES ---
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, type, status, priority, assigneeId, due_date, projectId } = req.body;

        const newTask = new Task({
            title, description, type, status, priority, 
            assignee: assigneeId || null, 
            due_date, 
            projectId
        });
        await newTask.save();

        await Project.findByIdAndUpdate(projectId, {
            $push: { tasks: newTask._id }
        });

        const populatedTask = await newTask.populate('assignee');
        res.status(201).json(populatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword, role: role || 'member'});
        await newUser.save(); 
        
        const userResponse = newUser.toObject();
        delete userResponse.password;
        return res.status(201).json(userResponse); 
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const userResponse = user.toObject();
        delete userResponse.password;
        return res.json(userResponse);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.put('/api/auth/update-password', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password too short" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- WORKSPACE ROUTES ---
app.post('/api/workspaces', async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    const workspace = new Workspace({
      name,
      ownerId,
      members: [{ user: ownerId, role: "ADMIN" }]
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 FIXED: Added your controller routes
app.post('/api/workspaces/invite', inviteMember);
app.post('/api/workspaces/join', joinWorkspace);

app.get('/api/workspaces/owner/:ownerId', async (req, res) => {
    try {
        const workspaces = await Workspace.find({ ownerId: req.params.ownerId })
            .populate({
                path: 'projects',
                populate: { path: 'tasks' } 
            })
            .populate('members.user'); 
        res.json(workspaces);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/workspaces/:id', async (req, res) => {
    try {
        await Workspace.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Workspace deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- PROJECT ROUTES ---
app.post('/api/projects', async (req, res) => {
    try {
        const project = new Project({ ...req.body, workspace: req.body.workspaceId });
        await project.save();
        await Workspace.findByIdAndUpdate(req.body.workspaceId, { $push: { projects: project._id } });
        res.status(201).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Project deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- USER MANAGEMENT ---
app.put('/api/users/update', async (req, res) => {
    try {
        const { userId, name, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, { name, email }, { new: true }).select("-password");
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- FALLBACKS ---
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server active on port ${PORT}`);
});