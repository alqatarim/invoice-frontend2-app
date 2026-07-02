import { resolveCategoryLabel } from './chartUtils';

export const buildLineChart = ({ spec = {}, rows = [], themeColors = {} }) => {
  const xField = spec?.x?.field || 'label';
  const seriesDefs = Array.isArray(spec?.series) ? spec.series : [];
  const format = seriesDefs[0]?.format || 'number';

  const categories = rows.map((row) => resolveCategoryLabel(row, xField));
  const series = seriesDefs.map((entry) => ({
    name: entry.name || 'Series',
    data: rows.map((row) => {
      const value = Number(row[entry.field]);
      return Number.isFinite(value) ? value : 0;
    }),
  }));

  const valueFormatter = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0';
    if (format === 'currency') return num.toLocaleString();
    if (format === 'percent') return `${num.toFixed(1)}%`;
    return num.toLocaleString();
  };

  return {
    type: spec.type === 'area' ? 'area' : 'line',
    series,
    options: {
      chart: {
        type: spec.type === 'area' ? 'area' : 'line',
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: { curve: 'smooth', width: spec.type === 'area' ? 2 : 3 },
      fill:
        spec.type === 'area'
          ? {
              type: 'gradient',
              gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
            }
          : { opacity: 1 },
      colors: [themeColors.primary, themeColors.secondary],
      dataLabels: { enabled: false },
      markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
      xaxis: {
        categories,
        labels: { rotate: categories.length > 8 ? -35 : 0 },
      },
      yaxis: {
        labels: { formatter: valueFormatter },
      },
      grid: {
        borderColor: 'var(--mui-palette-divider)',
        strokeDashArray: 4,
      },
      legend: { show: series.length > 1 },
      tooltip: { shared: true, y: { formatter: valueFormatter } },
    },
  };
};
