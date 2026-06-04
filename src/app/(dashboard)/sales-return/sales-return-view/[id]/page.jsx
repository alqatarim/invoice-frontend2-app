import React from 'react';
import ViewSalesReturnIndex from '@/views/salesReturn/viewSalesReturn/index';
import { getSalesReturnDetails } from '@/app/(dashboard)/sales-return/actions';

const ViewSalesReturnPage = async ({ params }) => {
  let salesReturnData = null;
  let initialErrorMessage = '';

  try {
    salesReturnData = await getSalesReturnDetails(params.id);
  } catch (error) {
    console.error('Error fetching sales return details:', error);
    initialErrorMessage = error?.message || 'Failed to load sales return data.';
  }

  return (
    <ViewSalesReturnIndex
      id={params.id}
      initialSalesReturnData={salesReturnData}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default ViewSalesReturnPage;