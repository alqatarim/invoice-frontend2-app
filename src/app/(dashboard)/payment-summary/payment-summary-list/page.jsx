import React from 'react';
import { getInitialPaymentSummaryData, getCustomers } from '../actions';
import PaymentSummaryListIndex from '@/views/payment-summary/listPaymentSummary/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Payment Summary List | Kanakku',
};

async function PaymentSummaryListPage() {
  try {
    const [initialData, customers] = await Promise.all([
      getInitialPaymentSummaryData(),
      getCustomers()
    ]);

    return (
      <ProtectedComponent>
        <PaymentSummaryListIndex
          initialData={{
            data: initialData?.payments || [],
            totalRecords: initialData?.pagination?.total || 0
          }}
          customers={customers}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading payment summary list data:', error);
    return <div className="text-red-600 p-8">Failed to load payment summary list.</div>;
  }
}

export default PaymentSummaryListPage;