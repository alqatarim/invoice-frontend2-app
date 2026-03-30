import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPdf({
  element,
  fileName,
  format = 'a4',
  orientation = 'portrait',
  unit = 'mm',
  imageWidth = 210,
  pageHeight = 297,
  scale = 2,
  backgroundColor = '#ffffff',
}) {
  if (!element) {
    throw new Error('Unable to find the document preview');
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
  });

  const imgData = canvas.toDataURL('image/png');
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  const pdf = new jsPDF({
    orientation,
    unit,
    format,
  });

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imageWidth, imageHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imageWidth, imageHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}

export function exportTextToPdf({
  text,
  fileName,
  format = [80, 160],
  orientation = 'portrait',
  unit = 'mm',
  fontSize = 8,
  textWidth = 68,
  startX = 6,
  startY = 10,
}) {
  const pdf = new jsPDF({
    orientation,
    unit,
    format,
  });

  const lines = pdf.splitTextToSize(text, textWidth);
  pdf.setFontSize(fontSize);
  pdf.text(lines, startX, startY);
  pdf.save(fileName);
}
