import express from 'express';
import productController from '../controllers/productController';
import orderController from '../controllers/orderController';
import paymentController from '../controllers/paymentController';
import authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminAuth';
import { uploadProductImage } from '../middleware/upload';

const router = express.Router();

// --- Health Check ---
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'up', 
    timestamp: new Date().toISOString(),
    service: 'pickle-store-fintech'
  });
});

// --- Auth Routes (Public) ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', authMiddleware, authController.getProfile);

// --- Product Routes (Public) ---
router.get('/products', productController.getProducts);

// --- Admin Product Routes (Protected) ---
router.get('/admin/products', authMiddleware, adminMiddleware, productController.getAllProducts);
router.post('/admin/products', authMiddleware, adminMiddleware, uploadProductImage, productController.createProduct);
router.put('/admin/products/:id', authMiddleware, adminMiddleware, uploadProductImage, productController.updateProduct);
router.delete('/admin/products/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

// --- Order Routes (Protected) ---
router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders/:id', authMiddleware, orderController.getOrder);

// --- Payment Routes (Protected) ---
router.post('/payments/verify', authMiddleware, paymentController.verifyPayment);

// --- Webhook Route (Public) ---
router.post('/webhooks/razorpay', paymentController.handleWebhook);

export default router;
