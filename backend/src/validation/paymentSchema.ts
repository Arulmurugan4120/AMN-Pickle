import { z } from 'zod';

/**
 * Payment Validation Schemas
 * Strict type checking for incoming payment verification and webhook requests.
 */
export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1, 'Razorpay Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay Signature is required'),
  amount: z.number().positive('Amount is required'),
});
