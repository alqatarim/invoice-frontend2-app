export const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Bank', label: 'Bank' },
  { value: 'Online', label: 'Online' }
];

export const statusOptions = [
  { value: 'REFUND', label: 'Refund', color: 'secondary' },
  { value: 'SENT', label: 'Sent', color: 'info' },
  { value: 'UNPAID', label: 'Unpaid', color: 'warning' },
  { value: 'PARTIALLY_PAID', label: 'Partial Paid', color: 'warning' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'secondary' },
  { value: 'OVERDUE', label: 'Overdue', color: 'error' },
  { value: 'PAID', label: 'Paid', color: 'success' },
  { value: 'DRAFTED', label: 'Drafted', color: 'secondary' }
]

export const invoiceTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'DRAFTED', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const paymentMethodIcons = [
  { value: 'Cash', label: 'mdi:cash-multiple' },
  { value: 'Cheque', label: 'mdi:checkbook' },
  { value: 'Bank', label: 'mdi:bank' },
  { value: 'Online', label: 'mdi:web' },
  { value: 'Credit Card', label: 'bi:credit-card' }
]
