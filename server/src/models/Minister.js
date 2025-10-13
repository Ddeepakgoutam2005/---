import mongoose from 'mongoose';

const ministerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ministry: { type: String, required: true },
  portfolio: { type: String },
  photoUrl: { type: String },
  bio: { type: String },
  party: { type: String },
  constituency: { type: String },
  termStart: { type: Date },
  termEnd: { type: Date },
  socialMedia: { type: Object },
}, { timestamps: true });

export default mongoose.model('Minister', ministerSchema);