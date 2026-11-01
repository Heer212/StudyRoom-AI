import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    label: { type: String, trim: true, maxlength: 40 }, // free-text subject, optional
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Task', taskSchema);