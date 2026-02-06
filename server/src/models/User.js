import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // Optional for Google users
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
}, { timestamps: true });

userSchema.methods.comparePassword = async function(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', userSchema);