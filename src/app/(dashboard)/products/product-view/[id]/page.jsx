import React from 'react';
import { getProductById } from '@/app/(dashboard)/products/actions';
import ProductView from '@/views/products/viewProduct/index';

/**
 * ProductViewPage Component
 * Server-side component to fetch product data and render the ViewProduct client component.
 *
 * @param {Object} params - Dynamic route parameters.
 * @param {string} params.id - Product ID from the URL.
 * @returns JSX.Element
 */
const ProductViewPage = async ({ params }) => {
  const { id } = params;
  const initialProductData = await getProductById(id);

  return (
    <ProductView id={id} initialProductData={initialProductData} />
  );
}

export default ProductViewPage;