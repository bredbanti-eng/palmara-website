// Client-only: builds the branded, downloadable PDF for an unlocked
// reading. Imported dynamically from ReadingResult so jsPDF never ends up
// in a server bundle.

const BG = [15, 11, 26]; // --bg
const ACCENT = [180, 140, 255]; // --accent
const TEXT = [243, 240, 250]; // --text
const MUTED = [168, 159, 194]; // --muted

const CONTACT_EMAIL = 'hello@palmara.in';

function addPage(doc) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...BG);
  doc.rect(0, 0, w, h, 'F');
  return { w, h };
}

export async function generateReportPdf({
  brandName,
  name,
  reportForLabel,
  handLabel,
  yourHandLabel,
  teaser,
  fullText,
  honesty,
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 56;
  let { w, h } = addPage(doc);
  let y = margin;

  const contentWidth = w - margin * 2;

  // Brand strip
  doc.setTextColor(...ACCENT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(brandName, margin, y);
  if (name) {
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${reportForLabel} ${name}`, w - margin, y, { align: 'right' });
  }
  y += 34;

  // Hand shape heading
  doc.setTextColor(...TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${yourHandLabel} ${handLabel}`, margin, y);
  y += 26;

  const writeParagraph = (text, { fontSize = 12, color = TEXT, lineGap = 6, bold = false } = {}) => {
    doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y > h - margin) {
        doc.addPage();
        ({ w, h } = addPage(doc));
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize + lineGap;
    }
    y += 10;
  };

  writeParagraph(teaser, { fontSize: 12, color: MUTED });
  writeParagraph(fullText, { fontSize: 12, color: TEXT });

  // Footer honesty note + contact
  y += 10;
  writeParagraph(honesty, { fontSize: 9, color: MUTED, lineGap: 4 });
  writeParagraph(CONTACT_EMAIL, { fontSize: 9, color: ACCENT, lineGap: 4 });

  return doc;
}

export function downloadPdf(doc, filename) {
  doc.save(filename);
}
