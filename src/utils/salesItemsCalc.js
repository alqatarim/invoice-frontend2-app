/**
 * Calculate values for a single sales item
 * - rate is treated as unit price (not affected by quantity)
 * - discount and tax are applied on line subtotal (rate × quantity)
 * @param {Object} item - The sales item
 * @returns {Object} Calculated values for the item
 */
export function calculateItemValues(item) {
  if (!item) {
    return {
      rate: 0,
      lineSubtotal: 0,
      discount: 0,
      discountValue: 0,
      discountType: 3,
      tax: 0,
      amount: 0,
      taxableAmount: 0,
      quantity: 0
    };
  }

  const quantity = Number(item.quantity || 0);
  const rate = Number(item.rate || 0);
  const lineSubtotal = Number((rate * quantity).toFixed(2));

  const rawDiscountType =
    item.form_updated_discounttype !== undefined && item.form_updated_discounttype !== null
      ? item.form_updated_discounttype
      : item.discountType;

  const discountTypeNormalized = (() => {
    if (rawDiscountType === 2 || rawDiscountType === '2') return 2;
    if (rawDiscountType === 3 || rawDiscountType === '3') return 3;
    if (typeof rawDiscountType === 'string') {
      const normalized = rawDiscountType.toLowerCase();
      if (normalized === 'percentage' || normalized === 'percent') return 2;
      if (normalized === 'fixed' || normalized === 'amount') return 3;
    }
    return 3;
  })();

  const parsedTaxInfo = (() => {
    if (!item.taxInfo) return null;
    if (typeof item.taxInfo === 'string') {
      try {
        return JSON.parse(item.taxInfo);
      } catch (error) {
        return null;
      }
    }
    return item.taxInfo;
  })();

  const taxRate = Number(
    parsedTaxInfo?.taxRate !== undefined && parsedTaxInfo?.taxRate !== null
      ? parsedTaxInfo?.taxRate
      : item.form_updated_tax || 0
  );

  let discountValue = 0;
  let discountAmount = 0;

  if (discountTypeNormalized === 2) {
    const rawPercent =
      item.form_updated_discount !== undefined && item.form_updated_discount !== null
        ? item.form_updated_discount
        : item.discount || 0;
    discountValue = Math.min(100, Math.max(0, Number(rawPercent || 0)));
    discountAmount = Number((lineSubtotal * (discountValue / 100)).toFixed(2));
  } else {
    const rawFixed =
      item.discount !== undefined && item.discount !== null
        ? item.discount
        : item.form_updated_discount || 0;
    discountValue = Number(rawFixed || 0);
    discountAmount = Number(Number(discountValue).toFixed(2));
  }

  const taxableAmount = Number((lineSubtotal - discountAmount).toFixed(2));
  const tax = Number(((taxRate / 100) * taxableAmount).toFixed(2));
  const amount = Number((taxableAmount + tax).toFixed(2));

  return {
    rate,
    lineSubtotal,
    discount: discountAmount,
    discountValue,
    discountType: discountTypeNormalized,
    tax,
    amount,
    taxableAmount,
    quantity
  };
}
