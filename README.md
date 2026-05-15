# 🚀 StackFlow Manager v2
**Enterprise-Grade Workspace & Project Management Platform**

![MERN](https://img.shields.io/badge/Stack-MERN-blue)
![Redux](https://img.shields.io/badge/State-Redux--Toolkit-764ABC?logo=redux)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black?logo=socket.io)
![Tests](https://img.shields.io/badge/Tests-Vitest-green)
![Security](https://img.shields.io/badge/Auth-JWT-orange)

StackFlow Manager is a full-stack SaaS-style project management platform built for high-performance team collaboration. Features real-time synchronization via WebSockets, JWT-authenticated API routes, Role-Based Access Control, and a fully tested Redux state layer.

---

## 🚀 Live Demo
https://stack-flow-manager.vercel.app/

---

## ⚙️ What's New in v2

### ✅ Real-Time Collaboration (Socket.io)
- WebSocket server integrated via `socket.io` on the Express HTTP server
- Workspace-scoped and project-scoped Socket rooms (`workspace:<id>`, `project:<id>`)
- Live events for task creation, updates, deletions and project changes
- Frontend `SocketContext` with automatic room joining and Redux dispatch on events
- Live connection indicator shown in Dashboard and Project Detail headers

### ✅ JWT Authentication
- All protected API routes now require `Authorization: Bearer <token>` headers
- Tokens issued on login/register with 7-day expiry
- Centralized `api.js` utility auto-injects auth headers on every request
- `authenticate` middleware guards all write operations

### ✅ Role-Based Access Control (RBAC)
- `requireWorkspaceAdmin` middleware blocks destructive workspace operations for non-admins
- Server-side role verification before DELETE/PUT on workspaces
- Prevents ID-traversal attacks on workspace membership

### ✅ Test Suite (Vitest)
- `workspaceSlice.test.js` — 6 reducer unit tests covering all CRUD operations
- `authSlice.test.js` — 5 reducer unit tests covering login/logout/update flows
- `api.test.js` — 3 integration tests for auth header injection and HTTP methods
- Run with `npm test`

### ✅ Polish & Bug Fixes
- Loading skeleton components (`StatsGridSkeleton`, `ProjectCardSkeleton`, `TaskRowSkeleton`)
- Fixed missing `next()` call in User model pre-save hook
- Fixed invite link hardcoded to `localhost:5173` → now uses `CLIENT_URL` env variable
- Fixed task status updates using simulated timeouts → now real `PUT /api/tasks/:id` calls
- Fixed task delete using wrong id field (`id` vs `_id`)
- Strengthened Project model with proper enums, indexes, and workspace reference
- CORS now uses explicit `CLIENT_URL` env instead of wildcard `*`

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (jsonwebtoken), BCrypt.js |
| **Real-time** | Socket.io (WebSockets) |
| **Testing** | Vitest, Testing Library |
| **Email** | Nodemailer |

---

## 🧠 Architecture Highlights

### 1. Real-Time WebSocket Layer
Socket.io server runs on the same HTTP server as Express. Events are scoped to workspace/project rooms so clients only receive relevant updates. Frontend `SocketContext` dispatches received events directly into Redux store.

### 2. Optimistic UI + Server Sync
Redux Toolkit with Immer handles instant UI updates. The server confirms changes and Socket.io broadcasts to all connected clients, ensuring eventual consistency across tabs/users.

### 3. Reference-Based NoSQL Schema
MongoDB uses ObjectID references: Workspaces → Projects → Tasks → Assignees. Dual-reference on Tasks (projectId + assignee) enables efficient queries without denormalization.

### 4. JWT + RBAC Middleware Chain
Every protected route passes through `authenticate` (validates JWT) → optionally `requireWorkspaceAdmin` (checks member role). Prevents unauthorized access at the route level.

### 5. Slug-Based Workspace URLs
Mongoose pre-validate hook converts workspace names to clean URL slugs (`Team Alpha!` → `team-alpha`), enabling SEO-friendly and human-readable routing.

---

## ⚙️ Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas Account

### Quick Start
```bash
git clone https://github.com/Sunidhi-source/StackFlow-Manager.git
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_min_32_chars
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
VITE_BASE_URL=http://localhost:5000
```

### Run
```bash
# Start backend
node server.js

# Start frontend (new terminal)
npm run dev

# Run tests
npm test
```

---

👤 **Lead Developer:** Sunidhi Sharma
