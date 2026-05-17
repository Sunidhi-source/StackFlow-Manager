<div align="center">

# StackFlow Manager

**Enterprise-grade workspace & project management — built for real teams.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-stack--flow--manager.vercel.app-4F46E5?style=for-the-badge)](https://stack-flow-manager.vercel.app/)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

</div>

---

## Overview

StackFlow Manager is a full-stack SaaS-style project management platform that lets teams create workspaces, manage projects, assign tasks, and collaborate — all in real time. It features WebSocket-powered live updates, JWT authentication, Role-Based Access Control, a full test suite, and a polished dual-theme UI.

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Dashboard — Dark Mode</b></td>
    <td align="center"><b>Dashboard — Light Mode</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/dashboard-dark.png" alt="Dashboard Dark Mode" width="100%"/></td>
    <td><img src="screenshots/dashboard-light.png" alt="Dashboard Light Mode" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Project Details & Task Board</b></td>
    <td align="center"><b>Profile & Account Settings</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/projectdetails.png" alt="Project Details" width="100%"/></td>
    <td><img src="screenshots/profile.png" alt="Profile Page" width="100%"/></td>
  </tr>
</table>

---

## Features

### ⚡ Real-Time Collaboration

Live WebSocket synchronization powered by Socket.io. Events are scoped to workspace and project rooms so clients only receive updates relevant to them. A live connection indicator is shown in the Dashboard and Project Detail headers.

### 🔐 JWT Authentication

All protected routes require a `Bearer` token. Tokens are issued on login/register with a 7-day expiry. A centralized `api.js` utility auto-injects auth headers on every request — no repetitive boilerplate.

### 🛡️ Role-Based Access Control (RBAC)

`requireWorkspaceAdmin` middleware blocks destructive workspace operations for non-admins. All write operations are verified server-side, preventing ID-traversal and unauthorized access.

### 📋 Project & Task Management

Create workspaces, spin up projects, and break work into tasks with status, type, priority, assignees, due dates, and comments. Filter tasks by any combination of these attributes from the project detail view.

### 📅 Calendar & Analytics Views

Each project ships with a calendar view for deadline visibility and an analytics view with charts (Recharts) for progress tracking.

### 🎨 Dual-Theme UI

A fully polished light/dark mode with smooth transitions via Framer Motion and Tailwind CSS. Theme preference is persisted via Redux.

### 📧 Email Invites

Workspace admins can invite members via email (Nodemailer + Gmail). Invite links are generated with a configurable `CLIENT_URL` for deployment flexibility.

### 🧪 Test Suite

14 unit and integration tests written with Vitest covering Redux reducers and the API utility layer.

---

## Tech Stack

| Layer        | Technologies                                                            |
| ------------ | ----------------------------------------------------------------------- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Redux Toolkit, Framer Motion, Recharts |
| **Backend**  | Node.js, Express 5, Socket.io                                           |
| **Database** | MongoDB (Mongoose ODM)                                                  |
| **Auth**     | JWT (jsonwebtoken), BCrypt.js                                           |
| **Email**    | Nodemailer                                                              |
| **Testing**  | Vitest, Testing Library                                                 |

---

## Architecture

**Real-Time Layer** — Socket.io runs on the same HTTP server as Express. The `SocketContext` on the frontend automatically joins workspace/project rooms and dispatches incoming events directly into the Redux store.

**Optimistic UI** — Redux Toolkit with Immer handles instant UI updates. The server confirms changes and Socket.io broadcasts to all connected clients, ensuring consistency across tabs and users.

**NoSQL Schema** — MongoDB uses ObjectID references: `Workspaces → Projects → Tasks → Assignees`. Dual-reference on Tasks (`projectId` + `assignee`) enables efficient queries without denormalization.

**Middleware Chain** — Every protected route passes through `authenticate` (validates JWT) → optionally `requireWorkspaceAdmin` (checks member role). Clean and composable.

**Slug-Based URLs** — A Mongoose pre-validate hook converts workspace names into clean slugs (`Team Alpha!` → `team-alpha`) for SEO-friendly, human-readable routing.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/Sunidhi-source/StackFlow-Manager.git
cd StackFlow-Manager
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_characters
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
VITE_BASE_URL=http://localhost:5000
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords to generate one.

### 3. Run

```bash
# Terminal 1 — Backend
node server.js

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Tests

```bash
npm test          # Run once
npm run test:watch  # Watch mode
```

---

## Project Structure

```
StackFlow-Manager/
├── controllers/          # Express route controllers
│   └── workspaceController.js
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Workspace.js
│   ├── Project.js
│   ├── Task.js
│   └── Comments.js
├── server.js             # Express + Socket.io server
├── src/
│   ├── app/              # Redux store
│   ├── components/       # Reusable UI components
│   ├── context/          # SocketContext
│   ├── features/         # Redux slices (auth, workspace, theme)
│   ├── pages/            # Route-level page components
│   └── App.jsx
├── screenshots/          # UI screenshots
└── package.json
```

---

## Deployment

The app is deployed with the frontend on **Vercel** and the backend on a Node-compatible host.

Set all environment variables in your hosting provider's dashboard. Make sure `CLIENT_URL` points to your Vercel domain and `VITE_BASE_URL` points to your backend URL before building.

```bash
npm run build   # Produces /dist for frontend deployment
```

---

## Author

**Sunidhi Sharma** — Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Sunidhi--source-181717?style=flat-square&logo=github)](https://github.com/Sunidhi-source)

---

<div align="center">
  <sub>Built with React, Node.js, MongoDB, and Socket.io</sub>
</div>
