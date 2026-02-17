'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFilteredInvoices } from '@/app/(dashboard)/invoices/actions';
import { filterHandler } from '@/handlers/invoices/list/filterHandler';

/**
 * Data handler for invoice list
 */
export function dataHandler({
  initialInvoices = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialTab = 'ALL',
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialCustomers = [],
  onError,
  onSuccess,
  setCustomerOptions,
  setInvoiceOptions,
  handleCustomerSearch,
  handleInvoiceSearch,
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });
  const loadingRef = useRef(false);

  // Use simplified filterHandler
  const filter = filterHandler(initialFilters, initialTab);

  // Initialize filter options on mount
  useEffect(() => {
    if (setCustomerOptions) {
      if (initialCustomers.length > 0) {
        setCustomerOptions(initialCustomers.map(c => ({ value: c._id, label: c.name })));
      } else if (initialInvoices.length > 0) {
        const customerMap = new Map();
        initialInvoices.forEach(inv => {
          const customer = inv?.customerId;
          if (customer?._id && !customerMap.has(customer._id)) {
            customerMap.set(customer._id, {
              value: customer._id,
              label: customer.name || 'N/A'
            });
          }
        });
        setCustomerOptions(Array.from(customerMap.values()));
      }
    }
    if (setInvoiceOptions && initialInvoices.length > 0) {
      setInvoiceOptions(
        initialInvoices
          .filter(inv => inv.invoiceNumber)
          .map(inv => ({ value: inv.invoiceNumber, label: inv.invoiceNumber }))
      );
    }
  }, []);

  // Fetch invoices with current or provided parameters
  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
      filters = filter.filterValues,
      sortBy = sorting.sortBy,
      sortDirection = sorting.sortDirection,
      search = searchTerm
    } = params;

    setLoading(true);
    try {
      // Determine tab value based on status filters
      const tabValue = !filters.status?.length || filters.status.length > 1 ? 'ALL' : filters.status[0];

      const { invoices: newInvoices, pagination: newPagination } = await getFilteredInvoices(
        tabValue,
        page,
        pageSize,
        filters,
        sortBy,
        sortDirection,
        search
      );

      setInvoices(newInvoices);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });
      setSearchTerm(search);

      // Update filter options with new data
      if (setCustomerOptions && newInvoices.length > 0) {
        const customerMap = new Map();
        newInvoices.forEach(inv => {
          if (inv.customerId && !customerMap.has(inv.customerId._id)) {
            customerMap.set(inv.customerId._id, {
              value: inv.customerId._id,
              label: inv.customerId.name
            });
          }
        });
        setCustomerOptions(Array.from(customerMap.values()));
      }
      
      if (setInvoiceOptions && newInvoices.length > 0) {
        setInvoiceOptions(
          newInvoices
            .filter(inv => inv.invoiceNumber)
            .map(inv => ({ value: inv.invoiceNumber, label: inv.invoiceNumber }))
        );
      }

      return { invoices: newInvoices, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch invoices');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pagination, filter.filterValues, sorting, searchTerm, onError, setCustomerOptions, setInvoiceOptions]);

  // CustomListTable provides zero-indexed page
  const handlePageChange = useCallback((newPage) =>
    fetchData({ page: newPage + 1 }), [fetchData]);

  const handlePageSizeChange = useCallback((newPageSize) =>
    fetchData({ page: 1, pageSize: Number(newPageSize) }), [fetchData]);

  const handleSortRequest = useCallback(columnKey => {
    const newDirection = sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  const handleSearchInputChange = useCallback((value) => {
    const nextValue = String(value ?? '');
    if (nextValue === searchTerm) return;
    setSearchTerm(nextValue);
    fetchData({ page: 1, search: nextValue });
  }, [fetchData, searchTerm]);

  const handleFilterValueChange = useCallback((field, value) => {
    filter.updateFilter(field, value);
    if (field === 'customerSearchText' && handleCustomerSearch) handleCustomerSearch(value);
    if (field === 'invoiceNumberSearchText' && handleInvoiceSearch) handleInvoiceSearch(value);
  }, [filter, handleCustomerSearch, handleInvoiceSearch]);

  const handleFilterApply = useCallback((currentFilters = null) => {
    fetchData({ page: 1, filters: currentFilters || filter.filterValues });
    filter.setFilterOpen(false);
  }, [filter, fetchData]);

  const handleFilterReset = useCallback(() => {
    filter.resetFilters();
    setCustomerOptions?.([]);
    setInvoiceOptions?.([]);
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc' });
    filter.setFilterOpen(false);
  }, [filter, fetchData, setCustomerOptions, setInvoiceOptions]);

  const handleTabChange = useCallback((event, newStatuses) => {
    const updatedStatuses = filter.updateStatus(newStatuses);
    fetchData({ page: 1, filters: { ...filter.filterValues, status: updatedStatuses } });
  }, [filter, fetchData]);

  return {
    // State
    invoices,
    pagination,
    loading,
    searchTerm,
    ...sorting,

    // Handlers
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
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
