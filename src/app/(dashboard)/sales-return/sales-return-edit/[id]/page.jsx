import React from 'react';
import EditSalesReturnIndex from '@/views/salesReturn/editSalesReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const EditSalesReturnPage = () => {
  return (
    <ProtectedComponent>
      <EditSalesReturnIndex />
    </ProtectedComponent>
  );
};

export default EditSalesReturnPage;