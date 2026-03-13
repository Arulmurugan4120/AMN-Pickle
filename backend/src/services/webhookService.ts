import crypto from 'crypto';
import paymentService from './paymentService';
import { env } from '../config/env';

/**
 * Webhook Service (Fintech Modular Layer)
 * Handles Razorpay webhook events with signature verification and idempotency.
 */
class WebhookService {
  /**
   * Verified and routes webhooks to the appropriate logic.
   */
  async handleWebhook(payload: any, signature: string, logger: any) {
    // 1. Signature Verification
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    const digest = hmac.digest('hex');

    if (signature !== digest) {
      logger.error('Webhook signature mismatch', { signature, digest });
      throw new Error('Invalid webhook signature');
    }

    const { event, payload: eventPayload } = payload;
    logger.info(`Processing fintech webhook event: ${event}`, { event_id: payload.id });

    // 2. Event Routing
    switch (event) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = eventPayload.payment?.entity || eventPayload.order?.entity;
        const razorpay_order_id = paymentEntity.order_id || paymentEntity.id;
        
        await paymentService.processPaymentVerification({
          razorpay_order_id,
          razorpay_payment_id: paymentEntity.id || eventPayload.payment.entity.id,
          razorpay_signature: signature, // For webhooks, the signature is the header itself
          amount: paymentEntity.amount,
        }, logger);
        break;
      }
      
      case 'payment.failed': {
        const razorpay_order_id = eventPayload.payment.entity.order_id;
        await paymentService.handleFailedPayment(razorpay_order_id, logger);
        break;
      }

      default:
        logger.info(`Ignoring non-critical webhook event: ${event}`);
    }

    return { status: 'acknowledged' };
  }
}

export default new WebhookService();
