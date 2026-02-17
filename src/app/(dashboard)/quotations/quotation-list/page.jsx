import React from 'react';
import { getQuotationsList, getCustomers } from '../actions';
import QuotationListIndex from '@/views/quotations/listQuotation/index';

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
      <QuotationListIndex
        initialData={initialData}
        customers={customers}
      />
    );
  } catch (error) {
    console.error('Error loading quotation list data:', error);
    return <div className="text-red-600 p-8">Failed to load quotation list.</div>;
  }
}

export default QuotationListPage;
