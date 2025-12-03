import { calculatePurchaseItemValues } from './purchaseItemCalculations';

/**
 * Calculate totals across all debit note items
 * @param {Array} items - Array of debit note items
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
    const { rate, discount, tax, amount, taxableAmount } = calculatePurchaseItemValues(item);
    return {
      subTotal: Number(acc.subTotal) + Number(rate),
      totalDiscount: Number(acc.totalDiscount) + Number(discount),
      totalTax: Number(acc.totalTax) + Number(tax),
      total: Number(acc.total) + Number(amount),
      taxableAmount: Number(acc.taxableAmount) + Number(taxableAmount)
    };
  }, initialTotals);
}

/**
 * Calculate debit note totals with rounding option
 * @param {Array} items - Array of debit note items
 * @param {Boolean} shouldRoundOff - Whether to round the total amount
 * @returns {Object} Calculated totals
 */
export function calculateDebitNoteTotals(items, shouldRoundOff) {
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
      const { rate, discount, tax } = calculatePurchaseItemValues(item);
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