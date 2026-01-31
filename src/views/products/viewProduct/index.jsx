'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ViewProductDialog from './ViewProductDialog';

const ViewProductPage = ({ id }) => {
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
      onClose={handleClose}
      onEdit={handleEdit}
    />
  );
};

export default ViewProductPage;