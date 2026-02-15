import { calculateItemValues } from './salesItemsCalc';

/**
 * Calculate totals across all sales items
 * @param {Array} items - Array of items
 * @returns {Object} Calculated totals
 */
export function calculateTotals(items) {
  const initialTotals = {
    subTotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    total: 0,
    taxableAmount: 0
  };

  if (!Array.isArray(items) || items.length === 0) {
    return initialTotals;
  }

  return items.reduce((acc, item) => {
    const { lineSubtotal, discount, tax, amount, taxableAmount } = calculateItemValues(item);
    return {
      subTotal: Number(acc.subTotal) + Number(lineSubtotal),
      totalDiscount: Number(acc.totalDiscount) + Number(discount),
      totalTax: Number(acc.totalTax) + Number(tax),
      total: Number(acc.total) + Number(amount),
      taxableAmount: Number(acc.taxableAmount) + Number(taxableAmount)
    };
  }, initialTotals);
}

/**
 * Calculate totals with rounding option
 * @param {Array} items - Array of items
 * @param {Boolean} shouldRoundOff - Whether to round the total amount
 * @returns {Object} Calculated totals
 */
export function calculateInvoiceTotals(items, shouldRoundOff) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      taxableAmount: 0,
      totalDiscount: 0,
      vat: 0,
      TotalAmount: 0,
      roundOffValue: 0
    };
  }

  const { lineSubtotal, totalDiscount, vat } = items.reduce(
    (acc, item) => {
      const { lineSubtotal: lineTotal, discount, tax } = calculateItemValues(item);
      return {
        lineSubtotal: acc.lineSubtotal + lineTotal,
        totalDiscount: acc.totalDiscount + discount,
        vat: acc.vat + tax
      };
    },
    { lineSubtotal: 0, totalDiscount: 0, vat: 0 }
  );

  let TotalAmount = lineSubtotal - totalDiscount + vat;
  let roundOffValue = 0;

  if (shouldRoundOff) {
    roundOffValue = Math.round(TotalAmount) - TotalAmount;
    TotalAmount = Math.round(TotalAmount);
  }

  return {
    taxableAmount: lineSubtotal,
    totalDiscount,
    vat,
    TotalAmount,
    roundOffValue
  };
}
