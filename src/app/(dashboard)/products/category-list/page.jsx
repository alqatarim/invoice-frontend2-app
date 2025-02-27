// app/invoices/page.jsx

import React from 'react';
import CategoryListComponent from '@/views/products/listCategory/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const CategoriesPage = async () => {
  return (
    <ProtectedComponent>
      <CategoryListComponent />
    </ProtectedComponent>
  );
};

export default CategoriesPage;
