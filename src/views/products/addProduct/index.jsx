'use client';

import React from 'react';
import AddProduct from '@/views/products/addProduct/AddProduct';
import { addProduct } from '@/app/(dashboard)/products/actions';

const AddProductIndex = ({ initialData }) => {



  const handleSave = async (productData, preparedImage) => {
    const response = await addProduct(productData, preparedImage);
    return response;
  };

  return (
    <AddProduct
      onSave={handleSave}
      dropdownData={initialData}
    />
  );
};

export default AddProductIndex;
