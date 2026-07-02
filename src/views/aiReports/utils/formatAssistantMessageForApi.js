const getTableLabelKey = (columns = []) => {
  const preferred = ['productName', 'branchName', 'customerName', 'label', 'name'];
  for (const key of preferred) {
    if (columns.some((column) => column.key === key)) return key;
  }
  const periodColumn = columns.find((column) =>
    ['Product', 'Branch', 'Period', 'Customer'].includes(column.label)
  );
  return periodColumn?.key || columns[0]?.key || 'label';
};

const hasColumn = (columns = [], labelOrKey = '') =>
  columns.some(
    (column) =>
      column.key === labelOrKey || String(column.label || '').toLowerCase() === labelOrKey.toLowerCase()
  );

const compactRowsForContext = (rows = [], limit = 12) =>
  rows.slice(0, limit).map((row) => {
    const next = {};
    ['productName', 'branchName', 'customerName', 'label', 'productRevenue', 'totalSales', 'marginPercent', 'quantity'].forEach(
      (key) => {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') next[key] = row[key];
      }
    );
    return next;
  });

export const formatAssistantMessageForApi = (message = {}) => {
  const blocks = Array.isArray(message.blocks) ? message.blocks : [];
  const textBlock = blocks.find((block) => block.type === 'text');
  const tableBlock = blocks.find((block) => block.type === 'table');

  const parts = [textBlock?.content || 'Report generated.'];

  if (tableBlock?.rows?.length) {
    const columns = Array.isArray(tableBlock.columns) ? tableBlock.columns : [];
    const labelKey = getTableLabelKey(columns);
    const labels = tableBlock.rows
      .map((row) => row[labelKey] || row.productName || row.label)
      .filter(Boolean);
    const compactRows = compactRowsForContext(tableBlock.rows);

    if (hasColumn(columns, 'productName') || hasColumn(columns, 'Product')) {
      parts.push(`Products in report: ${labels.join(', ')}.`);
    } else if (hasColumn(columns, 'branchName') || hasColumn(columns, 'Branch')) {
      parts.push(`Branches in report: ${labels.join(', ')}.`);
    } else if (hasColumn(columns, 'customerName') || hasColumn(columns, 'Customer')) {
      parts.push(`Customers in report: ${labels.join(', ')}.`);
    } else {
      parts.push(`Rows in report: ${labels.join(', ')}.`);
    }

    if (compactRows.length) {
      parts.push(`Report rows JSON: ${JSON.stringify(compactRows)}.`);
    }
  }

  const dateRange = message.meta?.dateRange;
  if (dateRange?.from && dateRange?.to) {
    parts.push(`Date range: ${dateRange.from} to ${dateRange.to}.`);
  }

  if (message.meta?.domain) {
    parts.push(`Domain: ${message.meta.domain}.`);
  }

  if (message.meta?.dataset) {
    parts.push(`Dataset: ${message.meta.dataset}.`);
  }

  if (message.meta?.measure) {
    parts.push(`Measure: ${message.meta.measure}.`);
  }

  if (message.meta?.dimension || message.meta?.groupBy) {
    parts.push(`Dimension: ${message.meta.dimension || message.meta.groupBy}.`);
  }

  if (message.meta?.reportMode) {
    parts.push(`Report mode: ${message.meta.reportMode}.`);
  }

  return parts.join(' ');
};

