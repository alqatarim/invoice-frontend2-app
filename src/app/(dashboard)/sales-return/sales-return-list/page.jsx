import React from 'react';
import SalesReturnListIndex from '@/views/salesReturn/listSalesReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const SalesReturnListPage = () => {
  return (
    <ProtectedComponent>
      <SalesReturnListIndex />
    </ProtectedComponent>
  );
};

export default SalesReturnListPage;