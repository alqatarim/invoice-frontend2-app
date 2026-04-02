'use client'

import React from "react";
import ProductList from "@/views/products/listProduct/ProductList";

const ProductListIndex = ({
  initialProducts = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  return (
    <ProductList
      initialProducts={initialProducts}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default ProductListIndex;