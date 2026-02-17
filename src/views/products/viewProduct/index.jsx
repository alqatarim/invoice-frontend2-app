'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ViewProductDialog from './ViewProductDialog';

const ViewProductPage = ({ id, initialProductData = null }) => {
  const router = useRouter();

  const handleClose = () => {
    router.push('/products/product-list');
  };

  const handleEdit = (productId) => {
    router.push(`/products/product-edit/${productId}`);
  };

  return (
    <ViewProductDialog
      open
      variant="page"
      productId={id}
      initialProductData={initialProductData}
      onClose={handleClose}
      onEdit={handleEdit}
    />
  );
};

export default ViewProductPage;