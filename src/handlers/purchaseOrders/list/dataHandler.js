'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFilteredPurchaseOrders } from '@/app/(dashboard)/purchase-orders/actions';
import { filterHandler } from '@/handlers/purchaseOrders/list/filterHandler';

/**
 * Data handler for purchase order list
 */
export function dataHandler({
  initialPurchaseOrders = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialTab = 'ALL',
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialVendors = [],
  onError,
  onSuccess,
  setVendorOptions,
  setPurchaseOrderOptions,
  handleVendorSearch,
  handlePurchaseOrderSearch,
}) {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });

  // Use simplified filterHandler
  const filter = filterHandler(initialFilters, initialTab);

  // Initialize filter options on mount
  useEffect(() => {
    if (setVendorOptions && initialVendors.length > 0) {
      setVendorOptions(initialVendors.map(v => ({ value: v._id, label: v.vendor })));
    }
    if (setPurchaseOrderOptions && initialPurchaseOrders.length > 0) {
      setPurchaseOrderOptions(
        initialPurchaseOrders
          .filter(po => po.purchaseOrderId)
          .map(po => ({ value: po.purchaseOrderId, label: po.purchaseOrderId }))
      );
    }
  }, []);

  // Fetch purchase orders with current or provided parameters
  const fetchData = useCallback(async (params = {}) => {
    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
      filters = filter.filterValues,
      sortBy = sorting.sortBy,
      sortDirection = sorting.sortDirection
    } = params;

    setLoading(true);
    try {
      // Determine tab value based on status filters
      const tabValue = !filters.status?.length || filters.status.length > 1 ? 'ALL' : filters.status[0];

      const { purchaseOrders: newPurchaseOrders, pagination: newPagination } = await getFilteredPurchaseOrders(
        tabValue,
        page,
        pageSize,
        filters,
        sortBy,
        sortDirection
      );

      setPurchaseOrders(newPurchaseOrders);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });

      // Update filter options with new data
      if (setVendorOptions && newPurchaseOrders.length > 0) {
        const vendorMap = new Map();
        newPurchaseOrders.forEach(po => {
          if (po.vendorId && !vendorMap.has(po.vendorId._id)) {
            vendorMap.set(po.vendorId._id, {
              value: po.vendorId._id,
              label: po.vendorId.vendor
            });
          }
        });
        setVendorOptions(Array.from(vendorMap.values()));
      }
      
      if (setPurchaseOrderOptions && newPurchaseOrders.length > 0) {
        setPurchaseOrderOptions(
          newPurchaseOrders
            .filter(po => po.purchaseOrderId)
            .map(po => ({ value: po.purchaseOrderId, label: po.purchaseOrderId }))
        );
      }

      return { purchaseOrders: newPurchaseOrders, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch purchase orders');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, filter.filterValues, sorting, onError, setVendorOptions, setPurchaseOrderOptions]);

  const handlePageChange = useCallback((event, newPage) => 
    fetchData({ page: newPage + 1 }), [fetchData]);

  const handlePageSizeChange = useCallback(event => 
    fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) }), [fetchData]);

  const handleSortRequest = useCallback(columnKey => {
    const newDirection = sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  const handleFilterValueChange = useCallback((field, value) => {
    filter.updateFilter(field, value);
    if (field === 'vendorSearchText' && handleVendorSearch) handleVendorSearch(value);
    if (field === 'purchaseOrderSearchText' && handlePurchaseOrderSearch) handlePurchaseOrderSearch(value);
  }, [filter, handleVendorSearch, handlePurchaseOrderSearch]);

  const handleFilterApply = useCallback((currentFilters = null) => {
    fetchData({ page: 1, filters: currentFilters || filter.filterValues });
    filter.setFilterOpen(false);
  }, [filter, fetchData]);

  const handleFilterReset = useCallback(() => {
    filter.resetFilters();
    setVendorOptions?.([]);
    setPurchaseOrderOptions?.([]);
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc' });
    filter.setFilterOpen(false);
  }, [filter, fetchData, setVendorOptions, setPurchaseOrderOptions]);

  const handleTabChange = useCallback((event, newStatuses) => {
    const updatedStatuses = filter.updateStatus(newStatuses);
    fetchData({ page: 1, filters: { ...filter.filterValues, status: updatedStatuses } });
  }, [filter, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    purchaseOrders,
    pagination,
    loading,
    ...sorting,

    // Handlers
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
    handleTabChange,

    // Filter state and methods
    ...filter,

    // Computed values
    getCurrentTab: () => {
      const status = filter.filterValues.status;
      return !status?.length || status.length > 1 ? 'ALL' : status[0];
    }
  };
}