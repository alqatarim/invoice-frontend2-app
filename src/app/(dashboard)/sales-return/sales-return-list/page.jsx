import React from 'react';
import SalesReturnListIndex from '@/views/salesReturn/listSalesReturn/index';
import { getSalesReturnList } from '@/app/(dashboard)/sales-return/actions';

/**
 * SalesReturnListPage Component
 * Fetches initial sales return data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const SalesReturnListPage = async () => {
  let initialSalesReturns = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialErrorMessage = '';

  try {
    const response = await getSalesReturnList(1, 10);

    if (response?.success) {
      initialSalesReturns = response.data || [];
      initialPagination = {
        current: 1,
        pageSize: 10,
        total: response.totalRecords || 0
      };
    }
  } catch (error) {
    console.error('Error fetching initial sales return data:', error);
    initialErrorMessage = error?.message || 'Failed to load sales returns.';
  }

  return (
    <SalesReturnListIndex
      initialSalesReturns={initialSalesReturns}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default SalesReturnListPage;