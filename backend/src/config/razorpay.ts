import Razorpay from 'razorpay';

/**
 * Razorpay SDK Configuration
 * Credentials are validated at startup via env.ts
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export default razorpay;
