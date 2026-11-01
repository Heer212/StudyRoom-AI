import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    billing: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true }, // in paise
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);