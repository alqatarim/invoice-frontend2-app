'use client';

import React, { useState, useEffect } from 'react';
import { getPurchaseOrderList } from '@/app/(dashboard)/purchase-orders/actions';
import PurchaseOrderList from './PurchaseOrderList';

const PurchaseOrderListIndex = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderList, setOrderList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrderList = async (currentPage = page, currentPageSize = pageSize) => {
    setLoading(true);
    try {
      const response = await getPurchaseOrderList(currentPage, currentPageSize);
      if (response.success) {
        setOrderList(response.data);
        setTotalCount(response.totalRecords);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderList();
  }, [page, pageSize]);

  return (
    <PurchaseOrderList
      orderList={orderList}
      totalCount={totalCount}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      loading={loading}
      fetchOrderList={fetchOrderList}
    />
  );
};

export default PurchaseOrderListIndex;