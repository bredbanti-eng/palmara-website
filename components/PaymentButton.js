'use client';

import { useState } from 'react';

const AMOUNT_INR = 49;

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

export default function PaymentButton({ reportId, onUnlocked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setLoading(true);
    setError('');
    try {
      await loadRazorpayScript();

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, amount: AMOUNT_INR * 100 }),
      });
      if (!orderRes.ok) throw new Error('create-order failed');
      const order = await orderRes.json();

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Palmara',
        description: 'Unlock full palm reading',
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reportId,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            if (!verifyRes.ok) throw new Error('verify failed');
            const { full } = await verifyRes.json();
            onUnlocked(full);
          } catch (err) {
            console.error(err);
            setError(
              'Payment succeeded but unlocking failed — refresh and contact us with your payment ID.'
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: '#5b3a9b' },
      });

      rzp.on('payment.failed', () => {
        setError('Payment failed — please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setError('Could not start payment — please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={pay} disabled={loading} className="pay-button">
        {loading ? 'Opening checkout...' : `Unlock full reading — ₹${AMOUNT_INR}`}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
