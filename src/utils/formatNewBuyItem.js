/**
 * Format a product for purchase item (purchases, purchase orders, debit notes)
 * Uses purchasePrice as the base rate
 * @param {Object} product - The product
 * @returns {Object} Formatted purchase item with calculated values
 */
export function formatPurchaseItem(product) {
  if (!product) return null;

  const baseRate = Number(product.purchasePrice || 0);
  let discountX;

  if ((product.discountType) === 2 || (product.discountType) === "2") {
    // Percentage discount
    discountX = (baseRate * (Number(product.discountValue || 0) / 100));
  } else {
    // Fixed amount discount
    discountX = Number(product.discountValue || 0).toFixed(2);
  }

  const taxableAmount = baseRate - discountX;
  const tax = (taxableAmount * ((product.tax?.taxRate || 0)) / 100);
  const amount = (taxableAmount + tax).toFixed(2);

  return {
    productId: product._id,
    name: product.name,
    quantity: 1,
    units: product.units?.name,
    unit: product.units?._id,
    purchasePrice: baseRate,
    rate: baseRate,
    discountType: product.discountType || 3,
    discount: discountX,
    taxableAmount: Number(taxableAmount).toFixed(2),
    amount: Number(amount).toFixed(2),
    taxInfo: product.tax,
    tax: Number(tax).toFixed(2),
    isRateFormUpadted: false,
    form_updated_discounttype: product.discountType || 3,
    form_updated_discount: Number(product.discountValue || 0).toFixed(2),
    form_updated_rate: baseRate,
    form_updated_tax: Number(product.tax?.taxRate || 0).toFixed(2)
  };
}

/**
 * Format an empty purchase item row
 * @returns {Object} Empty purchase item with default values
 */
export function formatNewBuyItem() {
  return {
    productId: '',
    name: '',
    units: '',
    quantity: 1,
    purchasePrice: 0,
    rate: 0,
    discount: 0,
    discountType: 3,
    tax: 0,
    taxInfo: {
      _id: '',
      name: '',
      taxRate: 0
    },
    amount: 0,
    taxableAmount: 0,
    key: Date.now(),
    isRateFormUpadted: false,
    form_updated_rate: 0,
    form_updated_discount: 0,
    form_updated_discounttype: 3,
    form_updated_tax: 0
  };
}
