import React from 'react';
import EditCategoryComponent from '@/views/categories/editCategory/EditCategory';

const EditCategoryPage = async ({ params }) => {
  return (
    <EditCategoryComponent id={params.id} />
  );
};

export default EditCategoryPage;