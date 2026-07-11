import { jsPDF } from 'jspdf';

function loadImageAsDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not prepare QR image'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Could not load QR image'));
    img.src = src;
  });
}

export function buildQrImageUrl(menuUrl, size = 600) {
  if (typeof window !== 'undefined') {
    return `/api/qrcodes/image?size=${size}&data=${encodeURIComponent(menuUrl)}`;
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}`;
}

export async function generateQrPdf({ menuUrl, tenantName, imageSrc, filename }) {
  const imageData = await loadImageAsDataUrl(imageSrc);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const name = tenantName || 'Restaurant';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text(name, pageWidth / 2, margin + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(70, 70, 70);
  doc.text('Scan to view our menu and place your order', pageWidth / 2, margin + 18, { align: 'center' });

  const qrSize = 70;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = margin + 28;
  doc.addImage(imageData, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Scan to Order', pageWidth / 2, qrY + qrSize + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const urlLines = doc.splitTextToSize(menuUrl, pageWidth - margin * 2);
  doc.text(urlLines, pageWidth / 2, qrY + qrSize + 22, { align: 'center' });

  doc.save(filename || 'restaurant-qr-code.pdf');
}
