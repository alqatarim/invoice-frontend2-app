import React from 'react';
import EditCategoryComponent from '@/views/categories/editCategory/EditCategory';
import ProtectedComponent from '@/components/ProtectedComponent';

const EditCategoryPage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <EditCategoryComponent id={params.id} />
    </ProtectedComponent>
  );
};

export default EditCategoryPage;