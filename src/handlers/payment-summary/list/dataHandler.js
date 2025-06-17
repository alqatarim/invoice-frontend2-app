'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFilteredPaymentSummaries } from '@/app/(dashboard)/payment-summary/actions';

/**
 * Data handler for payment summary list (following invoice pattern)
 */
export function dataHandler({
  initialPayments = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialCustomers = [],
  onError,
  onSuccess,
  setCustomerOptions,
}) {
  const [paymentSummaries, setPaymentSummaries] = useState(initialPayments);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });

  // Initialize customer options on mount
  useEffect(() => {
    if (setCustomerOptions && initialCustomers.length > 0) {
      setCustomerOptions(initialCustomers.map(c => ({ value: c._id, label: c.name })));
    }
  }, [setCustomerOptions, initialCustomers]);

  // Fetch payment summaries with current or provided parameters
  const fetchData = useCallback(async (params = {}) => {
    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
      filters = {},
      sortBy = sorting.sortBy,
      sortDirection = sorting.sortDirection
    } = params;

    setLoading(true);
    try {
      const { payments: newPayments, pagination: newPagination } = await getFilteredPaymentSummaries(
        page,
        pageSize,
        filters,
        sortBy,
        sortDirection
      );

      setPaymentSummaries(newPayments);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });

      // Update customer options with new data if needed
      if (setCustomerOptions && newPayments.length > 0) {
        const customerMap = new Map();
        newPayments.forEach(payment => {
          if (payment.customerDetail && !customerMap.has(payment.customerDetail._id)) {
            customerMap.set(payment.customerDetail._id, {
              value: payment.customerDetail._id,
              label: payment.customerDetail.name
            });
          }
        });
        const existingOptions = customerMap.size > 0 ? Array.from(customerMap.values()) : [];
        if (existingOptions.length > 0) {
          setCustomerOptions(existingOptions);
        }
      }

      onSuccess?.({ payments: newPayments, pagination: newPagination });
      return { payments: newPayments, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch payment summaries');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting, onError, onSuccess, setCustomerOptions]);

  const handlePageChange = useCallback((event, newPage) =>
    fetchData({ page: newPage + 1 }), [fetchData]);

  const handlePageSizeChange = useCallback(event =>
    fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) }), [fetchData]);

  const handleSortRequest = useCallback(columnKey => {
    const newDirection = sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  // Initial data fetch (only if no initial data provided)
  useEffect(() => {
    if (initialPayments.length === 0) {
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    paymentSummaries,
    pagination,
    loading,
    ...sorting,

    // Handlers
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
  };
}