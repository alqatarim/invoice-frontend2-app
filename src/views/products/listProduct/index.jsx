'use client'

import React, { useState, useEffect } from "react";
import Listproduct from "./Listproduct";
import { getProductList } from '@/app/(dashboard)/products/actions';

const ListproductComponent = () => {
  const [state, setState] = useState({
    page: 1,
    size: 10,
    data: [],
    totalCount: 0,
    loading: true
  });

  const fetchProductList = async (page, size) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await getProductList(page, size);
      setState(prev => ({
        ...prev,
        data: response?.data || [],
        totalCount: response?.totalCount || 0,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading product List data:', error);
      setState(prev => ({
        ...prev,
        data: [],
        totalCount: 0,
        loading: false
      }));
    }
  };

  useEffect(() => {
    fetchProductList(state.page, state.size);
  }, [state.page, state.size]);

  return (
    <Listproduct
      initialProductListData={state.data}
      totalCount={state.totalCount}
      page={state.page}
      setPage={(page) => setState(prev => ({ ...prev, page }))}
      size={state.size}
      setSize={(size) => setState(prev => ({ ...prev, size }))}
      loading={state.loading}
      fetchProductList={fetchProductList}
    />
  );
};

export default ListproductComponent;
