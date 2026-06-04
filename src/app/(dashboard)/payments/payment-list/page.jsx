import React from 'react';
import { getCustomers, getPaymentNumber, getPaymentsList } from '../actions';
import PaymentListIndex from '@/views/payments/listPayment/index';

export const metadata = {
  title: 'Payment List | Kanakku',
};

async function PaymentListPage() {
  let initialPayments = [];
  let initialSummary = {};
  let initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  let initialPaymentNumber = '';
  let initialCustomerOptions = [];
  let initialErrorMessage = '';

  try {
    const [initialListData, initialPaymentNumberData, initialCustomerOptionsData] = await Promise.all([
      getPaymentsList(),
      getPaymentNumber(),
      getCustomers(),
    ]);

    initialPayments = initialListData?.success ? initialListData.data || [] : [];
    initialSummary = initialListData?.success ? initialListData.summary || {} : {};
    initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialListData?.success ? initialListData.totalRecords || 0 : 0,
    };
    initialPaymentNumber =
      initialPaymentNumberData?.success && typeof initialPaymentNumberData.data === 'string'
        ? initialPaymentNumberData.data
        : '';
    initialCustomerOptions = initialCustomerOptionsData || [];
    initialErrorMessage = [
      initialListData?.success ? '' : initialListData?.message || 'Failed to load payments.',
      initialPaymentNumberData?.success
        ? ''
        : initialPaymentNumberData?.message || 'Failed to load payment number.',
    ]
      .filter(Boolean)
      .join(' ');
  } catch (error) {
    console.error('Error loading payment list data:', error);
    initialErrorMessage = error?.message || 'Failed to load payment list.';
  }

  return (
    <PaymentListIndex
      initialPayments={initialPayments}
      initialPagination={initialPagination}
      initialSummary={initialSummary}
      initialPaymentNumber={initialPaymentNumber}
      initialCustomerOptions={initialCustomerOptions}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default PaymentListPage;
