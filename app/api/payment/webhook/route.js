import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase } from "@/lib/supabaseClient";

// Set this URL in Razorpay Dashboard -> Settings -> Webhooks, for the
// "payment.captured" event, after deploying.
export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const reportId = event.payload.payment.entity.notes?.reportId;
    if (reportId) {
      await getSupabase().from("reports").update({ paid: true }).eq("id", reportId);
    }
  }

  return NextResponse.json({ received: true });
}
