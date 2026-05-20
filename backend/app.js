import express from 'express';
import cors from 'cors';

import authRoutes      from './routes/auth.routes.js';
import userRoutes      from './routes/user.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import projectRoutes   from './routes/project.routes.js';
import taskRoutes      from './routes/task.routes.js';
import commentRoutes   from './routes/comment.routes.js';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://stack-flow-manager.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/',       (_req, res) => res.json({ message: 'StackFlow API ✅' }));
app.get('/health', (_req, res) => res.json({ status: 'OK' }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects',   projectRoutes);
app.use('/api/tasks',      taskRoutes);
app.use('/api/tasks',      commentRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// IMPORTANT: Must have 4 params for Express to treat it as error handler
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
