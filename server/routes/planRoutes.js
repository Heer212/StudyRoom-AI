import express from 'express';
import StudyPlan from '../models/StudyPlan.js';
import StudyRoom from '../models/StudyRoom.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

// Create a study plan for a room (owner only)
router.post('/:roomId', protect, async (req, res) => {
  try {
    const room = await StudyRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (room.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the room owner can create a study plan' });
    }

    const existing = await StudyPlan.findOne({ room: req.params.roomId });
    if (existing) return res.status(400).json({ error: 'This room already has a study plan' });

    const { weeks } = req.body; // [{ title, tasks: [{ title }] }]

    const plan = await StudyPlan.create({ room: req.params.roomId, weeks });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a room's study plan
router.get('/:roomId', protect, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ room: req.params.roomId });
    if (!plan) return res.status(404).json({ error: 'No study plan yet for this room' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle current user's completion on a specific task
router.patch('/:planId/weeks/:weekId/tasks/:taskId/toggle', protect, async (req, res) => {
  try {
    const plan = await StudyPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const week = plan.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ error: 'Week not found' });

    const task = week.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const userId = req.user._id.toString();
    const alreadyDone = task.completedBy.some((id) => id.toString() === userId);

    if (alreadyDone) {
      task.completedBy = task.completedBy.filter((id) => id.toString() !== userId);
    } else {
      task.completedBy.push(req.user._id);
    }

    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;