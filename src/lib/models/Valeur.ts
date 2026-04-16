import mongoose, { Schema } from 'mongoose';

const ValeurSchema = new Schema({
  icon:  { type: String, default: '' },
  title: { type: String, required: true },
  desc:  { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

export default mongoose.models.Valeur ?? mongoose.model('Valeur', ValeurSchema);
