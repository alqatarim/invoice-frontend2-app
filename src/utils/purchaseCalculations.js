// DEPRECATED: This file is kept for backward compatibility only
// Use purchaseItemCalculations.js and purchaseTotals.js instead

import { calculatePurchaseItemValues, formatPurchaseItem as formatItem, formatNewBuyItem } from './purchaseItemCalculations';
import { calculatePurchaseTotals as calcTotals, calculatePurchaseInvoiceTotals } from './purchaseTotals';

/**
 * @deprecated Use calculatePurchaseItemValues from purchaseItemCalculations.js
 */
export const purchaseCalculations = {
  calculateItemValues: calculatePurchaseItemValues,
  calculateTotals: calcTotals,
  formatPurchaseItem: formatItem
};

/**
 * @deprecated Use calculatePurchaseInvoiceTotals from purchaseTotals.js
 */
export function calculatePurchaseTotals(items, shouldRoundOff) {
  return calculatePurchaseInvoiceTotals(items, shouldRoundOff);
}