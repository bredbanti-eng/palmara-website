"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

export default function PaymentButton({ reportId, name, onPaid }) {
  const { tr } = useLang();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInRupees: 99, receiptId: reportId }),
      });
      const { order, keyId } = await orderRes.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);

      script.onload = () => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Palmara",
          order_id: order.id,
          prefill: { name },
          theme: { color: "#7A1220" },
          handler: async function (response) {
            const verifyRes = await fetch("/api/payment/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, reportId }),
            });
            const result = await verifyRes.json();
            if (result.verified) {
              onPaid();
            }
            setLoading(false);
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        });
        rzp.open();
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <button className="btn-primary" onClick={handlePay} disabled={loading}>
      {tr("unlock_button")}
    </button>
  );
}
