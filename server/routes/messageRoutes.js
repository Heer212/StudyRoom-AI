import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.get('/:roomId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'name picture')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;