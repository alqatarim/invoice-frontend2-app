export const purchaseCalculations = {
  calculateItemValues: (item) => {
    if (!item) return { rate: 0, discount: 0, discountType: 2, tax: 0, amount: 0, taxableAmount: 0 };
    const quantity = Number(item.quantity) || 0;
    const baseRate = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_rate)
      : Number(item.purchasePrice);
    const rate = quantity * baseRate;
    const discountX = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_discount)
      : Number(item.discount);
    const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
      ? Number(item.form_updated_discounttype)
      : Number(item.discountType);
    const discountValue = discountType === 2
      ? (rate * discountX / 100)
      : discountX;
    const taxableAmount = rate - discountValue;
    const taxRate = Number(item.taxInfo?.taxRate) || 0;
    const tax = (taxableAmount * taxRate) / 100;
    const amount = taxableAmount + tax;
    return {
      rate,
      discount: discountValue,
      tax,
      amount,
      taxableAmount
    };
  },
  calculateTotals: (items) => {
    const initialTotals = {
      subTotal: 0,
      totalDiscount: 0,
      vat: 0,
      total: 0,
      taxableAmount: 0
    };
    if (!Array.isArray(items) || items.length === 0) {
      return initialTotals;
    }
    return items.reduce((acc, item) => {
      const { rate, discountValue, tax, amount, taxableAmount } =
        purchaseCalculations.calculateItemValues(item);
      return {
        subTotal: Number(acc.subTotal) + Number(rate),
        totalDiscount: Number(acc.totalDiscount) + Number(discountValue),
        vat: Number(acc.vat) + Number(tax),
        total: Number(acc.total) + Number(amount),
        taxableAmount: Number(acc.taxableAmount) + Number(taxableAmount)
      };
    }, initialTotals);
  },
  formatPurchaseItem: (product) => {
    if (!product) return null;
    return {
      key: Date.now(),
      name: product.name,
      productId: product._id,
      units: product.units?.name,
      unit: product.units?._id,
      quantity: 1,
      discountType: product.discountType || 3,
      discount: Number(product.discountValue || 0),
      purchasePrice: Number(product.purchasePrice || 0),
      rate: Number(product.purchasePrice || 0),
      taxInfo: product.tax || null,
      tax: product.tax ? Number(product.tax.taxRate || 0) : 0,
      isRateFormUpadted: false,
      form_updated_discounttype: product.discountType || 3,
      form_updated_discount: Number(product.discountValue || 0),
      form_updated_rate: Number(product.sellingPrice || 0),
      form_updated_tax: product.tax ? Number(product.tax.taxRate || 0) : 0
    };
  }
};

/**
 * Calculate purchase totals with rounding option - matches invoice totals signature
 * @param {Array} items - Array of purchase order items
 * @param {Boolean} shouldRoundOff - Whether to round the total amount
 * @returns {Object} Calculated totals in format expected by components
 */
export function calculatePurchaseTotals(items, shouldRoundOff) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      taxableAmount: 0,
      totalDiscount: 0,
      vat: 0,
      TotalAmount: 0,
      roundOffValue: 0,
    };
  }

  const { taxableAmount, totalDiscount, vat } = items.reduce(
    (acc, item) => {
      const { rate, discount, tax } = purchaseCalculations.calculateItemValues(item);
      return {
        taxableAmount: acc.taxableAmount + rate,
        totalDiscount: acc.totalDiscount + discount,
        vat: acc.vat + tax
      };
    },
    { taxableAmount: 0, totalDiscount: 0, vat: 0 }
  );

  let TotalAmount = taxableAmount - totalDiscount + vat;
  let roundOffValue = 0;

  if (shouldRoundOff) {
    roundOffValue = Math.round(TotalAmount) - TotalAmount;
    TotalAmount = Math.round(TotalAmount);
  }

  return {
    taxableAmount,
    totalDiscount,
    vat,
    TotalAmount,
    roundOffValue,
  };
}