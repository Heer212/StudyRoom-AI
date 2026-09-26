import express from 'express';
import Resource from '../models/Resource.js';
import { protect } from '../middleware/protect.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload a file to a room
router.post('/:roomId', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resource = await Resource.create({
      title: req.body.title || req.file.originalname,
      fileUrl: req.file.path, // Cloudinary gives back the hosted URL here
      fileType: req.file.mimetype,
      uploadedBy: req.user._id,
      room: req.params.roomId,
    });

    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List resources for a room
router.get('/:roomId', protect, async (req, res) => {
  try {
    const resources = await Resource.find({ room: req.params.roomId })
      .populate('uploadedBy', 'name picture')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;