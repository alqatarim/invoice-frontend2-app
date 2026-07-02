import { resolveCategoryLabel } from './chartUtils';

export const buildDonutChart = ({ spec = {}, rows = [], themeColors = {} }) => {
  const xField = spec?.x?.field || 'label';
  const valueField = spec?.series?.[0]?.field || 'value';
  const format = spec?.series?.[0]?.format || 'number';

  const labels = rows.map((row) => resolveCategoryLabel(row, xField));
  const series = rows.map((row) => {
    const value = Number(row[valueField]);
    return Number.isFinite(value) ? value : 0;
  });

  const valueFormatter = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0';
    if (format === 'percent') return `${num.toFixed(1)}%`;
    if (format === 'currency') return num.toLocaleString();
    return num.toLocaleString();
  };

  return {
    type: 'donut',
    series,
    options: {
      chart: { type: 'donut' },
      labels,
      colors: [
        themeColors.primary,
        themeColors.secondary,
        themeColors.tertiary,
        themeColors.quaternary,
        themeColors.primaryLight || themeColors.primary,
      ],
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: {
        enabled: rows.length <= 6,
        formatter: (val) => `${Number(val).toFixed(0)}%`,
      },
      plotOptions: {
        pie: {
          donut: { size: '68%', labels: { show: true, total: { show: true, label: 'Total' } } },
        },
      },
      tooltip: { y: { formatter: valueFormatter } },
    },
  };
};
