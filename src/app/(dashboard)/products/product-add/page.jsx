import React from 'react';
import AddProductIndex from '@/views/products/addProduct/index';
import { getDropdownData } from '@/app/(dashboard)/products/actions';

export const metadata = {
  title: 'Add Product | Kanakku',
};

const AddProductPage = async () => {
  let initialDropdownData = { units: [], categories: [], taxes: [] };
  let initialErrorMessage = '';

  try {
    const response = await getDropdownData();
    initialDropdownData = response?.data || initialDropdownData;
  } catch (error) {
    console.error('Error loading add product data:', error);
    initialErrorMessage = error?.message || 'Failed to load data for Add Product.';
  }

  return (
    <AddProductIndex
      initialDropdownData={initialDropdownData}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default AddProductPage;