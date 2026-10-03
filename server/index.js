import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import planRoutes from './routes/planRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import connectDB from './config/db.js';
import Message from './models/Message.js';

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://study-room-ai-tm7p-topaz.vercel.app', // your real frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection failed' });
  }
});


app.use('/api/rooms', roomRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = createServer(app);

const io = new Server(server, {
  path: '/api/server/socket.io',
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => socket.join(roomId));
  socket.on('leaveRoom', (roomId) => socket.leave(roomId));

  socket.on('sendMessage', async ({ roomId, content, sender }) => {
    try {
      const message = await Message.create({ room: roomId, sender: sender._id, content });
      io.to(roomId).emit('receiveMessage', {
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt,
        sender: { _id: sender._id, name: sender.name, picture: sender.picture },
      });
    } catch (err) {
      console.error('Failed to save message:', err.message);
    }
  });
});

// Run normally when developing locally; Vercel invokes the exported server directly
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default server;