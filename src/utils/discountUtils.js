// import { sellCalculations } from './sellCalculations';
import { calculateItemValues } from './itemCalculations';

// export const getItemValue = (item, formKey, originalKey) => {
//   if (!item) return 0;
//   return (item.isRateFormUpadted === true || item.isRateFormUpadted === "true") ? item[formKey] : item[originalKey];
// };

export function renderDiscountCell(item) {
  // Calculate the monetary discount value
  const { discount, discountValue, discountType } = calculateItemValues(item);

  return {
    mainValue: discountType === 2
      ? `${Number(discountValue || 0).toFixed(2)}%`
      : Number(discountValue || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
    secondaryValue: discountType === 2
      ? Number(discount || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + ' SAR'
      : null
  };
}