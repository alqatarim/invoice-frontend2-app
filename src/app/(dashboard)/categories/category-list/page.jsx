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
  try {
    const initialCategoryData = await getInitialCategoryData();

    return (
      <CategoryListIndex
        initialCategories={initialCategoryData?.categories || []}
        initialPagination={initialCategoryData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      />
    );
  } catch (error) {
    console.error('CategoriesPage: Error fetching data:', error);
    return (
      <div className="text-red-600 p-8">
        Failed to load category data: {error.message}
      </div>
    );
  }
};

export default CategoriesPage;
