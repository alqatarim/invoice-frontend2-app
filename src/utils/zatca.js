import dayjs from 'dayjs';
import { formatCurrencyAmount, formatDecimal } from '@/utils/numberUtils';

function toBase64(value) {
  if (typeof window === 'undefined') return '';
  return window.btoa(unescape(encodeURIComponent(value)));
}

function utf8ToBytes(value) {
  const encoded = unescape(encodeURIComponent(value));
  const bytes = [];

  for (let index = 0; index < encoded.length; index += 1) {
    bytes.push(encoded.charCodeAt(index));
  }

  return bytes;
}

function encodeTLV(tag, value) {
  const bytes = utf8ToBytes(value);
  return [tag, bytes.length, ...bytes];
}

export function buildZatcaPayload(sellerName, vatNumber, timestamp, total, vatTotal) {
  const bytes = [
    ...encodeTLV(1, sellerName),
    ...encodeTLV(2, vatNumber),
    ...encodeTLV(3, timestamp),
    ...encodeTLV(4, total),
    ...encodeTLV(5, vatTotal),
  ];

  return toBase64(String.fromCharCode(...bytes));
}

export function buildInvoiceReceiptText({
  invoiceNumber,
  timestamp,
  sellerName,
  sellerAddress,
  vatNumber,
  buyerName,
  buyerVat,
  buyerAddress,
  currencySymbol,
  subtotal,
  discount,
  vatTotal,
  total,
}) {
  const fallback = 'N/A';
  const formattedTimestamp = timestamp
    ? dayjs(timestamp).format('YYYY/MM/DD HH:mm')
    : dayjs().format('YYYY/MM/DD HH:mm');

  const qrPayload = buildZatcaPayload(
    sellerName || 'Company',
    vatNumber || fallback,
    timestamp || new Date().toISOString(),
    formatDecimal(total),
    formatDecimal(vatTotal)
  );

  return {
    qrPayload,
    receiptText: [
      'SIMPLIFIED TAX INVOICE',
      '',
      `Invoice No: ${invoiceNumber || fallback}`,
      `Date & Time: ${formattedTimestamp}`,
      '',
      `Seller: ${sellerName || 'Company'}`,
      `Seller Address: ${sellerAddress || fallback}`,
      `Seller VAT: ${vatNumber || fallback}`,
      '',
      `Buyer: ${buyerName || fallback}`,
      `Buyer VAT: ${buyerVat || fallback}`,
      `Buyer Address: ${buyerAddress || fallback}`,
      '',
      `Subtotal: ${formatCurrencyAmount(currencySymbol, subtotal)}`,
      `Discount: ${formatCurrencyAmount(currencySymbol, discount)}`,
      `VAT: ${formatCurrencyAmount(currencySymbol, vatTotal)}`,
      `Total: ${formatCurrencyAmount(currencySymbol, total)}`,
      '',
      'QR Payload (Base64):',
      qrPayload,
    ].join('\n'),
  };
}
