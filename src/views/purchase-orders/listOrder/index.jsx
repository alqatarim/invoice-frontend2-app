'use client';

import React, { useState, useEffect } from 'react';
import { getPurchaseOrderList, getVendors } from '@/app/(dashboard)/purchase-orders/actions';
import PurchaseOrderList from './PurchaseOrderList';

const PurchaseOrderListIndex = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});

  const fetchVendors = async () => {
    const vendorsList = await getVendors();
    setVendors(vendorsList);
  };

  useEffect(() => {
    fetchVendors();
    fetchOrders();
  }, [page, pageSize, filterCriteria]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getPurchaseOrderList(page, pageSize, {}, filterCriteria);
      if (response.success) {
        setAllOrders(response.data);
        setTotalCount(response.totalRecords);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetAllFilters = () => {
    setFilterCriteria({});
    setPage(1);
  };

  return (
    <PurchaseOrderList
      orderList={allOrders}
      totalCount={totalCount}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      loading={loading}
      setFilterCriteria={setFilterCriteria}
      vendors={vendors}
      resetAllFilters={resetAllFilters}
    />
  );
};

export default PurchaseOrderListIndex;