import axios, { AxiosInstance } from 'axios';
import { IProduct, IOrder, IApiResponse } from '../types';

/**
 * Enterprise API Client Configuration
 * - Request interceptor: Always attaches the latest JWT token from localStorage
 * - Response interceptor: Standardized error handling with auto-logout on 401
 */
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor — Always sends the latest JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — Standardized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    console.error(`[API Error]: ${message}`, error);
    
    // Auto-logout on 401 (expired token)
    if (error.response?.status === 401 && window.location.pathname !== '/welcome') {
      const isAuthError = message.includes('token') || message.includes('Access denied');
      if (isAuthError) {
        localStorage.removeItem('token');
        window.location.href = '/welcome';
      }
    }
    
    return Promise.reject(error);
  }
);

export const ProductService = {
  getProducts: () => api.get<IApiResponse<{ count: number; products: IProduct[] }>>('/products'),
};

export const OrderService = {
  createOrder: (orderData: { items: any[]; total_amount: number }) => 
    api.post<IApiResponse<IOrder>>('/orders', orderData),
  
  getOrderStatus: (orderId: string) => 
    api.get<IApiResponse<{ payment_status: string }>>(`/orders/${orderId}/status`),
};

export const PaymentService = {
  verifyPayment: (paymentData: any) => 
    api.post<IApiResponse<any>>('/payments/verify', paymentData),
};

export default api;
