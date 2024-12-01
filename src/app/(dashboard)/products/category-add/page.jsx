import React from 'react';
import AddCategoryComponent from '@/views/products/addCategory/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const AddCategoryPage = async () => {
  return (
    <ProtectedComponent>
      <AddCategoryComponent />
    </ProtectedComponent>
  );
};

export default AddCategoryPage;