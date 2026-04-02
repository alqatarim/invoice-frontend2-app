import React from 'react';
import ProductListIndex from '@/views/products/listProduct/index';
import { getInitialProductData } from '@/app/(dashboard)/products/actions';

export const metadata = {
  title: 'Products | Kanakku',
};

/**
 * ProductsPage Component - Optimized to prevent race conditions
 */
const ProductsPage = async () => {
  let initialProducts = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialErrorMessage = '';

  try {
    const initialData = await getInitialProductData();
    initialProducts = initialData?.products || [];
    initialPagination = initialData?.pagination || initialPagination;
  } catch (error) {
    console.error('ProductsPage: Error fetching data:', error);
    initialErrorMessage = error?.message || 'Failed to load product data.';
  }

  return (
    <ProductListIndex
      initialProducts={initialProducts}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default ProductsPage;