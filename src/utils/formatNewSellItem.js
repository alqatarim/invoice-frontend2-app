/**
 * Format an invoice item for display
 * @param {Object} product - The product
 * @returns {Object} Formatted item with calculated values
 */
export function formatInvoiceItem(product) {
  if (!product) return null;
  const rate = Number(product.sellingPrice || 0);
  const discountTypeRaw = product.discountType;
  const isPercentDiscount = discountTypeRaw === 2 || discountTypeRaw === '2';

  const parsedDiscountValue = Number(product.discountValue || 0);
  const discountValue = Number.isFinite(parsedDiscountValue) ? parsedDiscountValue : 0;

  const discountX = isPercentDiscount
    ? (rate * (discountValue / 100))
    : discountValue;

  const taxableAmount = rate - Number(discountX || 0);
  const tax = (taxableAmount * ((product.tax?.taxRate || 0)) / 100);
  const amount = (taxableAmount + tax).toFixed(2);
  return {
    productId: product._id,
    name: product.name,
    sku: product.sku || '',
    quantity: 1,
    units: product.units?.name,
    unit: product.units?._id,
    rate: product.sellingPrice,
    discountType: product.discountType,
    discount: discountX,
    taxableAmount: Number(taxableAmount).toFixed(2),
    amount: Number(amount).toFixed(2),
    taxInfo: product.tax,
    tax: Number(tax).toFixed(2),
    isRateFormUpadted: false,
    form_updated_discounttype: product.discountType,
    // Keep discount inputs clean: show 0 instead of 0.00 when no discount exists.
    // Also prevents leading-zero strings from showing up in the UI.
    form_updated_discount: discountValue,
    form_updated_rate: Number(product.sellingPrice).toFixed(2),
    form_updated_tax: Number(product.tax?.taxRate || 0).toFixed(2),
    images: product.images || null
  };
}