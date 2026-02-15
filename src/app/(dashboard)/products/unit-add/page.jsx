import React from 'react';
import AddUnitComponent from '@/views/units/addUnit/AddUnit';
import ProtectedComponent from '@/components/ProtectedComponent';

const AddUnitPage = async () => {
  return (
    <ProtectedComponent>
      <AddUnitComponent />
    </ProtectedComponent>
  );
};

export default AddUnitPage;