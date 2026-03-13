import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../interfaces/models';

const orderSchema = new Schema<IOrder>({
  items: [{
    product_id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  total_amount: { type: Number, required: true },
  order_status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  payment_status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  razorpay_order_id: { type: String, required: true, unique: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IOrder>('Order', orderSchema);
