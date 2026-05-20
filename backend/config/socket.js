import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://stack-flow-manager.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);
    socket.on('join_workspace', (id) => socket.join(`workspace:${id}`));
    socket.on('join_project',   (id) => socket.join(`project:${id}`));
    socket.on('disconnect', () => console.log(`🔌 Disconnected: ${socket.id}`));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
