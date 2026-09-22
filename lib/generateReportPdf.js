import { jsPDF } from "jspdf";

function buildDoc({ brand, tagline, name, reportText, lang }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  const maroon = [122, 18, 32];
  const gold = [184, 134, 11];
  const ink = [43, 27, 18];

  doc.setFillColor(...maroon);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(255, 245, 225);
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text(brand, margin, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...gold.map((c) => Math.min(255, c + 60)));
  doc.text(tagline, margin, 70);

  doc.setTextColor(...ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(name || "", margin, 130);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  const lines = doc.splitTextToSize(reportText || "", pageWidth - margin * 2);
  doc.text(lines, margin, 160, { lineHeightFactor: 1.5 });

  doc.setFontSize(9);
  doc.setTextColor(120, 110, 95);
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.text(
    lang === "hi"
      ? "यह रीडिंग चिंतन और मनोरंजन के लिए है, वैज्ञानिक सलाह नहीं।"
      : "This reading is for reflection and entertainment, not scientific advice.",
    margin,
    footerY
  );

  return doc;
}

// Triggers an immediate browser download (used right after payment / on the
// manual re-download button).
export function generateReportPdf(params) {
  const doc = buildDoc(params);
  doc.save(`${params.brand}-reading.pdf`);
}

// Returns the same PDF as a base64 string, for attaching to the confirmation
// email — no duplicated layout logic, same document either way.
export function generateReportPdfBase64(params) {
  const doc = buildDoc(params);
  return doc.output("base64");
}
