const DEFAULT_NUMBER_OPTIONS = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

export function formatNumberWithLocale(number, locale = 'en-US', options = DEFAULT_NUMBER_OPTIONS) {
  if (number === null || number === undefined || isNaN(Number(number))) {
    return '0.00';
  }
  const numValue = typeof number === 'string' ? parseFloat(number) : number;
  return numValue.toLocaleString(locale, options);
}

export function formatNumber(number) {
  return number == null || isNaN(Number(number))
    ? '0.00 SAR'
    : `${formatNumberWithLocale(number, 'en-US', DEFAULT_NUMBER_OPTIONS)} SAR`;
}

export function formatDecimal(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '0.00';
}

export const amountFormat = (amount) => {
  if (isNaN(amount)) return '0.00';
  return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
  });
};