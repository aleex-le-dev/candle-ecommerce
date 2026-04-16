import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, default: '' },
  details:     { type: String, default: '' },
  variables:   [{ name: String, value: String }],
  image:       { type: String, default: '' },
  gallery:     [String],
  stock:       { type: Number, default: 0 },
  featured:    { type: Boolean, default: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

export default mongoose.models.Product ?? mongoose.model('Product', ProductSchema);
