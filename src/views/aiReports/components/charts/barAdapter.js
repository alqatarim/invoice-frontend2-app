import { resolveCategoryLabel } from './chartUtils';

const truncateLabel = (value, max = 28) => {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const buildBarChart = ({ spec = {}, rows = [], themeColors = {} }) => {
  const xField = spec?.x?.field || 'label';
  const horizontal = Boolean(spec?.options?.horizontal);
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
    if (!Number.isFinite(num)) return String(value ?? '');
    if (format === 'percent') return `${num.toFixed(1)}%`;
    if (format === 'currency') return num.toLocaleString();
    return num.toLocaleString();
  };

  return {
    type: 'bar',
    series,
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal,
          borderRadius: 6,
          barHeight: horizontal ? '72%' : undefined,
          columnWidth: horizontal ? undefined : '52%',
          distributed: horizontal && rows.length > 1,
        },
      },
      colors: horizontal
        ? [
            themeColors.primary,
            themeColors.secondary,
            themeColors.tertiary,
            themeColors.quaternary,
            themeColors.primaryLight || themeColors.primary,
          ]
        : [themeColors.primary],
      dataLabels: {
        enabled: horizontal,
        formatter: (val) => valueFormatter(val),
        style: { fontSize: '11px', fontWeight: 500 },
        offsetX: horizontal ? 8 : 0,
      },
      xaxis: {
        categories,
        labels: horizontal
          ? { formatter: valueFormatter }
          : {
              show: true,
              rotate: categories.length > 6 ? -35 : 0,
              trim: true,
              formatter: (val) => truncateLabel(val, 14),
            },
      },
      yaxis: horizontal
        ? {
            labels: {
              maxWidth: 160,
              style: { fontSize: '12px' },
              formatter: (val) => truncateLabel(val, 24),
            },
          }
        : {
            labels: { formatter: valueFormatter },
          },
      grid: {
        borderColor: 'var(--mui-palette-divider)',
        strokeDashArray: 4,
        xaxis: { lines: { show: !horizontal } },
        yaxis: { lines: { show: horizontal } },
      },
      legend: { show: !horizontal && series.length > 1 },
      tooltip: {
        y: { formatter: (val) => valueFormatter(val) },
      },
    },
  };
};
