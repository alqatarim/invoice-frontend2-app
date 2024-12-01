import React from 'react';
import AddUnitComponent from '@/views/products/addUnit/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const AddUnitPage = async () => {
  return (
    <ProtectedComponent>
      <AddUnitComponent />
    </ProtectedComponent>
  );
};

export default AddUnitPage;