import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  customer: {
    prenom:    { type: String, required: true },
    nom:       { type: String, required: true },
    email:     { type: String, required: true },
    telephone: { type: String, default: '' },
    adresse:   { type: String, required: true },
    cp:        { type: String, required: true },
    ville:     { type: String, required: true },
    pays:      { type: String, required: true },
  },
  items: [{
    _id:   { type: String, required: true },
    name:  { type: String, required: true },
    price: { type: Number, required: true },
    qty:   { type: Number, required: true },
    image: { type: String, default: '' },
  }],
  orderNumber: { type: Number, unique: true },
  userId:     { type: String, default: '' },
  subtotal:   { type: Number, required: true },
  discount:   { type: Number, default: 0 },
  shipping:   { type: Number, required: true },
  total:      { type: Number, required: true },
  promoCode:  { type: String, default: '' },
  status:     { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

export default mongoose.models.Order ?? mongoose.model('Order', OrderSchema);
