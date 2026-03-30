'use client';

import React from 'react';
import CategoryList from './CategoryList';

const CategoryListIndex = ({
  initialCategories = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
}) => {
  return (
    <CategoryList
      initialCategories={initialCategories}
      initialPagination={initialPagination}
    />
  );
};

export default CategoryListIndex;
