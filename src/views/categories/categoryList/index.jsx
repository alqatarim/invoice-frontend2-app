'use client'

import React from "react";
import CategoryList from "@/views/categories/categoryList/CategoryList";

const CategoryListIndex = ({ initialData }) => {
  return (
    <CategoryList
      initialCategories={initialData?.categories || []}
      initialPagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
    />
  );
};

export default CategoryListIndex;
