import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabaseClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      reportId,
    } = body;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expected === razorpay_signature;

    if (verified) {
      await getSupabase().from("reports").update({ paid: true }).eq("id", reportId);
    }

    return NextResponse.json({ verified });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ verified: false, error: "Verification failed" }, { status: 500 });
  }
}
