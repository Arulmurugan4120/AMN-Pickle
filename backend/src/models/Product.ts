import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/models';

const productSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  weight: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  stock: { type: Number, required: true, default: 50, min: 0 },
  category: { type: String, required: true, default: 'pickle' },
  isActive: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IProduct>('Product', productSchema);
