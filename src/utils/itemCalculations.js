/**
 * Calculate values for a single invoice item
 * @param {Object} item - The invoice item
 * @returns {Object} Calculated values for the item
 */
export function calculateItemValues(item) {
  if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0, taxableAmount: 0 };

  const quantity = Number(item.quantity);
  const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
    ? Number(item.form_updated_discounttype)
    : Number(item.discountType);
  const taxRate = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
    ? Number(item.form_updated_tax)
    : Number(item.taxInfo.taxRate);
  const rate = Number((quantity * item.form_updated_rate).toFixed(2));

  let discountX;
  if (item.isRateFormUpadted === true || item.isRateFormUpadted === "true"){
    if ((item.discountType) === 2 || (item.discountType) === "2") {
      discountX = Number((rate * (item.form_updated_discount / 100)).toFixed(2));
    } else{
      discountX = Number(Number(item.form_updated_discount).toFixed(2));
    }
  } else {
    discountX = Number(Number(item.discount).toFixed(2));
  }

  const taxableAmount = rate - discountX;
  const tax = (taxRate / 100) * taxableAmount;
  const amount = taxableAmount + tax;

  return {
    rate,
    baseRate: item.form_updated_rate,
    discount: discountX,
    form_updated_discount: Number(item.form_updated_discount),
    discountType:discountType,
    tax,
    amount,
    taxableAmount,
    quantity
  };
}