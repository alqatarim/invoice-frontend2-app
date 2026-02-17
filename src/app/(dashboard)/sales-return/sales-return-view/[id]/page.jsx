import React from 'react';
import ViewSalesReturnIndex from '@/views/salesReturn/viewSalesReturn/index';
import { getSalesReturnDetails } from '@/app/(dashboard)/sales-return/actions';

const ViewSalesReturnPage = async ({ params }) => {
  const salesReturnData = await getSalesReturnDetails(params.id);

  return (
    <ViewSalesReturnIndex id={params.id} initialSalesReturnData={salesReturnData} />
  );
};

export default ViewSalesReturnPage;