// Sends the report via Resend (3,000 free emails/month, permanent free tier).
// Get RESEND_API_KEY from https://resend.com/api-keys after verifying a
// sending domain (e.g. hello@palmara.in) in their dashboard.
export async function sendReportEmail({ to, name, lang, reportId, teaserText, pdfBase64 }) {
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://palmara.in"}/report/${reportId}`;

  const subjectLine =
    lang === "hi" ? "आपकी पालमारा रीडिंग तैयार है" : "Your Palmara reading is ready";

  const bodyHtml =
    lang === "hi"
      ? `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background:#591019; padding:24px; text-align:center;">
            <h1 style="color:#FBF1DC; font-family: Georgia, serif; margin:0;">पालमारा</h1>
          </div>
          <div style="padding:24px; color:#2B1B12;">
            <p>नमस्ते ${name || ""},</p>
            <p>आपकी पूरी रीडिंग तैयार है। इसे नीचे दिए गए लिंक पर देखें, या साथ में भेजी गई PDF डाउनलोड करें।</p>
            <p><a href="${reportUrl}" style="background:#7A1220; color:#FBF1DC; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block;">मेरी रीडिंग देखें</a></p>
          </div>
        </div>`
      : `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background:#591019; padding:24px; text-align:center;">
            <h1 style="color:#FBF1DC; font-family: Georgia, serif; margin:0;">Palmara</h1>
          </div>
          <div style="padding:24px; color:#2B1B12;">
            <p>Hi ${name || ""},</p>
            <p>Your full reading is ready. View it anytime at the link below, or download the attached PDF.</p>
            <p><a href="${reportUrl}" style="background:#7A1220; color:#FBF1DC; padding:12px 24px; text-decoration:none; border-radius:4px; display:inline-block;">View My Reading</a></p>
          </div>
        </div>`;

  const payload = {
    from: "Palmara <hello@palmara.in>",
    to: [to],
    subject: subjectLine,
    html: bodyHtml,
  };

  if (pdfBase64) {
    payload.attachments = [
      {
        filename: "Palmara-reading.pdf",
        content: pdfBase64,
      },
    ];
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Resend send failed:", errText);
    return { sent: false };
  }

  return { sent: true };
}
