import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import roomRoutes from './routes/roomRoutes.js';
import planRoutes from './routes/planRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';

connectDB();

const app = express();
const PORT = 5000;


app.use(cors({
  origin: ['http://localhost:5173','https://study-room-ai-tau.vercel.app'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/rooms', roomRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

//Chat in Rooms
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
  });

  socket.on('sendMessage', async ({ roomId, content, sender }) => {
    try {
      const message = await Message.create({ room: roomId, sender: sender._id, content });
      const populatedMessage = {
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt,
        sender: { _id: sender._id, name: sender.name, picture: sender.picture },
      };
      io.to(roomId).emit('receiveMessage', populatedMessage);
    } catch (err) {
      console.error('Failed to save message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});