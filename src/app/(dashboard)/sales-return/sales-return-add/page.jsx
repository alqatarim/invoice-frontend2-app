import React from 'react';
import AddSalesReturnIndex from '@/views/salesReturn/addSalesReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const AddSalesReturnPage = () => {
  return (
    <ProtectedComponent>
      <AddSalesReturnIndex />
    </ProtectedComponent>
  );
};

export default AddSalesReturnPage;