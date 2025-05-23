import { useState } from 'react';
import { getFilteredInvoices } from '@/app/(dashboard)/invoices/actions';

/**
 * dataHandler
 * Handles fetching, pagination, tab, filters, sorting, and related state and handlers for invoice list.
 */
export function dataHandler({
  initialInvoices = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialTab = 'ALL',
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
  onSuccess,
  setCustomerOptions,
  setInvoiceOptions,
  handleCustomerSearch,
  handleInvoiceSearch,
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [pagination, setPagination] = useState(initialPagination);
  const [tab, setTab] = useState(initialTab);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filterValues, setFilterValues] = useState(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch invoices (all or filtered)
  const fetchData = async (
    tabValue,
    page = pagination.current,
    pageSize = pagination.pageSize,
    filterValuesArg = filters,
    sortByValue = sortBy,
    sortDirectionValue = sortDirection
  ) => {
    setLoading(true);
    try {
      const { invoices: newInvoices, pagination: newPagination } = await getFilteredInvoices(
        tabValue,
        page,
        pageSize,
        filterValuesArg,
        sortByValue,
        sortDirectionValue
      );
      setInvoices(newInvoices);
      setPagination(newPagination);
      setFilters(filterValuesArg);
      setSortBy(sortByValue);
      setSortDirection(sortDirectionValue);
    } catch (error) {
      onError && onError(error.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    fetchData(tab, newPage + 1, pagination.pageSize, filters, sortBy, sortDirection);
  };
  const handlePageSizeChange = (event) => {
    fetchData(tab, 1, parseInt(event.target.value, 10), filters, sortBy, sortDirection);
  };

  // Sorting handler
  const handleSortRequest = (columnKey) => {
    let newDirection = 'asc';
    if (sortBy === columnKey) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortBy(columnKey);
    setSortDirection(newDirection);
    fetchData(tab, 1, pagination.pageSize, filters, columnKey, newDirection);
    return { sortBy: columnKey, sortDirection: newDirection };
  };

  // Filter handlers
  const handleFilterValueChange = (field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
    if (field === 'customerSearchText' && handleCustomerSearch) handleCustomerSearch(value);
    if (field === 'invoiceNumberSearchText' && handleInvoiceSearch) handleInvoiceSearch(value);
  };
  const handleFilterApply = () => {
    setFilters(filterValues);
    setFilterOpen(false);
    fetchData(tab, 1, pagination.pageSize, filterValues, sortBy, sortDirection);
  };
  const handleFilterReset = () => {
    setFilterValues({});
    setFilters({});
    if (setCustomerOptions) setCustomerOptions([]);
    if (setInvoiceOptions) setInvoiceOptions([]);
    setFilterOpen(false);
    fetchData(tab, 1, pagination.pageSize, {}, sortBy, sortDirection);
  };

  return {
    invoices,
    setInvoices,
    pagination,
    setPagination,
    filters,
    setFilters,
    loading,
    setLoading,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    fetchData,
    filterValues,
    setFilterValues,
    filterOpen,
    setFilterOpen,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
  };
}

