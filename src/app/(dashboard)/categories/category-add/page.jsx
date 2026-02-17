import React from 'react';
import AddCategoryIndex from '@/views/categories/addCategory/index';

export const metadata = {
  title: 'Add Category | Kanakku',
};

const AddCategoryPage = async () => {
  try {
    return (
      <AddCategoryIndex />
    );
  } catch (error) {
    console.error('Error loading add category data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Category.</div>;
  }
};

export default AddCategoryPage;
