import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// Durable backup to /api/verify-payment: Razorpay calls this directly from
// its own servers, so a report still gets marked paid even if the visitor
// closes the tab right after paying, before the client-side call finishes.
// Point this at https://yourdomain.com/api/payment/webhook in the Razorpay
// dashboard (Settings -> Webhooks) and select at least the
// "payment.captured" event.
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  const valid = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const reportId = event.payload?.payment?.entity?.notes?.reportId;
    if (reportId) {
      const db = supabaseAdmin();
      const { error } = await db.from('reports').update({ paid: true }).eq('id', reportId);
      if (error) console.error('webhook: failed to mark report paid', error);
    }
  }

  return NextResponse.json({ ok: true });
}
