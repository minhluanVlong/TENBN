import { jsPDF } from 'jspdf';
import { Patient, PrintSettings } from '../types';

/**
 * Render a single A4 page to an offscreen high-res canvas (300 DPI)
 * guaranteeing 100% accurate Vietnamese typography and crisp green borders.
 */
function renderPageToCanvas(
  patientsOnPage: Patient[],
  settings: PrintSettings,
  pageIndex: number,
  totalPages: number
): HTMLCanvasElement {
  // A4 dimensions in mm: 210 x 297
  // Use scale of 3.7795 px/mm (~96 DPI) * 3 = ~11.33 px/mm (~288-300 DPI)
  const scale = 3; // Super crisp rendering
  const mmToPx = (mm: number) => mm * 3.7795275591 * (scale / 1);

  const canvasWidth = mmToPx(210);
  const canvasHeight = mmToPx(297);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Pure white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const marginX = mmToPx(settings.marginMm);
  const marginY = mmToPx(settings.marginMm);
  const gap = mmToPx(1.8);

  const cols = settings.gridCols;
  const rows = settings.gridRows;

  const totalCardWidth = canvasWidth - 2 * marginX;
  const totalCardHeight = canvasHeight - 2 * marginY;

  const cardWidth = (totalCardWidth - (cols - 1) * gap) / cols;
  const cardHeight = (totalCardHeight - (rows - 1) * gap) / rows;

  patientsOnPage.forEach((patient, idx) => {
    const colIndex = idx % cols;
    const rowIndex = Math.floor(idx / cols);

    const x = marginX + colIndex * (cardWidth + gap);
    const y = marginY + rowIndex * (cardHeight + gap);

    // Draw card border (Green medical)
    ctx.save();
    ctx.strokeStyle = settings.cardBorderColor || '#16a34a';
    ctx.lineWidth = scale * 1.2;

    if (settings.cardBorderStyle === 'dashed') {
      ctx.setLineDash([scale * 4, scale * 3]);
    } else if (settings.cardBorderStyle === 'dotted') {
      ctx.setLineDash([scale * 2, scale * 2]);
    } else {
      ctx.setLineDash([]);
    }

    // Rounded rectangle border
    const radius = scale * 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + cardWidth - radius, y);
    ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius);
    ctx.lineTo(x + cardWidth, y + cardHeight - radius);
    ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight);
    ctx.lineTo(x + radius, y + cardHeight);
    ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Internal Padding
    const padX = scale * 4;
    const padY = scale * 3.5;
    const innerX = x + padX;
    const innerY = y + padY;
    const innerW = cardWidth - padX * 2;
    const innerH = cardHeight - padY * 2;

    // Content:
    // Line 1: TÊN: [HỌ TÊN BỆNH NHÂN] (left) | TUỔI: [Tuổi] (right)
    // Line 2: PHÒNG: [Tên phòng sau chuẩn hoá] (prominent)

    // Base font sizes scaled
    const basePt = settings.fontSizePt || 12;
    const fontPx = basePt * scale * 1.1;

    // Line 1: TÊN BỆNH NHÂN (Dành trọn vẹn toàn bộ bề ngang dòng 1)
    const line1Y = innerY + (innerH * (rows === 8 ? 0.35 : 0.33));

    // Draw "TÊN:" label
    ctx.font = `700 ${fontPx * 0.8}px "Be Vietnam Pro", sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('TÊN:', innerX, line1Y);

    const nameLabelWidth = ctx.measureText('TÊN: ').width;
    const maxNameWidth = innerW - nameLabelWidth;
    const nameText = patient.name.toUpperCase();

    // Determine font multiplier based on nameFontScale (default large: 1.38x)
    let nameMultiplier = 1.38;
    if (settings.nameFontScale === 'xlarge') {
      nameMultiplier = 1.55;
    } else if (settings.nameFontScale === 'normal') {
      nameMultiplier = 1.18;
    }

    let nameFontPx = fontPx * nameMultiplier;
    ctx.font = `800 ${nameFontPx}px "Be Vietnam Pro", sans-serif`;
    // Tự động điều chỉnh kích cỡ để luôn hiển thị 100% ĐẦY ĐỦ TÊN BỆNH NHÂN (không cắt ngắn)
    while (ctx.measureText(nameText).width > maxNameWidth && nameFontPx > fontPx * 0.55) {
      nameFontPx -= 0.4;
      ctx.font = `800 ${nameFontPx}px "Be Vietnam Pro", sans-serif`;
    }

    ctx.font = `800 ${nameFontPx}px "Be Vietnam Pro", sans-serif`;
    ctx.fillStyle = '#046a38'; // Medical dark green / high contrast
    ctx.textAlign = 'left';
    ctx.fillText(nameText, innerX + nameLabelWidth, line1Y);

    // Line 2: PHÒNG (Bên trái) VÀ TUỔI (Bên phải cùng hàng)
    const line2Y = innerY + (innerH * (rows === 8 ? 0.77 : 0.75));

    // Bên phải: TUỔI [Số tuổi/tháng]
    const ageText = `TUỔI: ${patient.age || '—'}`;
    ctx.font = `700 ${fontPx * 0.92}px "Be Vietnam Pro", sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.fillText(ageText, innerX + innerW, line2Y);

    const ageBlockWidth = ctx.measureText(ageText).width + (scale * 3);

    // Optional: shift tag before TUỔI if enabled
    let shiftOffset = 0;
    if (settings.showShift && settings.shiftStr) {
      const shiftText = `[${settings.shiftStr}]`;
      ctx.font = `700 ${fontPx * 0.72}px "Be Vietnam Pro", sans-serif`;
      ctx.fillStyle = '#059669';
      ctx.textAlign = 'right';
      ctx.fillText(shiftText, innerX + innerW - ageBlockWidth, line2Y);
      shiftOffset = ctx.measureText(shiftText).width + (scale * 2.5);
    }

    // Bên trái: PHÒNG: [Mã phòng sau chuẩn hoá]
    ctx.font = `700 ${fontPx * 0.8}px "Be Vietnam Pro", sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'left';
    ctx.fillText('PHÒNG:', innerX, line2Y);

    const roomLabelWidth = ctx.measureText('PHÒNG: ').width;

    // Draw normalized room in large bold font
    const roomFontPx = fontPx * 1.25;
    ctx.font = `800 ${roomFontPx}px "Be Vietnam Pro", sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText(patient.normalizedRoom, innerX + roomLabelWidth, line2Y);

    // Optional: if original room display is enabled
    if (settings.showRoomOriginal && patient.rawRoom && patient.rawRoom !== patient.normalizedRoom) {
      const roomNormWidth = ctx.measureText(patient.normalizedRoom).width;
      const maxOrigWidth = innerW - ageBlockWidth - shiftOffset - roomLabelWidth - roomNormWidth - (scale * 3);
      if (maxOrigWidth > scale * 10) {
        let origText = `(${patient.rawRoom})`;
        ctx.font = `400 ${fontPx * 0.65}px "Be Vietnam Pro", sans-serif`;
        while (ctx.measureText(origText).width > maxOrigWidth && origText.length > 5) {
          origText = origText.substring(0, origText.length - 2) + '…)';
        }
        ctx.fillStyle = '#64748b';
        ctx.fillText(origText, innerX + roomLabelWidth + roomNormWidth + (scale * 2), line2Y);
      }
    }
  });

  // Footer page indicator (tiny, outside printable cut area)
  ctx.font = `400 ${scale * 3.5}px "Be Vietnam Pro", sans-serif`;
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText(`Trang ${pageIndex + 1}/${totalPages}`, canvasWidth / 2, canvasHeight - mmToPx(3));

  return canvas;
}

/**
 * Generate and download high-resolution A4 PDF
 */
export async function generateA4Pdf(
  patients: Patient[],
  settings: PrintSettings,
  fileName: string = 'The_Phat_Thuoc_A4.pdf'
): Promise<void> {
  const cardsPerPage = settings.gridCols * settings.gridRows; // 21 or 24
  const totalPages = Math.max(1, Math.ceil(patients.length / cardsPerPage));

  // Initialize jsPDF in A4 portrait (mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const startIdx = page * cardsPerPage;
    const pagePatients = patients.slice(startIdx, startIdx + cardsPerPage);

    // Render to canvas
    const canvas = renderPageToCanvas(pagePatients, settings, page, totalPages);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Place exactly on 210 x 297 mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  pdf.save(fileName);
}
