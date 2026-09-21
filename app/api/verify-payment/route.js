import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { UNLOCK_DELIMITER } from '../../../lib/anthropic';

// Client-side confirmation path: Razorpay's checkout handler calls this
// right after a successful payment so we can unlock immediately in the UI.
// app/api/payment/webhook/route.js is the durable, idempotent backup in
// case the visitor closes the tab before this call completes.
export async function POST(req) {
  try {
    const { reportId, orderId, paymentId, signature } = await req.json();
    if (!reportId || !orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const db = supabaseAdmin();
    const { data: row, error } = await db
      .from('reports')
      .update({ paid: true })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    const [, full] = row.report_text.split(UNLOCK_DELIMITER).map((s) => s?.trim());

    return NextResponse.json({ full: full || row.report_text });
  } catch (err) {
    console.error('verify-payment error', err);
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 500 });
  }
}
