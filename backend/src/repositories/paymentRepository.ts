import { BaseRepository } from './baseRepository';
import Payment from '../models/Payment';
import { IPayment } from '../interfaces/models';

class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(Payment);
  }

  async findByPaymentId(razorpay_payment_id: string): Promise<IPayment | null> {
    return this.findOne({ razorpay_payment_id });
  }

  async findByOrderId(order_id: string): Promise<IPayment[]> {
    return this.findAll({ order_id });
  }
}

export default new PaymentRepository();
