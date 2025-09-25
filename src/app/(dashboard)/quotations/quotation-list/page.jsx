import React from 'react';
import { getQuotationsList, getCustomers } from '../actions';
import QuotationListIndex from '@/views/quotations/listQuotation/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Quotation List | Kanakku',
};

async function QuotationListPage() {
  try {
    const [initialData, customers] = await Promise.all([
      getQuotationsList(),
      getCustomers()
    ]);

    return (
      <ProtectedComponent>
        <QuotationListIndex
          initialData={initialData}
          customers={customers}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading quotation list data:', error);
    return <div className="text-red-600 p-8">Failed to load quotation list.</div>;
  }
}

export default QuotationListPage;
