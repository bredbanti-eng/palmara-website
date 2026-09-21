import { NextResponse } from 'next/server';
import { razorpayClient } from '../../../lib/razorpayClient';

export async function POST(req) {
    try {
          const { reportId, amount } = await req.json();

      if (!reportId || !Number.isFinite(amount) || amount <= 0) {
              return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
      }

      const razorpay = razorpayClient();
          const order = await razorpay.orders.create({
                  amount, // amount in paise, e.g. 9900 for INR 99
                  currency: 'INR',
                  receipt: `report_${reportId}`,
                  notes: { reportId },
          });

      return NextResponse.json({
              orderId: order.id,
              amount: order.amount,
              currency: order.currency,
              keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
          console.error('create-order error', err);
          return NextResponse.json({ error: 'Could not create order' }, { status: 500 });
    }
}
