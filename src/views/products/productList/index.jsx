'use client'

import React, { useState, useEffect } from "react";
import Listproduct from "./Listproduct";
import { getProductList } from '@/app/(dashboard)/products/actions';

const ListproductComponent = ({ params }) => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [productListData, setProductListData] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const fetchProductList = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await getProductList(page, size);
        if (!response) {
          notFound();
        } else {
          setProductListData(response.data);
        }
      } catch (error) {
        console.error('Error loading product List data:', error);
        notFound();
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchProductList();
  }, [page, size]); // Ensure dependencies are correct

  if (loading) {
    return <div>Loading...</div>; // Render a loading state while data is being fetched
  }

  return (
    <Listproduct
      initialProductListData={productListData}
      page={page}
      setPage={setPage}
      size={size}
      setSize={setSize}
    />
  );
};

export default ListproductComponent;
