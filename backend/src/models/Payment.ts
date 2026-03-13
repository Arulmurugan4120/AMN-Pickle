import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../interfaces/models';

const paymentSchema = new Schema<IPayment>({
  order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  razorpay_payment_id: { type: String, required: true, unique: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['captured', 'failed', 'pending'], 
    default: 'pending' 
  },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model<IPayment>('Payment', paymentSchema);
