'use client'

import React from "react";
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import ProductList from "@/views/products/listProduct/ProductList";

const ProductListIndex = ({
  initialProducts = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <ProductList
        initialProducts={initialProducts}
        initialPagination={initialPagination}
        initialErrorMessage={initialErrorMessage}
      />
    </AppSnackbarProvider>
  );
};

export default ProductListIndex;