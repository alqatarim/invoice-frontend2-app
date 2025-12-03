/**
 * Calculate values for a single invoice item
 * @param {Object} item - The invoice item
 * @returns {Object} Calculated values for the item
 */
export function calculateItemValues(item) {
  if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0, taxableAmount: 0 };

  const quantity = Number(item.quantity || 0);
  const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
    ? Number(item.form_updated_discounttype || 0)
    : Number(item.discountType || 0);
  const taxRate = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
    ? Number(item.form_updated_tax || 0)
    : Number(item.taxInfo?.taxRate || 0);
  const rate = Number((quantity * Number(item.form_updated_rate || 0)).toFixed(2));

  let discountX;
  if (item.isRateFormUpadted === true || item.isRateFormUpadted === "true") {
    if ((item.discountType) === 2 || (item.discountType) === "2") {
      discountX = Number((rate * (Number(item.form_updated_discount || 0) / 100)).toFixed(2));
    } else {
      discountX = Number(Number(item.form_updated_discount || 0).toFixed(2));
    }
  } else {
    discountX = Number(Number(item.discount || 0).toFixed(2));
  }

  const taxableAmount = rate - discountX;
  const tax = (taxRate / 100) * taxableAmount;
  const amount = taxableAmount + tax;

  return {
    rate,
    baseRate: Number(item.form_updated_rate || 0),
    discount: discountX,
    form_updated_discount: Number(item.form_updated_discount || 0),
    discountType: discountType,
    tax,
    amount,
    taxableAmount,
    quantity
  };
}