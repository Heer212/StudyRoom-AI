import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import planRoutes from './routes/planRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import connectDB from './config/db.js';
import Message from './models/Message.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://study-room-ai-tm7p-topaz.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

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

// Connect DB
connectDB();

// Socket.io
// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//   },
// });

// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);

//   socket.on('joinRoom', (roomId) => {
//     socket.join(roomId);
//   });

//   socket.on('leaveRoom', (roomId) => {
//     socket.leave(roomId);
//   });

//   socket.on('sendMessage', async ({ roomId, content, sender }) => {
//     try {
//       const message = await Message.create({
//         room: roomId,
//         sender: sender._id,
//         content,
//       });

//       const populatedMessage = {
//         _id: message._id,
//         content: message.content,
//         createdAt: message.createdAt,
//         sender: {
//           _id: sender._id,
//           name: sender.name,
//           picture: sender.picture,
//         },
//       };

//       io.to(roomId).emit('receiveMessage', populatedMessage);
//     } catch (err) {
//       console.error('Failed to save message:', err.message);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Socket disconnected:', socket.id);
//   });
// });

// Local development only
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT || 5000;

//   httpServer.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

export default app;