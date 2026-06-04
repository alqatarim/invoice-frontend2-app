'use client';

import React from 'react';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import CategoryList from './CategoryList';

const CategoryListIndex = ({
  initialCategories = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <CategoryList
        initialCategories={initialCategories}
        initialPagination={initialPagination}
        initialSummary={initialSummary}
        initialErrorMessage={initialErrorMessage}
      />
    </AppSnackbarProvider>
  );
};

export default CategoryListIndex;
