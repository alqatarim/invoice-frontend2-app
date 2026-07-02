export const resolveCategoryLabel = (row = {}, field = 'label') => {
  const candidates = [field, 'productName', 'branchName', 'customerName', 'label'].filter(Boolean);
  for (const key of candidates) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '-';
};

export const getChartHeight = ({ spec = {}, rowCount = 0 }) => {
  const horizontal = Boolean(spec?.options?.horizontal);
  if (horizontal) {
    return Math.min(Math.max(rowCount * 36 + 80, 220), 480);
  }
  return spec?.type === 'donut' ? 300 : 320;
};
