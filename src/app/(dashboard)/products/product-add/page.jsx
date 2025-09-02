import React from 'react';
import AddProductIndex from '@/views/products/addProduct/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Add Product | Kanakku',
};

const AddProductPage = async () => {
  try {
    return (
      <ProtectedComponent>
        <AddProductIndex />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading add product data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Product.</div>;
  }
};

export default AddProductPage;