/**
 * Format an invoice item for display
 * @param {Object} product - The product
 * @returns {Object} Formatted item with calculated values
 */
import { buildAppliedPromotionData, normalizePromotionDiscountType } from './productPromotions';
import { calculateItemValues } from './salesItemsCalc';

export function formatInvoiceItem(product, options = {}) {
  if (!product) return null;

  const {
    applyPromotions = false,
    now = new Date(),
    quantityOverride,
    rateOverride,
    barcodeOverride,
    scaleBarcodeMeta = null,
  } = options;

  const quantity = Number(quantityOverride);
  const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const rate = Number(rateOverride ?? product.sellingPrice ?? 0);
  const appliedPromotion = applyPromotions ? buildAppliedPromotionData(product, now) : null;
  const discountTypeRaw = appliedPromotion?.discountType ?? product.discountType;
  const normalizedDiscountType = normalizePromotionDiscountType(discountTypeRaw);
  const isPercentDiscount = normalizedDiscountType === 2;

  const parsedDiscountValue = Number(appliedPromotion?.discountValue ?? product.discountValue ?? 0);
  const discountValue = Number.isFinite(parsedDiscountValue) ? parsedDiscountValue : 0;
  const computedValues = calculateItemValues({
    quantity: normalizedQuantity,
    rate,
    discountType: normalizedDiscountType,
    form_updated_discounttype: normalizedDiscountType,
    form_updated_discount: discountValue,
    discount: isPercentDiscount ? 0 : discountValue,
    taxInfo: product.tax,
    form_updated_tax: Number(product.tax?.taxRate || 0),
  });

  return {
    productId: product._id,
    name: product.name,
    sku: product.sku || '',
    barcode: barcodeOverride || product.barcode || '',
    quantity: normalizedQuantity,
    units: product.units?.name,
    unit: product.units?._id,
    rate: computedValues.rate,
    discountType: normalizedDiscountType,
    discount: computedValues.discount,
    taxableAmount: Number(computedValues.taxableAmount).toFixed(2),
    amount: Number(computedValues.amount).toFixed(2),
    taxInfo: product.tax,
    tax: Number(computedValues.tax).toFixed(2),
    isRateFormUpadted: false,
    form_updated_discounttype: normalizedDiscountType,
    // Keep discount inputs clean: show 0 instead of 0.00 when no discount exists.
    // Also prevents leading-zero strings from showing up in the UI.
    form_updated_discount: discountValue,
    form_updated_rate: Number(rate).toFixed(4),
    form_updated_tax: Number(product.tax?.taxRate || 0).toFixed(2),
    images: product.images || null,
    promotionMeta: appliedPromotion,
    promotionAutoApplied: Boolean(appliedPromotion),
    promotionSummary: appliedPromotion?.summary || '',
    scaleBarcodeMeta,
    scaleBarcodeSummary: scaleBarcodeMeta?.summary || '',
  };
}