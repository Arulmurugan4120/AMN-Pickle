import crypto from 'crypto';
import mongoose from 'mongoose';
import paymentRepository from '../repositories/paymentRepository';
import orderRepository from '../repositories/orderRepository';
import { env } from '../config/env';

/**
 * Payment Service (Fintech Modular Layer)
 * Handles payment orchestration and verification.
 */
class PaymentService {
  /**
   * Verifies signature and processes payment idempotently.
   */
  async processPaymentVerification(
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      amount: number;
    },
    logger: any
  ) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = payload;

    const isDbConnected = mongoose.connection.readyState === 1;

    // 1. Idempotency Check: Verify if this payment ID has already been processed
    if (isDbConnected) {
      logger.info('Idempotency check for payment', { razorpay_payment_id });
      const existingPayment = await paymentRepository.findByPaymentId(razorpay_payment_id);
      if (existingPayment) {
        logger.info('Payment already processed, returning existing record', { razorpay_payment_id });
        return existingPayment;
      }
    }

    // 2. Signature verification
    const secret = env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn('Invalid payment signature', { razorpay_order_id, razorpay_payment_id });
      throw new Error('Invalid payment signature');
    }

    // 3. Database Update / Bypass
    if (!isDbConnected) {
      logger.warn('MongoDB disconnected: Payment verified securely, but bypassing database persistence.', { razorpay_payment_id });
      return { 
        _id: 'mock_payment_' + Date.now(), 
        razorpay_order_id, 
        razorpay_payment_id, 
        amount: amount / 100, 
        status: 'captured' 
      };
    }

    // Atomic Database Update (Transaction)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderRepository.findByRazorpayOrderId(razorpay_order_id);
      if (!order) {
        throw new Error('Order associated with payment not found');
      }

      const payment = await paymentRepository.create({
        order_id: order._id as any,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: amount / 100,
        status: 'captured',
      });

      await orderRepository.updateOrderStatus(razorpay_order_id, 'completed', 'paid', session);

      await session.commitTransaction();
      logger.info('Payment verified and order updated atomically', { paymentId: payment._id });
      return payment;
    } catch (error: any) {
      await session.abortTransaction();
      logger.error('Payment processing failed', { error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async handleFailedPayment(razorpay_order_id: string, logger: any) {
    if (mongoose.connection.readyState !== 1) {
      logger.warn('MongoDB disconnected: Bypassing failed payment status log.', { razorpay_order_id });
      return { status: 'failed', razorpay_order_id };
    }
    logger.warn('Recording failed payment status', { razorpay_order_id });
    return await orderRepository.updateOrderStatus(razorpay_order_id, 'failed', 'failed');
  }
}

export default new PaymentService();
