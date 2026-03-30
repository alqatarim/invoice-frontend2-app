export const formatCurrency = value => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(amount) ? 0 : amount);
};

export const formatDate = value => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-GB');
};

export const getSourceHref = ({ sourceType, sourceId }) => {
  if (!sourceId) return null;

  switch (sourceType) {
    case 'INVOICE':
    case 'POS':
      return `/invoices/invoice-view/${sourceId}`;
    case 'CREDIT_NOTE':
      return `/sales-return/sales-return-view/${sourceId}`;
    case 'PURCHASE':
      return `/purchases/purchase-view/${sourceId}`;
    case 'DEBIT_NOTE':
      return `/debitNotes/purchaseReturn-view/${sourceId}`;
    case 'PAYMENT':
      return `/payment-summary/payment-summary-view/${sourceId}`;
    default:
      return null;
  }
};

export const getBalanceColor = (value = 0) => {
  const amount = Number(value || 0);

  if (amount > 0) return 'success.main';
  if (amount < 0) return 'error.main';
  return 'text.primary';
};
