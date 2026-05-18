import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "./models/User.js";
import Workspace from "./models/Workspace.js";
import Project from "./models/Project.js";
import Comment from "./models/Comments.js";
import Task from "./models/Task.js";
import {
  inviteMember,
  joinWorkspace,
} from "./controllers/workspaceController.js";

const app = express();
const httpServer = createServer(app);

// ─── Allowed Origins ─────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://stack-flow-manager.vercel.app",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// ─── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Attach io to app so controllers can emit events
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a workspace room so events are scoped
  socket.on("join_workspace", (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    console.log(`Socket ${socket.id} joined workspace:${workspaceId}`);
  });

  socket.on("join_project", (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());

// JWT Auth Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// RBAC Middleware — verifies user is ADMIN of workspace for destructive ops
const requireWorkspaceAdmin = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    const member = workspace.members.find(
      (m) => m.user.toString() === req.user.id,
    );
    if (!member || member.role !== "ADMIN") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    req.workspace = workspace;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Database ────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB Error:", err.message));

// ─── Health ──────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("<h1>StackFlow Manager API</h1>"));
app.get("/health", (req, res) => res.json({ status: "OK" }));
app.get("/api/health", (req, res) =>
  res.json({
    status: "alive",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }),
);

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "member",
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    const userResponse = user.toObject();
    delete userResponse.password;
    return res.status(201).json({ user: userResponse, token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    const userResponse = user.toObject();
    delete userResponse.password;
    return res.json({ user: userResponse, token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/auth/update-password", authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/users/update", authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true },
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Workspace Routes ─────────────────────────────────────────────────────────
app.post("/api/workspaces", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const workspace = new Workspace({
      name,
      ownerId: req.user.id,
      members: [{ user: req.user.id, role: "ADMIN" }],
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/workspaces/owner/:ownerId", authenticate, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ ownerId: req.params.ownerId })
      .populate({
        path: "projects",
        populate: {
          path: "tasks",
          populate: { path: "assignee", select: "-password" },
        },
      })
      .populate("members.user", "-password");
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/workspaces/:id", authenticate, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: "Not found" });
    if (workspace.ownerId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete a workspace" });
    }
    await Workspace.findByIdAndDelete(req.params.id);
    res.json({ message: "Workspace deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/workspaces/invite", authenticate, inviteMember);
app.post("/api/workspaces/join", joinWorkspace);

// ─── Project Routes ───────────────────────────────────────────────────────────
app.post("/api/projects", authenticate, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      workspace: req.body.workspaceId,
    });
    await project.save();
    await Workspace.findByIdAndUpdate(req.body.workspaceId, {
      $push: { projects: project._id },
    });

    // Real-time: notify all workspace members
    const io = req.app.get("io");
    io.to(`workspace:${req.body.workspaceId}`).emit("project:created", project);

    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/projects/:id", authenticate, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    const io = req.app.get("io");
    io.to(`workspace:${req.body.workspaceId}`).emit("project:updated", updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/projects/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (project) {
      await Workspace.findByIdAndUpdate(project.workspace, {
        $pull: { projects: project._id },
      });
      const io = req.app.get("io");
      io.to(`workspace:${project.workspace}`).emit(
        "project:deleted",
        req.params.id,
      );
    }
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Task Routes ──────────────────────────────────────────────────────────────
app.post("/api/tasks", authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
      projectId,
    } = req.body;
    const task = new Task({
      title,
      description,
      type,
      status,
      priority,
      assignee: assigneeId || null,
      due_date,
      projectId,
    });
    await task.save();
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });
    const populated = await task.populate("assignee", "-password");

    const io = req.app.get("io");
    io.to(`project:${projectId}`).emit("task:created", populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tasks/:id", authenticate, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignee", "-password");
    const io = req.app.get("io");
    io.to(`project:${updated.projectId}`).emit("task:updated", updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", authenticate, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (task) {
      await Project.findByIdAndUpdate(task.projectId, {
        $pull: { tasks: task._id },
      });
      const io = req.app.get("io");
      io.to(`project:${task.projectId}`).emit("task:deleted", {
        taskId: req.params.id,
        projectId: task.projectId,
      });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Comment Routes ───────────────────────────────────────────────────────────
app.get("/api/tasks/:taskId/comments", authenticate, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId }).sort({
      createdAt: 1,
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/api/tasks/:taskId/comments", authenticate, async (req, res) => {
  try {
    const { content, userName, userAvatar } = req.body;
    const comment = new Comment({
      taskId: req.params.taskId,
      userId: req.user.id,
      content,
      userName,
      userAvatar,
    });
    await comment.save();

    // Real-time: broadcast new comment to project room
    const task = await Task.findById(req.params.taskId);
    if (task) {
      const io = req.app.get("io");
      io.to(`project:${task.projectId}`).emit("comment:created", comment);
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Failed to save comment" });
  }
});

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
