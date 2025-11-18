import mongoose from 'mongoose';

const newsUpdateSchema = new mongoose.Schema({
  promise: { type: mongoose.Schema.Types.ObjectId, ref: 'Promise', required: false },
  headline: { type: String, required: true },
  summary: { type: String },
  source: { type: String },
  url: { type: String },
  sentiment: { type: String },
  relevanceScore: { type: Number },
  publishedAt: { type: Date },
  isPromiseCandidate: { type: Boolean, default: false },
  promiseScore: { type: Number, default: 0 },
  candidateLog: { type: String },
  candidateMinister: { type: mongoose.Schema.Types.ObjectId, ref: 'Minister', required: false },
}, { timestamps: true });

newsUpdateSchema.index({ url: 1 }, { unique: true });

export default mongoose.model('NewsUpdate', newsUpdateSchema);