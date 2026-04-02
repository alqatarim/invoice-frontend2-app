import React from 'react';
import { getQuotationsList, getCustomers } from '../actions';
import QuotationListIndex from '@/views/quotations/listQuotation/index';

export const metadata = {
  title: 'Quotation List | Kanakku',
};

async function QuotationListPage() {
  let initialQuotations = []
  let initialPagination = { current: 1, pageSize: 10, total: 0 }
  let initialCustomers = []
  let initialErrorMessage = ''

  try {
    const [initialData, customers] = await Promise.all([
      getQuotationsList(),
      getCustomers()
    ]);

    initialQuotations = initialData?.data || []
    initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialData?.totalRecords || 0
    }
    initialCustomers = customers || []
  } catch (error) {
    console.error('Error loading quotation list data:', error);
    initialErrorMessage = error?.message || 'Failed to load quotation list.'
  }

  return (
    <QuotationListIndex
      initialQuotations={initialQuotations}
      initialPagination={initialPagination}
      initialCustomers={initialCustomers}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default QuotationListPage;
