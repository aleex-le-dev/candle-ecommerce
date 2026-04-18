import mongoose, { Schema } from 'mongoose';

const PromoSchema = new Schema({
  code:      { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:      { type: String, enum: ['percent', 'fixed', 'shipping'], required: true },
  value:     { type: Number, default: 0 },
  minOrder:  { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
  isPublic:  { type: Boolean, default: false },
  expiresAt: { type: Date },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

delete (mongoose.models as any).Promo;
export default mongoose.model('Promo', PromoSchema);
