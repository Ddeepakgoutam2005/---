import mongoose from 'mongoose';

const promiseRelatedNewsSchema = new mongoose.Schema({
  minister: { type: mongoose.Schema.Types.ObjectId, ref: 'Minister' },
  promise: { type: mongoose.Schema.Types.ObjectId, ref: 'Promise' },
  newsUpdate: { type: mongoose.Schema.Types.ObjectId, ref: 'NewsUpdate' },
  headline: { type: String, required: true },
  summary: { type: String },
  source: { type: String },
  url: { type: String, required: true },
  classification: { type: String, default: 'critic' },
  confidence: { type: Number, default: 0 },
  publishedAt: { type: Date },
}, { timestamps: true });

promiseRelatedNewsSchema.index({ url: 1 }, { unique: true });

export default mongoose.model('PromiseRelatedNews', promiseRelatedNewsSchema);