import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String },
    password: { type: String }, // only used for email/password signups later
    subscription: {
      plan: { type: String, enum: ['free', 'premium'], default: 'free' },
      billing: { type: String, enum: ['monthly', 'yearly'] },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;