import mongoose from 'mongoose';

const promiseSchema = new mongoose.Schema({
  minister: { type: mongoose.Schema.Types.ObjectId, ref: 'Minister', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  dateMade: { type: Date, required: true },
  deadline: { type: Date },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'broken'], default: 'pending' },
  sourceUrl: { type: String },
  verificationUrl: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('Promise', promiseSchema);