import mongoose, { Schema } from 'mongoose';

const ArticleSchema = new Schema({
  theme:    { type: String, required: true },
  title:    { type: String, required: true },
  body:     { type: String, required: true },
  image:    { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  order:    { type: Number, default: 0 },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

export default mongoose.models.Article ?? mongoose.model('Article', ArticleSchema);
