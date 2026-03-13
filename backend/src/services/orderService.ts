import mongoose from 'mongoose';
import razorpay from '../config/razorpay';
import orderRepository from '../repositories/orderRepository';
import { IOrderItem } from '../interfaces/models';

/**
 * Order Service (Fintech Modular Layer)
 * Handles only order orchestration and lifecycle.
 */
class OrderService {
  async createOrder(items: IOrderItem[], total_amount: number, logger: any) {
    const isDbConnected = mongoose.connection.readyState === 1;
    let session;
    
    if (isDbConnected) {
      session = await mongoose.startSession();
      session.startTransaction();
    } else {
      logger.warn('MongoDB disconnected: Bypassing database persistence for order creation.');
    }

    try {
      const options = {
        amount: Math.round(total_amount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };

      logger.info('Creating Razorpay order', { total_amount });
      const rzpOrder = await razorpay.orders.create(options);

      let order: any = {
        _id: 'mock_id_' + Date.now(),
        items,
        total_amount,
        razorpay_order_id: rzpOrder.id,
        order_status: 'pending',
        payment_status: 'pending',
      };

      if (isDbConnected && session) {
        logger.info('Persisting order to database', { rzpOrderId: rzpOrder.id });
        const dbOrder = await orderRepository.create({
          items,
          total_amount,
          razorpay_order_id: rzpOrder.id,
          order_status: 'pending',
          payment_status: 'pending',
        });
        order = dbOrder;
        await session.commitTransaction();
      }

      return { order, razorpay_order_id: rzpOrder.id };
    } catch (error: any) {
      if (isDbConnected && session) await session.abortTransaction();
      logger.error('Failed to create order', { error: error.message });
      throw error;
    } finally {
      if (isDbConnected && session) session.endSession();
    }
  }

  async getOrder(razorpay_order_id: string) {
    return await orderRepository.findByRazorpayOrderId(razorpay_order_id);
  }
}

export default new OrderService();
