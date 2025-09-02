import React from 'react';
import AddCategoryIndex from '@/views/categories/addCategory/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Add Category | Kanakku',
};

const AddCategoryPage = async () => {
  try {
    return (
      <ProtectedComponent>
        <AddCategoryIndex />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading add category data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Category.</div>;
  }
};

export default AddCategoryPage;
