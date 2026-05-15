'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ViewProduct from './ViewProduct';

const ViewProductPage = ({ id, initialProductData = null, initialDropdownData = { units: [], categories: [], taxes: [] } }) => {
  const router = useRouter();

  const handleClose = () => {
    router.push('/products/product-list');
  };

  const handleEdit = (productId) => {
    router.push(`/products/product-edit/${productId}`);
  };

  return (
    <ViewProduct
      productId={id}
      initialProductData={initialProductData}
      initialDropdownData={initialDropdownData}
      onClose={handleClose}
      onEdit={handleEdit}
    />
  );
};

export default ViewProductPage;