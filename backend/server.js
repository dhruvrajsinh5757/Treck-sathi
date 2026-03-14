import 'dotenv/config';
import fs from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/auth.js';
import tripsRoutes from './routes/trips.js';
import treksRoutes from './routes/treks.js';
import searchRoutes from './routes/search.js';
import usersRoutes from './routes/users.js';
import messagesRoutes, { conversationIdFor } from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import Message from './models/Message.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend origins. Always include Vercel production URL so CORS works on Render even if CLIENT_URL is unset.
const defaultOrigins = [
  'http://localhost:5173',
  'https://treck-sathi-jipx.vercel.app',
];
const fromEnv = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);
const allowedOrigins = fromEnv.length > 0 ? fromEnv : defaultOrigins;
const corsOrigin = allowedOrigins.length > 1 ? allowedOrigins : allowedOrigins[0] || defaultOrigins[0];

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: corsOrigin, credentials: true },
});

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api', tripsRoutes);
app.use('/api', treksRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', usersRoutes);
app.use('/api', messagesRoutes);
app.use('/api', notificationsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Socket.io - lightweight realtime chat
// (Auth for sockets kept simple: client sends userId after login)
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  socket.on('presence:online', ({ userId }) => {
    if (!userId) return;
    onlineUsers.set(String(userId), socket.id);
    io.emit('presence:list', { onlineUserIds: Array.from(onlineUsers.keys()) });
  });

  socket.on('chat:send', async ({ senderId, receiverId, message }) => {
    try {
      if (!senderId || !receiverId || !message) return;
      const cid = conversationIdFor(senderId, receiverId);
      const saved = await Message.create({
        conversationId: cid,
        senderId,
        receiverId,
        message: String(message).trim(),
        timestamp: new Date(),
        readStatus: 'delivered',
      });

      const payload = {
        _id: saved._id,
        conversationId: cid,
        senderId,
        receiverId,
        message: saved.message,
        timestamp: saved.timestamp,
        readStatus: saved.readStatus,
      };

      const receiverSocket = onlineUsers.get(String(receiverId));
      if (receiverSocket) io.to(receiverSocket).emit('chat:message', payload);
      socket.emit('chat:message', payload);
    } catch {
      // ignore
    }
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) onlineUsers.delete(uid);
    }
    io.emit('presence:list', { onlineUserIds: Array.from(onlineUsers.keys()) });
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
