import { Request, Response, NextFunction } from 'express';
import paymentService from '../services/paymentService';
import { paymentVerifySchema } from '../validation/paymentSchema';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Fintech Payment Controller
 * Thin layer delegating to PaymentService with injected logging.
 */
class PaymentController {
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    const logger = (req as any).logger;
    try {
      logger.info('Initiating client-side payment verification');
      
      const validatedData = paymentVerifySchema.parse(req.body);

      const payment = await paymentService.processPaymentVerification(
        validatedData,
        logger
      );

      return ApiResponse.success(res, 'Payment verified successfully', payment);
    } catch (error: any) {
      logger.error('Payment verification failed in controller', { error: error.message });
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    const logger = (req as any).logger;
    const signature = req.headers['x-razorpay-signature'] as string;

    try {
      const webhookService = (await import('../services/webhookService')).default;
      const result = await webhookService.handleWebhook(req.body, signature, logger);
      
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Webhook processing failed in controller', { error: error.message });
      // Returning 200 to acknowledge receipt even if processing fails internally to prevent retries if signature was valid
      return res.status(200).json({ status: 'error', message: 'Webhook processing failed' });
    }
  }
}

export default new PaymentController();
