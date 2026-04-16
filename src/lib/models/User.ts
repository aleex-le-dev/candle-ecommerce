import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  telephone: { type: String, default: '' },
  adresse:   { type: String, default: '' },
  cp:        { type: String, default: '' },
  ville:     { type: String, default: '' },
  pays:      { type: String, default: 'France' },
}, { timestamps: true });

export default mongoose.models.User ?? mongoose.model('User', UserSchema);
