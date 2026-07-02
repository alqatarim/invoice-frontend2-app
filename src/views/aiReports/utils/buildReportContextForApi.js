const DATASET_TO_DOMAIN = {
  sales: 'sales',
  products: 'product_catalog',
  inventory: 'inventory',
};

const getTableRows = (message = {}) => {
  const blocks = Array.isArray(message.blocks) ? message.blocks : [];
  const tableBlock = blocks.find((block) => block.type === 'table');
  return Array.isArray(tableBlock?.rows) ? tableBlock.rows : [];
};

const uniqueValues = (rows = [], key) =>
  [...new Set(rows.map((row) => row[key]).filter(Boolean))];

export const buildReportContextForApi = (messages = []) => {
  const assistantMessages = messages.filter((message) => message.role === 'assistant');
  const lastAssistant = assistantMessages[assistantMessages.length - 1];
  if (!lastAssistant) return {};

  const meta = lastAssistant.meta || {};
  const allRows = assistantMessages.flatMap((message) => getTableRows(message));
  const productNames = uniqueValues(allRows, 'productName');
  const branchNames = uniqueValues(allRows, 'branchName');
  const customerNames = uniqueValues(allRows, 'customerName');

  const lastDomain =
    meta.domain || DATASET_TO_DOMAIN[meta.dataset] || null;
  const reportKind =
    meta.reportKind ||
    (meta.reportMode === 'combined_sales_margin' ? 'sales_with_margin' : 'standard');

  const context = {
    lastDomain,
    lastDataset: meta.dataset || null,
    lastDimension: meta.dimension || meta.groupBy || null,
    lastMeasure: meta.measure || null,
    productNames,
    branchNames,
    customerNames,
    reportKind,
    reportMode: meta.reportMode || null,
  };

  if (meta.dateRange?.from && meta.dateRange?.to) {
    context.lastTimeRange = {
      from: meta.dateRange.from,
      to: meta.dateRange.to,
    };
  }

  return context;
};
