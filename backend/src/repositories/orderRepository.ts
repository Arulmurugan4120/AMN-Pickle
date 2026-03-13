import { BaseRepository } from './baseRepository';
import Order from '../models/Order';
import { IOrder } from '../interfaces/models';

class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }

  async findByRazorpayOrderId(razorpay_order_id: string): Promise<IOrder | null> {
    return this.findOne({ razorpay_order_id });
  }

  async updateOrderStatus(
    razorpay_order_id: string, 
    order_status: string, 
    payment_status: string,
    session?: any
  ): Promise<IOrder | null> {
    return this.model.findOneAndUpdate(
      { razorpay_order_id },
      { order_status, payment_status },
      { new: true, session }
    );
  }
}

export default new OrderRepository();
