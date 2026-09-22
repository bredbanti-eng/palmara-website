import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    const { amountInRupees, receiptId } = await request.json();
    if (!amountInRupees || !receiptId) {
      return NextResponse.json({ error: "Missing amountInRupees or receiptId" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: "INR",
      receipt: receiptId,
      notes: { reportId: receiptId },
    });

    await getSupabase().from("reports").update({ razorpay_order_id: order.id }).eq("id", receiptId);

    return NextResponse.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create payment order" }, { status: 500 });
  }
}
