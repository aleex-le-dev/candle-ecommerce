import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  googleId:      { type: String, default: '' },
  emailVerified: { type: Boolean, default: false },
  verifyToken:   { type: String, default: '' },
  loginToken:    { type: String, default: '' },
  loginTokenExp: { type: Date, default: null },
  telephone:     { type: String, default: '' },
  adresse:       { type: String, default: '' },
  cp:            { type: String, default: '' },
  ville:         { type: String, default: '' },
  pays:          { type: String, default: 'France' },
}, { timestamps: true });

delete (mongoose.models as any).User;
export default mongoose.model('User', UserSchema);
