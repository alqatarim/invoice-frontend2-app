// app/(dashboard)/invoices/[id]/page.jsx
import React from 'react';
import EditProductIndex from '@/views/products/editProduct/index';
import ProtectedComponent from '@/components/ProtectedComponent'

const EditProductPage = async ({ params }) => {
  const { id } = params;


    return (
      <ProtectedComponent>
        <EditProductIndex
  productId={id}

        />
      </ProtectedComponent>
    )

  }
export default EditProductPage
