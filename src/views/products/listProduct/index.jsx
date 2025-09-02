'use client'

import React from "react";
import ProductList from "@/views/products/listProduct/ProductList";

const ProductListIndex = ({ initialData }) => {
  return (
    <ProductList
      initialProducts={initialData?.products || []}
      initialPagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
    />
  );
};

export default ProductListIndex;