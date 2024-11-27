// app/invoices/page.jsx

import React from 'react';
import ProductListComponent from '@/views/products/listProduct/index';
import ProtectedComponent from '@/components/ProtectedComponent';



const ProductsPage = async ({ params }) => {
 const { id } = params;


  return (
    <ProtectedComponent>
      <ProductListComponent />
    </ProtectedComponent>
  )
}


export default ProductsPage
