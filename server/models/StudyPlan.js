import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const weekSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tasks: [taskSchema],
});

const studyPlanSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyRoom', required: true, unique: true },
    weeks: [weekSchema],
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export default StudyPlan;