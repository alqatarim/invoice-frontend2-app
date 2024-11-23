'use client'

import React, { useState, useEffect } from 'react';
import { getProductDetails, updateProduct } from '@/app/(dashboard)/products/actions';
import EditProduct from '@/views/products/editProduct/Editproduct';

const EditProductIndex = ({ productId }) => {

  const [productData, setProductData] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      const data = await getProductDetails(productId);

      setProductData(data);
    };
    fetchProductData();
  }, [productId]);

  const handleSave = async (updatedData, preparedImage) => {

    const response = await updateProduct(updatedData, preparedImage);
  return response
  };

  return productData ? (
    <EditProduct initialProductData={productData} onSave={handleSave} />
  ) : (
    <div>Loading...</div>
  );
};

export default EditProductIndex;
