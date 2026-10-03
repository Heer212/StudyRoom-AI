import express from 'express';
import StudyRoom from '../models/StudyRoom.js';
import { protect } from '../middleware/protect.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Create a room
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, topics } = req.body;

    const room = await StudyRoom.create({
      name,
      description,
      topics,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await StudyRoom.find().populate('owner', 'name picture');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single room by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.id)
      .populate('owner', 'name picture')
      .populate('members', 'name picture');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a room
router.post('/:id/join', protect, async (req, res) => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  try {
    const room = await StudyRoom.findById(req.params.id).populate('owner', 'name email');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const alreadyMember = room.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ error: 'Already a member of this room' });
    }

    room.members.push(req.user._id);
    await room.save();

    if (room.owner.email) {
  sendEmail({
    to: room.owner.email,
    subject: `🎓 ${req.user.name} joined "${room.name}"`,
    text: `${req.user.name} (${req.user.email}) just joined your study room "${room.name}".`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; background: #12141C; padding: 32px; border-radius: 12px;">
        <h2 style="color: #EDEDF0; margin-bottom: 8px;">New member joined 🎉</h2>
        <p style="color: #7D8199; font-size: 14px; margin-bottom: 24px;">
          Someone just joined your study room.
        </p>

        <div style="background: #1B1F2B; border-left: 3px solid #E8A33D; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #EDEDF0; font-size: 16px; margin: 0 0 4px 0; font-weight: bold;">
            ${req.user.name}
          </p>
          <p style="color: #7D8199; font-size: 14px; margin: 0;">
            ${req.user.email}
          </p>
        </div>

        <p style="color: #EDEDF0; font-size: 14px;">
          joined <strong style="color: #4FD1C5;">${room.name}</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #262B3A; margin: 24px 0;" />

        <p style="color: #7D8199; font-size: 12px; margin: 0;">
          StudyRoom AI · Learn Together. Stay Consistent.
        </p>
      </div>
    `,
  });
}

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;