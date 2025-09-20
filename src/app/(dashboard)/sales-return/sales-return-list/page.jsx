import React from 'react';
import SalesReturnListIndex from '@/views/salesReturn/listSalesReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getSalesReturnList } from '@/app/(dashboard)/sales-return/actions';

/**
 * SalesReturnListPage Component
 * Fetches initial sales return data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const SalesReturnListPage = async () => {
  // Fetch initial sales return data on the server
  let initialData = {
    salesReturns: [],
    pagination: { current: 1, pageSize: 10, total: 0 }
  };

  try {
    const response = await getSalesReturnList(1, 10);

    if (response?.success) {

      console.log('Response:', response);
      initialData = {
        salesReturns: response.data || [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: response.totalRecords || 0
        }
      };
    }
  } catch (error) {
    console.error('Error fetching initial sales return data:', error);
    // Keep default empty data on error
  }

  return (
    <ProtectedComponent>
      <SalesReturnListIndex
        initialData={initialData}
        initialSalesReturns={initialData.salesReturns}
      />
    </ProtectedComponent>
  );
};

export default SalesReturnListPage;