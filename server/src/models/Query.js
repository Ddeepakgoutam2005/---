import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedType: { type: String, enum: ['news', 'promise'], required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  meta: { type: Object },
}, { timestamps: true });

querySchema.index({ createdAt: -1 });

export default mongoose.model('Query', querySchema);