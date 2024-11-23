// app/invoices/page.jsx

import React from 'react';
import ListproductComponent from '@/views/products/productList/index';
import ProtectedComponent from '@/components/ProtectedComponent';



const ProductsPage = async ({ params }) => {
 const { id } = params;


  return (
    <ProtectedComponent>
      <ListproductComponent />
    </ProtectedComponent>
  )
}


export default ProductsPage
