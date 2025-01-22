'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Add AbortController for cleanup
  const abortControllerRef = useRef(null);

  // Memoized vendors fetch
  const fetchVendors = useCallback(async () => {
    try {
      const vendorsList = await getVendors();
      if (Array.isArray(vendorsList)) {
        setVendors(vendorsList);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  }, []);

  // Memoized orders fetch with abort controller
  const fetchOrders = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await getPurchaseOrderList(
        page,
        pageSize,
        {}, // sortConfig - we'll add this back if needed
        filterCriteria
      );

      if (response?.success) {
        setAllOrders(response.data || []);
        setTotalCount(response.totalRecords || 0);
      } else {
        setAllOrders([]);
        setTotalCount(0);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error fetching purchase orders:', error);
      setAllOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCriteria]);

  // Initial data fetch
  useEffect(() => {
    fetchVendors();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const resetAllFilters = useCallback(() => {
    setFilterCriteria({});
    setPage(1);
  }, []);

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