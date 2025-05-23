/**
 * Format an invoice item for display
 * @param {Object} product - The product
 * @returns {Object} Formatted item with calculated values
 */
export function formatInvoiceItem(product) {
  if (!product) return null;
  let discountX;
  if ((product.discountType) === 2 || (product.discountType) === "2") {
    discountX = (Number(product.sellingPrice) * (Number(product.discountValue) / 100));
  } else {
    discountX = (Number(product.discountValue)).toFixed(2);
  }
  const taxableAmount = Number(product.sellingPrice) - discountX;
  const tax = (taxableAmount * ((product.tax?.taxRate || 0)) / 100);
  const amount = (taxableAmount + tax).toFixed(2);
  return {
    productId: product._id,
    name: product.name,
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
    form_updated_discount: Number(product.discountValue).toFixed(2),
    form_updated_rate: Number(product.sellingPrice).toFixed(2),
    form_updated_tax: Number(product.tax?.taxRate || 0).toFixed(2)
  };
}