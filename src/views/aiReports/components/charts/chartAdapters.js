import { buildLineChart } from './lineAdapter';
import { buildBarChart } from './barAdapter';
import { buildDonutChart } from './donutAdapter';

const ADAPTERS = {
  line: buildLineChart,
  area: buildLineChart,
  bar: buildBarChart,
  donut: buildDonutChart,
};

export const buildChartConfig = ({ spec = {}, rows = [], themeColors = {} }) => {
  const type = String(spec?.type || 'bar').toLowerCase();
  const adapter = ADAPTERS[type] || ADAPTERS.bar;
  return adapter({ spec: { ...spec, type }, rows, themeColors });
};
