'use client';

import React, { useState, useEffect } from 'react';
import { getPurchaseList } from '@/app/(dashboard)/purchases/actions';
import PurchaseList from './PurchaseList';

const PurchaseListIndex = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [purchaseList, setPurchaseList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPurchaseList = async (currentPage = page, currentPageSize = pageSize) => {
    setLoading(true);
    try {
      const response = await getPurchaseList(currentPage, currentPageSize);
      if (response.success) {
        setPurchaseList(response.data);
        setTotalCount(response.totalRecords);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseList();
  }, [page, pageSize]);

  return (
    <PurchaseList
      purchaseList={purchaseList}
      totalCount={totalCount}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      loading={loading}
      fetchPurchaseList={fetchPurchaseList}
    />
  );
};

export default PurchaseListIndex;