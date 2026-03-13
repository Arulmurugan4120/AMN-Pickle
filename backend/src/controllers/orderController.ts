import { Request, Response, NextFunction } from 'express';
import orderService from '../services/orderService';
import { orderCreateSchema } from '../validation/orderSchema';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Fintech Order Controller
 * Thin layer delegating to OrderService with context-aware logging.
 */
class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    const logger = (req as any).logger;
    try {
      logger.info('Received create order request');
      
      const validatedData = orderCreateSchema.parse(req.body);

      const { order, razorpay_order_id } = await orderService.createOrder(
        validatedData.items,
        validatedData.total_amount,
        logger
      );

      return ApiResponse.success(res, 'Order created successfully', {
        order,
        razorpay_order_id,
        key_id: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error: any) {
      logger.error('Order creation failed in controller', { error: error.message });
      
      // Detect Razorpay credential errors specifically
      if (error.statusCode === 401 || error.message?.includes('unauthorized') || error.message?.includes('Authentication')) {
        return res.status(502).json({
          success: false,
          message: 'Payment gateway authentication failed. Please check your Razorpay API keys in the .env file.',
        });
      }
      
      next(error);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    const logger = (req as any).logger;
    try {
      const order = await orderService.getOrder(req.params.id);
      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }
      return ApiResponse.success(res, 'Order retrieved successfully', order);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new OrderController();
