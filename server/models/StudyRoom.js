import mongoose from 'mongoose';

const studyRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    topics: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const StudyRoom = mongoose.model('StudyRoom', studyRoomSchema);
export default StudyRoom;