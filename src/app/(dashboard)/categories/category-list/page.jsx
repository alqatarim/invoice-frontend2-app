import React from 'react';
import CategoryListIndex from '@/views/categories/categoryList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialCategoryData } from '@/app/(dashboard)/categories/actions';

export const metadata = {
  title: 'Categories | Kanakku',
};

/**
 * CategoriesPage Component - Optimized to prevent race conditions
 */
const CategoriesPage = async () => {
  try {
    // Single server-side data fetch
    const initialData = await getInitialCategoryData();

    return (
      <ProtectedComponent>
        <CategoryListIndex initialData={initialData} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('CategoriesPage: Error fetching data:', error);
    return (
      <ProtectedComponent>
        <div className="text-red-600 p-8">
          Failed to load category data: {error.message}
        </div>
      </ProtectedComponent>
    );
  }
};

export default CategoriesPage;
