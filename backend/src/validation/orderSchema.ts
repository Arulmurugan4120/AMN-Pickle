import { z } from 'zod';

/**
 * Order Validation Schemas
 * Strict type checking for incoming order requests.
 */
export const orderCreateSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().min(1, 'Product ID is required'),
    name: z.string().min(1, 'Product name is required'),
    quantity: z.number().int().positive('Quantity must be at least 1'),
    price: z.number().positive('Price must be positive'),
  })).min(1, 'At least one item is required'),
  total_amount: z.number().positive('Total amount must be positive'),
});
