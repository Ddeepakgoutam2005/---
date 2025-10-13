import mongoose from 'mongoose';

const performanceMetricSchema = new mongoose.Schema({
  minister: { type: mongoose.Schema.Types.ObjectId, ref: 'Minister', required: true },
  monthYear: { type: Date },
  totalPromises: { type: Number, default: 0 },
  completedPromises: { type: Number, default: 0 },
  brokenPromises: { type: Number, default: 0 },
  completionRate: { type: Number },
  ranking: { type: Number },
  score: { type: Number },
}, { timestamps: true });

export default mongoose.model('PerformanceMetric', performanceMetricSchema);