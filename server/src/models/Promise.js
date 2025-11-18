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
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.status === 'in_progress') ret.status = 'completed';
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret.status === 'in_progress') ret.status = 'completed';
      return ret;
    }
  }
});

export default mongoose.model('Promise', promiseSchema);