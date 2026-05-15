import React from 'react';
import { notFound } from 'next/navigation';
import { getDropdownData, getProductById } from '@/app/(dashboard)/products/actions';
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
  let initialProductData = null;
  let initialDropdownData = { units: [], categories: [], taxes: [] };

  try {
    const [productData, dropdownResponse] = await Promise.all([
      getProductById(id),
      getDropdownData(),
    ]);

    if (!productData) {
      notFound();
    }

    initialProductData = productData;
    initialDropdownData = dropdownResponse?.data || initialDropdownData;
  } catch (error) {
    console.error('Error loading product view data:', error);
  }

  return (
    <ProductView id={id} initialProductData={initialProductData} initialDropdownData={initialDropdownData} />
  );
}

export default ProductViewPage;