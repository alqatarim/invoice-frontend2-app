import React from 'react';
import EditCategoryComponent from '@/views/products/editCategory/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const EditCategoryPage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <EditCategoryComponent id={params.id} />
    </ProtectedComponent>
  );
};

export default EditCategoryPage;