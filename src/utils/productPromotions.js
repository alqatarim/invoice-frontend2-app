import { parseProductDescription } from './productMeta';

const PROMOTION_PERCENTAGE = 2;
const PROMOTION_FIXED = 3;

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const normalizePromotionDate = (value, boundary = 'start') => {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  if (boundary === 'end') {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
};

const formatDiscountValue = (value) => {
  const numericValue = toPositiveNumber(value);
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
};

export const normalizePromotionDiscountType = (value) => {
  if (value === PROMOTION_PERCENTAGE || value === String(PROMOTION_PERCENTAGE)) {
    return PROMOTION_PERCENTAGE;
  }

  if (value === PROMOTION_FIXED || value === String(PROMOTION_FIXED)) {
    return PROMOTION_FIXED;
  }

  const normalizedValue = String(value || '').trim().toLowerCase();
  if (normalizedValue === 'percentage' || normalizedValue === 'percent') {
    return PROMOTION_PERCENTAGE;
  }

  if (
    normalizedValue === 'fixed'
    || normalizedValue === 'fixed amount'
    || normalizedValue === 'amount'
  ) {
    return PROMOTION_FIXED;
  }

  return PROMOTION_FIXED;
};

export const getProductPromotions = (product) => {
  const parsedDescription = parseProductDescription(product?.productDescription || '');
  const promotions = Array.isArray(parsedDescription?.meta?.promotions)
    ? parsedDescription.meta.promotions
    : [];

  return promotions
    .map((promotion) => {
      const discountValue = toPositiveNumber(promotion?.discountValue);
      if (!discountValue) return null;

      const discountType = normalizePromotionDiscountType(promotion?.discountType);
      const name = String(promotion?.name || '').trim();

      return {
        id: promotion?.id || '',
        name,
        discountType,
        discountTypeLabel: discountType === PROMOTION_PERCENTAGE ? 'Percentage' : 'Fixed Amount',
        discountValue,
        startDate: promotion?.startDate || '',
        endDate: promotion?.endDate || '',
      };
    })
    .filter(Boolean);
};

export const isPromotionActive = (promotion, now = new Date()) => {
  if (!promotion) return false;

  const currentDate = now instanceof Date ? new Date(now) : new Date();
  if (Number.isNaN(currentDate.getTime())) return false;

  const startDate = normalizePromotionDate(promotion.startDate, 'start');
  const endDate = normalizePromotionDate(promotion.endDate, 'end');

  if (startDate && currentDate < startDate) return false;
  if (endDate && currentDate > endDate) return false;

  return true;
};

export const getPromotionSavingsEstimate = (promotion, baseRate = 0) => {
  const rate = Math.max(0, Number(baseRate || 0));
  if (!promotion || !rate) return 0;

  if (promotion.discountType === PROMOTION_PERCENTAGE) {
    return Number((rate * (promotion.discountValue / 100)).toFixed(2));
  }

  return Number(Math.min(rate, promotion.discountValue).toFixed(2));
};

export const getBestActivePromotion = (product, now = new Date()) => {
  const baseRate = Math.max(0, Number(product?.sellingPrice || 0));

  return getProductPromotions(product)
    .filter((promotion) => isPromotionActive(promotion, now))
    .sort((leftPromotion, rightPromotion) => {
      const savingsDifference =
        getPromotionSavingsEstimate(rightPromotion, baseRate)
        - getPromotionSavingsEstimate(leftPromotion, baseRate);

      if (savingsDifference !== 0) return savingsDifference;

      const leftStartDate = normalizePromotionDate(leftPromotion.startDate, 'start')?.getTime() || 0;
      const rightStartDate = normalizePromotionDate(rightPromotion.startDate, 'start')?.getTime() || 0;

      return leftStartDate - rightStartDate;
    })[0] || null;
};

export const buildAppliedPromotionData = (product, now = new Date()) => {
  const promotion = getBestActivePromotion(product, now);
  if (!promotion) return null;

  const formattedDiscountValue = formatDiscountValue(promotion.discountValue);
  const summary = promotion.discountType === PROMOTION_PERCENTAGE
    ? `${promotion.name || 'Promotion'} · ${formattedDiscountValue}% off`
    : `${promotion.name || 'Promotion'} · ${formattedDiscountValue} off`;

  return {
    ...promotion,
    summary,
    savingsEstimate: getPromotionSavingsEstimate(promotion, product?.sellingPrice || 0),
  };
};
