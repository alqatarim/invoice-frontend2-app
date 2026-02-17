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
  try {
    // Single server-side data fetch
    const initialData = await getInitialProductData();

    return (
      <ProductListIndex initialData={initialData} />
    );
  } catch (error) {
    console.error('ProductsPage: Error fetching data:', error);
    return (
      <div className="text-red-600 p-8">
        Failed to load product data: {error.message}
      </div>
    );
  }
};

export default ProductsPage;