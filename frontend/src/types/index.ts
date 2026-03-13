export interface IProduct {
  id: string;
  name: string;
  price: number;
  weight: string;
  description: string;
  image?: string;
  stock?: number;
  category?: string;
  isActive?: boolean;
}

export interface ICartItem extends IProduct {
  quantity: number;
}

export interface IOrder {
  order: any;
  razorpay_order_id: string;
  key_id: string;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
