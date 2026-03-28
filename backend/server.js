import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDB } from './config/db.js';
import userRoutes      from './modules/user/user.routes.js';
import broadcastRoutes from './modules/broadcast/broadcast.routes.js';
import roomRoutes      from './modules/room/room.routes.js';
import { startPgnBroadcaster } from './services/pgnBroadcaster.js';
import { verifyAccessToken } from './modules/user/user.service.js';
import { User } from './modules/user/user.model.js';

await connectDB();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/users',           userRoutes);
app.use('/api/admin/broadcast', broadcastRoutes);
app.use('/api/rooms',           roomRoutes);

// Socket.io auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const { userId } = verifyAccessToken(token);
    const user = await User.findById(userId).select('username');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Socket.io events
io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.user.username}`);

  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    io.to(roomId).emit('user_joined', { username: socket.user.username });
    console.log(`${socket.user.username} joined room ${roomId}`);
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    io.to(roomId).emit('user_left', { username: socket.user.username });
  });

  socket.on('send_message', ({ roomId, message }) => {
    io.to(roomId).emit('receive_message', {
      username: socket.user.username,
      message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.user.username}`);
  });
});

// Start PGN broadcaster
startPgnBroadcaster(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));