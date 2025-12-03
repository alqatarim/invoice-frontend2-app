/**
 * Calculate values for a single purchase item (purchases, purchase orders, debit notes)
 * Uses purchasePrice as the base for calculations
 * @param {Object} item - The purchase item
 * @returns {Object} Calculated values for the item
 */
export function calculatePurchaseItemValues(item) {
     if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0, taxableAmount: 0 };

     const quantity = Number(item.quantity || 0);
     const discountType = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
          ? Number(item.form_updated_discounttype || 0)
          : Number(item.discountType || 0);
     const taxRate = (item.isRateFormUpadted === true || item.isRateFormUpadted === "true")
          ? Number(item.form_updated_tax || 0)
          : Number(item.taxInfo?.taxRate || 0);

     // For purchase items, use purchasePrice or form_updated_rate
     // If form_updated_rate exists, use it; otherwise use purchasePrice or rate
     let baseRate;
     if (item.isRateFormUpadted === true || item.isRateFormUpadted === "true") {
          baseRate = Number(item.form_updated_rate || 0);
     } else {
          // If rate exists and quantity exists, calculate base rate from rate/quantity
          // Otherwise use purchasePrice directly
          if (item.rate && quantity > 0) {
               baseRate = Number(item.rate) / quantity;
          } else {
               baseRate = Number(item.purchasePrice || item.rate || 0);
          }
     }

     const rate = Number((quantity * baseRate).toFixed(2));

     // Calculate discount
     let discountX;
     if (item.isRateFormUpadted === true || item.isRateFormUpadted === "true") {
          // Using form updated values
          if (discountType === 2 || discountType === "2") {
               // Percentage discount - apply to total rate
               discountX = Number((rate * (Number(item.form_updated_discount || 0) / 100)).toFixed(2));
          } else {
               // Fixed amount discount - this is total discount, not per unit
               discountX = Number(Number(item.form_updated_discount || 0).toFixed(2));
          }
     } else {
          // Not form updated - use stored discount value
          // If discountType is percentage (2), we need to recalculate based on current rate
          // But we don't have the original percentage stored, so we'll use the stored discount amount
          // This means when quantity changes, the discount won't scale properly unless isRateFormUpadted is set
          if (discountType === 2 || discountType === "2") {
               // Percentage discount - try to calculate from stored discount and original rate
               const storedDiscount = Number(item.discount || 0);
               const storedRate = Number(item.rate || 0);
               if (storedRate > 0 && storedDiscount > 0) {
                    // Calculate the percentage from stored values
                    const discountPercentage = (storedDiscount / storedRate) * 100;
                    // Apply percentage to new rate
                    discountX = Number((rate * (discountPercentage / 100)).toFixed(2));
               } else {
                    // Fallback: use stored discount (may be incorrect if quantity changed)
                    discountX = Number(Number(item.discount || 0).toFixed(2));
               }
          } else {
               // Fixed amount discount - use stored value directly
               discountX = Number(Number(item.discount || 0).toFixed(2));
          }
     }

     const taxableAmount = rate - discountX;
     const tax = (taxRate / 100) * taxableAmount;
     const amount = taxableAmount + tax;

     return {
          rate,
          baseRate: baseRate,
          discount: discountX,
          form_updated_discount: Number(item.form_updated_discount || 0),
          discountType: discountType,
          tax,
          amount,
          taxableAmount,
          quantity
     };
}

/**
 * Calculate totals for all purchase items
 * @param {Array} items - Array of purchase items
 * @returns {Object} Calculated totals
 */
export function calculatePurchaseItemTotals(items) {
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

