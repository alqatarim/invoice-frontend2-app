import React from 'react';
import { getFilteredPaymentSummaries } from '../actions';
import PaymentSummaryListIndex from '@/views/payment-summary/listPaymentSummary/index';

export const metadata = {
  title: 'Payment Summary List | Kanakku',
};

async function PaymentSummaryListPage() {
  let initialPaymentSummaries = [];
  let initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  let initialErrorMessage = '';

  try {
    const initialListData = await getFilteredPaymentSummaries(1, 10, {});
    initialPaymentSummaries = initialListData?.payments || [];
    initialPagination = initialListData?.pagination || initialPagination;
  } catch (error) {
    console.error('Error loading payment summary list data:', error);
    initialErrorMessage = error?.message || 'Failed to load payment summary list.';
  }

  return (
    <PaymentSummaryListIndex
      initialPaymentSummaries={initialPaymentSummaries}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default PaymentSummaryListPage;