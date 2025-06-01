import React from 'react';
import ViewSalesReturnIndex from '@/views/salesReturn/viewSalesReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const ViewSalesReturnPage = () => {
  return (
    <ProtectedComponent>
      <ViewSalesReturnIndex />
    </ProtectedComponent>
  );
};

export default ViewSalesReturnPage;