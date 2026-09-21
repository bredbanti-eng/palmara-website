import Razorpay from 'razorpay';

let client = null;

export function razorpayClient() {
  if (!client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set');
    }
    client = new Razorpay({ key_id, key_secret });
  }
  return client;
}
