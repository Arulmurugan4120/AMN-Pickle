import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import { ApiResponse } from '../utils/apiResponse';
import { z } from 'zod';

/**
 * Product Controller — Admin CRUD with Image Upload + Public Read
 */

const productCreateSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  price: z.coerce.number().min(1, 'Price must be at least ₹1'),
  weight: z.string().min(1).max(20).trim(),
  description: z.string().min(5).max(500).trim(),
  stock: z.coerce.number().min(0).default(50),
  category: z.string().min(1).max(50).default('pickle'),
});

const productUpdateSchema = productCreateSchema.partial();

class ProductController {
  /** GET /api/products — Public: Fetch all active products */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return ApiResponse.success(res, 'Products fetched (static)', { count: 0, products: [] });
      }
      const products = await Product.find({ isActive: true }).sort({ created_at: -1 });
      return ApiResponse.success(res, 'Products fetched successfully', { count: products.length, products });
    } catch (error: any) {
      next(error);
    }
  }

  /** GET /api/admin/products — Admin: Fetch ALL products */
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable.' });
      }
      const products = await Product.find().sort({ created_at: -1 });
      return ApiResponse.success(res, 'All products fetched', { count: products.length, products });
    } catch (error: any) {
      next(error);
    }
  }

  /** POST /api/admin/products — Admin: Create product (with optional image) */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable.' });
      }

      const data = productCreateSchema.parse(req.body);
      const id = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);

      // Handle uploaded image
      const image = req.file ? `/uploads/products/${req.file.filename}` : '';

      const product = await Product.create({ id, ...data, image, isActive: true });
      return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: error.errors.map((e: any) => e.message).join(', ') });
      }
      next(error);
    }
  }

  /** PUT /api/admin/products/:id — Admin: Update product (with optional image) */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable.' });
      }

      const data = productUpdateSchema.parse(req.body);
      const updateData: any = { ...data };

      // Handle new image upload
      if (req.file) {
        updateData.image = `/uploads/products/${req.file.filename}`;
      }

      const product = await Product.findOneAndUpdate(
        { id: req.params.id },
        { $set: updateData },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      return ApiResponse.success(res, 'Product updated successfully', product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: error.errors.map((e: any) => e.message).join(', ') });
      }
      next(error);
    }
  }

  /** DELETE /api/admin/products/:id — Admin: Soft-delete */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable.' });
      }

      const product = await Product.findOneAndUpdate(
        { id: req.params.id },
        { isActive: false },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      return ApiResponse.success(res, 'Product deactivated successfully', product);
    } catch (error: any) {
      next(error);
    }
  }

  /** Auto-seed initial products if database is empty */
  async seedInitialProducts() {
    try {
      if (mongoose.connection.readyState !== 1) return;
      const count = await Product.countDocuments();
      if (count === 0) {
        await Product.insertMany([
          { id: 'lemon', name: '500g Lemon Pickle', price: 100, weight: '500g', description: 'Tangy and spicy homemade lemon pickle with rock salt.', image: '', stock: 50, category: 'pickle', isActive: true },
          { id: 'mango', name: '500g Mango Pickle', price: 80, weight: '500g', description: 'Authentic raw mango pickle with traditional Indian spices.', image: '', stock: 40, category: 'pickle', isActive: true },
          { id: 'garlic', name: '500g Garlic Pickle', price: 120, weight: '500g', description: 'Hot and pungent garlic pickle made with cold-pressed mustard oil.', image: '', stock: 30, category: 'pickle', isActive: true },
          { id: 'mixed-veg', name: '500g Mixed Veg Pickle', price: 150, weight: '500g', description: 'A medley of seasonal vegetables pickled in aromatic spice blend.', image: '', stock: 20, category: 'pickle', isActive: true },
          { id: 'chili', name: '250g Green Chili Pickle', price: 60, weight: '250g', description: 'Fiery green chili pickle for those who love extra heat.', image: '', stock: 5, category: 'pickle', isActive: true },
        ]);
        console.log('Initial products seeded successfully');
      }
    } catch (error: any) {
      console.error('Failed to seed products:', error.message);
    }
  }
}

export default new ProductController();
