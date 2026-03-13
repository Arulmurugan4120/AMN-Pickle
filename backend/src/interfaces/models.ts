import mongoose, { Document } from 'mongoose';

export interface IProduct {
  id: string;
  name: string;
  price: number;
  weight: string;
  description: string;
  image: string;
  stock: number;
  category: string;
  isActive: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface IOrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  total_amount: number;
  order_status: 'pending' | 'completed' | 'failed';
  payment_status: 'pending' | 'paid' | 'failed';
  razorpay_order_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface IPayment extends Document {
  order_id: mongoose.Types.ObjectId;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
  status: 'captured' | 'failed' | 'pending';
  created_at: Date;
  updated_at: Date;
}
