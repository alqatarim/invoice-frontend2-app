'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSalesReturnList, getCustomers } from '@/app/(dashboard)/sales-return/actions';
import SalesReturnListNew from '@/views/salesReturn/listSalesReturn/SalesReturnListNew';

const SalesReturnListIndex = () => {
  const [allSalesReturns, setAllSalesReturns] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({});

  // Add AbortController for cleanup
  const abortControllerRef = useRef(null);

  // Memoized customers fetch
  const fetchCustomers = useCallback(async () => {
    try {
      const customersList = await getCustomers();
      if (Array.isArray(customersList)) {
        setCustomers(customersList);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, []);

  // Memoized sales returns fetch with abort controller
  const fetchSalesReturns = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await getSalesReturnList(
        page || 1,
        pageSize || 10
      );

      if (response?.success) {
        setAllSalesReturns(response.data || []);
        setTotalCount(response.totalRecords || 0);
      } else {
        setAllSalesReturns([]);
        setTotalCount(0);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error fetching sales returns:', error);
      setAllSalesReturns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCriteria]);

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch sales returns when dependencies change
  useEffect(() => {
    fetchSalesReturns();
  }, [fetchSalesReturns]);

  const resetAllFilters = useCallback(() => {
    setFilterCriteria({});
    setPage(1);
  }, []);

  // Add handler for list updates
  const handleListUpdate = useCallback((updatedList, newTotalCount) => {
    setAllSalesReturns(updatedList);
    setTotalCount(newTotalCount);
  }, []);

  return (
    <SalesReturnListNew
      salesReturnList={allSalesReturns}
      totalCount={totalCount}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      loading={loading}
      setFilterCriteria={setFilterCriteria}
      customers={customers}
      resetAllFilters={resetAllFilters}
      onListUpdate={handleListUpdate}
    />
  );
};

export default SalesReturnListIndex;