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
}, { timestamps: true });

newsUpdateSchema.index({ url: 1 }, { unique: true });

export default mongoose.model('NewsUpdate', newsUpdateSchema);