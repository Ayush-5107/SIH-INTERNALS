import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export interface PrintUnitItem {
  packet_code: string;
  batch_id: string;
  inner_credential?: string;
}

/**
 * Robust helper to obtain jsPDF instance in Next.js Webpack bundler environment
 */
function createJsPdfDocument(options: any) {
  let DocConstructor: any = jsPDF;
  if (typeof DocConstructor !== 'function' && (jsPDF as any).default) {
    DocConstructor = (jsPDF as any).default;
  }
  if (typeof DocConstructor !== 'function') {
    throw new Error('jsPDF constructor not found in runtime environment');
  }
  return new DocConstructor(options);
}

/**
 * Robust QR Code Base64 Data URL fetcher with dual fallback
 */
async function fetchQrBase64(qrPayloadUrl: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(qrPayloadUrl, {
      margin: 1,
      width: 250,
      color: { dark: '#000000', light: '#ffffff' },
    });
    if (dataUrl && dataUrl.startsWith('data:image/')) return dataUrl;
  } catch {
    // fallback
  }

  try {
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayloadUrl)}`;
    const res = await fetch(apiUrl);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed to read QR blob'));
      reader.readAsDataURL(blob);
    });
  } catch {
    throw new Error('Failed to generate or fetch QR code image');
  }
}

/**
 * GENERATE BATCH PACKET LABEL PDF MATCHING FACTORY LASER PRINT SHEET SPECIFICATION
 * 
 * CORE ARCHITECTURAL RULE:
 * ONE BATCH -> ONE BATCH QR IMAGE (REUSED FOR ALL LABELS)
 * EACH ITEM -> UNIQUE PACKET CODE (7KQ-000001 ... 7KQ-00000N)
 */
export async function generateBatchPdf(
  batchId: string,
  units: PrintUnitItem[],
  traceUrl?: string
): Promise<void> {
  if (!units || units.length === 0) {
    throw new Error('No unit packet codes available to generate PDF');
  }

  const doc = createJsPdfDocument({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  const marginX = 8; // 8mm left/right margin
  const marginY = 8; // 8mm top margin
  const cols = 3;
  const colGap = 3.5; // 3.5mm gap between columns
  const rowGap = 3.5; // 3.5mm gap between rows

  const cardWidth = (pageWidth - marginX * 2 - colGap * (cols - 1)) / cols; // ~62.3mm
  const cardHeight = 25.5; // 25.5mm height per card

  // 1. DRAW DARK TOP HEADER BANNER ON PAGE 1 (MATCHING REFERENCE DESIGN)
  const headerHeight = 10; // 10mm top dark bar
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`FoodTrace Factory Laser Print Sheet (${units.length} Labels)`, marginX, 6.8);

  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129); // Green #10b981
  doc.text(`Batch: ${batchId}`, pageWidth - marginX - 38, 6.8);

  // 2. GENERATE THE ONE SINGLE BATCH QR CODE IMAGE ONCE AT TOP LEVEL
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const batchQrDataPayload = traceUrl || `${originUrl}/track?id=${encodeURIComponent(batchId)}`;
  
  // ONE BATCH -> ONE BATCH QR DATA URL
  const singleBatchQrDataUrl = await fetchQrBase64(batchQrDataPayload);

  // Calculate layout grid parameters
  const firstPageTopMargin = headerHeight + 5; // 15mm on page 1
  const normalTopMargin = marginY; // 8mm on page 2+

  const rowsPage1 = Math.floor((pageHeight - firstPageTopMargin - marginY + rowGap) / (cardHeight + rowGap)); // ~9 rows
  const rowsNormalPage = Math.floor((pageHeight - marginY * 2 + rowGap) / (cardHeight + rowGap)); // ~9 rows

  let currentCard = 0;
  let pageNumber = 1;

  // 3. ITERATE THROUGH ALL UNITS REUSING THE SAME SINGLE BATCH QR CODE IMAGE
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];

    // Page overflow logic
    if (pageNumber === 1 && currentCard >= cols * rowsPage1) {
      doc.addPage();
      pageNumber++;
      currentCard = 0;
    } else if (pageNumber > 1 && currentCard >= cols * rowsNormalPage) {
      doc.addPage();
      pageNumber++;
      currentCard = 0;
    }

    const currentTopMargin = pageNumber === 1 ? firstPageTopMargin : normalTopMargin;
    const colIndex = currentCard % cols;
    const rowIndex = Math.floor(currentCard / cols);

    const x = marginX + colIndex * (cardWidth + colGap);
    const y = currentTopMargin + rowIndex * (cardHeight + rowGap);

    // Card Container Dashed Border Box
    doc.setDrawColor(160, 174, 192); // #a0aec0
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(x, y, cardWidth, cardHeight);
    doc.setLineDashPattern([], 0); // reset to solid line

    // Header Line (FOODTRACE DUAL-QR | GS1 COMPLIANT)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text('FOODTRACE DUAL-QR', x + 2, y + 3.8);

    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text('GS1 COMPLIANT', x + cardWidth - 18, y + 3.8);

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 2, y + 4.8, x + cardWidth - 2, y + 4.8);

    // REUSE THE SAME SINGLE BATCH QR CODE IMAGE FOR EVERY LABEL IN THE BATCH
    const qrSize = 16.5; // 16.5mm x 16.5mm
    const qrX = x + 2;
    const qrY = y + 6.2;
    doc.addImage(singleBatchQrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Unique Packet Code Details (Right of QR)
    const textX = x + qrSize + 3.5;

    // 1. Unique Packet Code (e.g. 7KQ-000001)
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const codeStr = String(unit.packet_code || `UNIT-${i + 1}`);
    doc.text(codeStr, textX, y + 9.5);

    // 2. Batch ID Reference (Same for all labels)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    const batchText = `Batch: ${batchId}`;
    doc.text(batchText.length > 25 ? batchText.slice(0, 23) + '…' : batchText, textX, y + 13.5);

    // 3. Inner Credential / Scratch Key
    const scratchKey = String(unit.inner_credential || 'SEC-2954-A');
    doc.setFont('courier', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(21, 128, 61); // Green #15803d
    doc.text(`SCRATCH KEY: ${scratchKey}`, textX, y + 17.5);

    currentCard++;
  }

  // Defensive check: verify total pages > 0
  if (doc.getNumberOfPages() === 0) {
    throw new Error('PDF generation produced 0 pages');
  }

  // Directly save/download PDF file
  doc.save(`BATCH-${batchId}-QR-CODES.pdf`);
}
