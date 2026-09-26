import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import roomRoutes from './routes/roomRoutes.js';
import planRoutes from './routes/planRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';


connectDB();

const app = express();
const PORT = 5000;


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/rooms', roomRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});