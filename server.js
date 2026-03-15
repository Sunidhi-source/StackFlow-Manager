import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import User from './models/User.js';
import Workspace from './models/Workspace.js';
import Project from './models/Project.js';
import Comment from './models/Comments.js';
import { inviteMember, joinWorkspace } from "./controllers/workspaceController.js";


const app = express();
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


  app.get('/', (req, res) => {
    res.send("<h1>Backend is Running!</h1>");
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: "alive", 
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" 
    });
});

// 1. Get all comments for a specific task
app.get('/api/tasks/:taskId/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

// 2. Post a new comment
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

// Register
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

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        console.log(`🔑 User Logged In: ${user.name}`);
        const userResponse = user.toObject();
        delete userResponse.password;
        return res.json(userResponse);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update Password
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

// Create Workspace 
app.post('/api/workspaces', async (req, res) => {
  try {
    const { name, ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const workspace = new Workspace({
      name,
      ownerId,
      members: [
        {
          user: ownerId,
          role: "ADMIN" 
        }
      ]
    });

    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//  Update Workspace Branding & Name 
app.put('/api/workspaces/:id', async (req, res) => {
    try {
        const { name, branding } = req.body;
        const updatedWorkspace = await Workspace.findByIdAndUpdate(
            req.params.id,
            { name, branding }, 
            { new: true }
        ).populate('members.user');

        res.status(200).json(updatedWorkspace);
    } catch (err) {
        res.status(500).json({ error: "Failed to update workspace" });
    }
});

// Update Member Role 
app.patch('/api/workspaces/:id/members/:userId', async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role } = req.body; 

        const workspace = await Workspace.findOneAndUpdate(
            { _id: id, "members.user": userId },
            { $set: { "members.$.role": role } },
            { new: true }
        ).populate('members.user');

        res.status(200).json(workspace);
    } catch (err) {
        res.status(500).json({ error: "Failed to update member role" });
    }
});

// DELETE Workspace 
app.delete('/api/workspaces/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await Workspace.findByIdAndDelete(id);
        
        if (!deleted) return res.status(404).json({ message: "Workspace not found" });
        
        res.status(200).json({ message: "Workspace deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete workspace" });
    }
});

// Get Workspaces by Owner 
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

// --- PROJECT ROUTES ---

// 1. Create a new project
app.post('/api/projects', async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            workspace: req.body.workspaceId 
        };

        const project = new Project(projectData);
        await project.save();

        await Workspace.findByIdAndUpdate(req.body.workspaceId, {
            $push: { projects: project._id }
        });

        res.status(201).json(project);
    } catch (err) {
        console.error("Project Creation Error:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// Add a member to a specific project
app.post('/api/projects/:projectId/add-member', async (req, res) => {
    try {
        const { email } = req.body;
        const { projectId } = req.params;

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: "User not found in database" });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { 
                $addToSet: { 
                    team_members: user.email  } 
            },
            { returnDocument: 'after' } 
        );

        if (!updatedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(updatedProject);
    } catch (err) {
        console.error("SERVER ERROR:", err.message); 
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// DELETE a project by ID
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ error: "Server error while deleting" });
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
    console.log(`🚫 404: ${req.url}`);
    res.status(404).send("Route not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});