import mongoose from 'mongoose';

const ReviewQueueSchema = new mongoose.Schema({
  kind: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false },
});

export default mongoose.model('ReviewQueue', ReviewQueueSchema);