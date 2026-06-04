import React from 'react';
import CategoryListIndex from '@/views/categories/categoryList/index';
import { getInitialCategoryData } from '@/app/(dashboard)/categories/actions';

export const metadata = {
  title: 'Categories | Kanakku',
};

/**
 * CategoriesPage Component - Optimized to prevent race conditions
 */
const CategoriesPage = async () => {
  let initialCategories = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialSummary = {};
  let initialErrorMessage = '';

  try {
    const initialCategoryData = await getInitialCategoryData();
    initialCategories = initialCategoryData?.categories || [];
    initialPagination = initialCategoryData?.pagination || initialPagination;
    initialSummary = initialCategoryData?.summary || {};
  } catch (error) {
    console.error('CategoriesPage: Error fetching data:', error);
    initialErrorMessage = error?.message || 'Failed to load category data.';
  }

  return (
    <CategoryListIndex
      initialCategories={initialCategories}
      initialPagination={initialPagination}
      initialSummary={initialSummary}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default CategoriesPage;
