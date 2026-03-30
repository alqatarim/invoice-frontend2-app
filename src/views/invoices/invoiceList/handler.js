'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getFilteredInvoices,
  searchCustomers,
  searchInvoices,
  cloneInvoice,
  sendInvoice,
  convertTosalesReturn,
  sendPaymentLink,
  printDownloadInvoice,
} from '@/app/(dashboard)/invoices/invoice-list/actions';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };
const DEFAULT_FILTERS = {
  customer: [],
  invoiceNumber: [],
  fromDate: '',
  toDate: '',
  status: [],
};

const toOption = (value, label = value) => ({ value, label });

const getCurrentTab = (statusValues = []) =>
  !statusValues.length || statusValues.length > 1 ? 'ALL' : statusValues[0];

const buildCustomerOptions = (invoices = []) => {
  const map = new Map();

  invoices.forEach((invoice) => {
    const customer = invoice?.customerId;

    if (customer?._id && !map.has(customer._id)) {
      map.set(customer._id, toOption(customer._id, customer.name || 'N/A'));
    }
  });

  return Array.from(map.values());
};

const buildInvoiceOptions = (invoices = []) =>
  invoices
    .filter((invoice) => invoice?.invoiceNumber)
    .map((invoice) => toOption(invoice.invoiceNumber));

export function useInvoiceListHandler({
  initialInvoices = [],
  initialPagination = DEFAULT_PAGINATION,
  initialTab = 'ALL',
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialColumns = [],
  initialCustomers = [],
  onError,
  onSuccess,
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filterValues, setFilterValues] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters,
    status: initialFilters.status || (initialTab === 'ALL' ? [] : [initialTab]),
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [customerOptions, setCustomerOptions] = useState(
    initialCustomers.map((customer) => toOption(customer._id, customer.name))
  );
  const [invoiceOptions, setInvoiceOptions] = useState(buildInvoiceOptions(initialInvoices));
  const [availableColumns, setAvailableColumns] = useState(initialColumns);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
  const [convertDialogState, setConvertDialogState] = useState({
    open: false,
    invoice: null,
  });

  const loadingRef = useRef(false);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  const stateRef = useRef({
    filterValues,
    pagination,
    searchTerm,
    sortBy,
    sortDirection,
  });

  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onError, onSuccess]);

  useEffect(() => {
    stateRef.current = {
      filterValues,
      pagination,
      searchTerm,
      sortBy,
      sortDirection,
    };
  }, [filterValues, pagination, searchTerm, sortBy, sortDirection]);

  useEffect(() => {
    if (initialCustomers.length > 0) {
      setCustomerOptions(initialCustomers.map((customer) => toOption(customer._id, customer.name)));
      return;
    }

    if (initialInvoices.length > 0) {
      setCustomerOptions(buildCustomerOptions(initialInvoices));
    }
  }, [initialCustomers, initialInvoices]);

  /**
   * Stable identity: do not close over filter/pagination/search/sort state.
   * CustomListTable's DebouncedInput re-runs when `onSearchChange` identity changes;
   * if fetchData depended on pagination/search, every response would change the callback
   * and retrigger debounced search in a loop.
   */
  const fetchData = useCallback(async (params = {}) => {
    const s = stateRef.current;
    const page = params.page ?? s.pagination.current;
    const pageSize = params.pageSize ?? s.pagination.pageSize;
    const filters = params.filters ?? s.filterValues;
    const nextSortBy = params.nextSortBy ?? s.sortBy;
    const nextSortDirection = params.nextSortDirection ?? s.sortDirection;
    const search = params.search !== undefined ? params.search : s.searchTerm;

    if (loadingRef.current) return null;

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await getFilteredInvoices(
        getCurrentTab(filters.status || []),
        page,
        pageSize,
        filters,
        nextSortBy,
        nextSortDirection,
        search
      );

      const nextInvoices = response?.invoices || [];
      const nextPagination = response?.pagination || DEFAULT_PAGINATION;

      setInvoices(nextInvoices);
      setPagination(nextPagination);
      setSortBy(nextSortBy);
      setSortDirection(nextSortDirection);
      setSearchTerm(search);
      setCustomerOptions((prev) => (prev.length > 0 ? prev : buildCustomerOptions(nextInvoices)));
      setInvoiceOptions(buildInvoiceOptions(nextInvoices));

      return response;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      onErrorRef.current?.(error.message || 'Failed to fetch invoices');
      return null;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    fetchData({ page: page + 1 });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((pageSize) => {
    fetchData({ page: 1, pageSize: Number(pageSize) });
  }, [fetchData]);

  const handleSortRequest = useCallback(
    (columnKey) => {
      const { sortBy: currentSortBy, sortDirection: currentDir } = stateRef.current;
      const nextDirection =
        currentSortBy === columnKey && currentDir === 'asc' ? 'desc' : 'asc';
      fetchData({ page: 1, nextSortBy: columnKey, nextSortDirection: nextDirection });
      return { sortBy: columnKey, sortDirection: nextDirection };
    },
    [fetchData]
  );

  const handleSearchInputChange = useCallback(
    (value) => {
      const nextValue = String(value ?? '');
      if (nextValue === stateRef.current.searchTerm) return;

      setSearchTerm(nextValue);
      fetchData({ page: 1, search: nextValue });
    },
    [fetchData]
  );

  const updateFilterValue = useCallback((field, value) => {
    setFilterValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFilterValueChange = useCallback(
    (field, value) => {
      updateFilterValue(field, value);
    },
    [updateFilterValue]
  );

  const handleFilterApply = useCallback(
    (filters) => {
      const nextFilters = filters ?? stateRef.current.filterValues;
      setFilterValues(nextFilters);
      fetchData({ page: 1, filters: nextFilters });
      setFilterOpen(false);
    },
    [fetchData]
  );

  const handleFilterReset = useCallback(() => {
    setFilterValues(DEFAULT_FILTERS);
    setCustomerOptions([]);
    setInvoiceOptions([]);
    fetchData({
      page: 1,
      filters: DEFAULT_FILTERS,
      nextSortBy: '',
      nextSortDirection: 'asc',
      search: '',
    });
    setFilterOpen(false);
  }, [fetchData]);

  const handleTabChange = useCallback(
    (event, nextStatuses) => {
      let statuses = Array.isArray(nextStatuses) ? [...nextStatuses] : [];

      if (statuses.includes('ALL')) {
        statuses = [];
      }

      const nextFilters = {
        ...stateRef.current.filterValues,
        status: statuses,
      };

      setFilterValues(nextFilters);
      fetchData({ page: 1, filters: nextFilters });
    },
    [fetchData]
  );

  const handleCustomerSearch = useCallback(async (value) => {
    try {
      const results = await searchCustomers(value || '');
      setCustomerOptions(results.map((customer) => toOption(customer._id, customer.name)));
    } catch (error) {
      console.error('Failed to search customers:', error);
      setCustomerOptions([]);
    }
  }, []);

  const handleInvoiceSearch = useCallback(async (value) => {
    const query = String(value || '').trim();

    if (!query) {
      setInvoiceOptions([]);
      return;
    }

    try {
      const results = await searchInvoices(query);
      setInvoiceOptions(results.map((invoice) => toOption(invoice.invoiceNumber)));
    } catch (error) {
      console.error('Failed to search invoices:', error);
      setInvoiceOptions([]);
    }
  }, []);

  const executeAction = useCallback(async (action, successMessage, shouldRefresh = false) => {
    try {
      const result = await action();

      if (successMessage) {
        onSuccessRef.current?.(successMessage);
      }

      if (shouldRefresh) {
        await fetchData();
      }

      return result;
    } catch (error) {
      console.error('Invoice action failed:', error);
      onErrorRef.current?.(error.message || 'Invoice action failed');
      return null;
    }
  }, [fetchData]);

  const handleClone = useCallback((id) => {
    executeAction(() => cloneInvoice(id), 'Invoice cloned successfully!', true);
  }, [executeAction]);

  const handleSend = useCallback((id) => {
    executeAction(() => sendInvoice(id), 'Invoice sent successfully!');
  }, [executeAction]);

  const handleConvertToSalesReturn = useCallback((id) => {
    executeAction(() => convertTosalesReturn(id), 'Invoice converted to sales return successfully!', true);
  }, [executeAction]);

  const handleSendPaymentLink = useCallback((id) => {
    executeAction(() => sendPaymentLink(id), 'Payment link sent successfully!');
  }, [executeAction]);

  const handlePrintDownload = useCallback(async (id) => {
    try {
      const pdfUrl = await printDownloadInvoice(id);
      window.open(pdfUrl, '_blank');
      onSuccessRef.current?.('Invoice is being prepared for download.');
    } catch (error) {
      console.error('Failed to open invoice PDF:', error);
      onErrorRef.current?.(error.message || 'Failed to download invoice.');
    }
  }, []);

  const openConvertDialog = useCallback((invoice) => {
    setConvertDialogState({ open: true, invoice });
  }, []);

  const closeConvertDialog = useCallback(() => {
    setConvertDialogState({ open: false, invoice: null });
  }, []);

  const confirmConvertToSalesReturn = useCallback(async () => {
    const invoiceId = convertDialogState.invoice?.id || convertDialogState.invoice?._id;

    if (!invoiceId) return;

    await handleConvertToSalesReturn(invoiceId);
    closeConvertDialog();
  }, [closeConvertDialog, convertDialogState.invoice, handleConvertToSalesReturn]);

  const handleManageColumnsOpen = useCallback(() => {
    setAvailableColumns(initialColumns);
    setManageColumnsOpen(true);
  }, [initialColumns]);

  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false);
  }, []);

  const handleColumnCheckboxChange = useCallback((columnKey, checked) => {
    setAvailableColumns((prev) =>
      prev.map((column) =>
        column.key === columnKey ? { ...column, visible: checked } : column
      )
    );
  }, []);

  const handleManageColumnsSave = useCallback((setColumns) => {
    setColumns(availableColumns);
    setManageColumnsOpen(false);
    window.localStorage.setItem('invoiceVisibleColumns', JSON.stringify(availableColumns));
  }, [availableColumns]);

  return useMemo(
    () => ({
      invoices,
      pagination,
      loading,
      searchTerm,
      sortBy,
      sortDirection,
      filterValues,
      filterOpen,
      filters: filterValues,
      tab: getCurrentTab(filterValues.status || []),
      customerOptions,
      invoiceOptions,
      availableColumns,
      manageColumnsOpen,
      convertDialogOpen: convertDialogState.open,
      invoiceToConvert: convertDialogState.invoice,
      fetchData,
      handlePageChange,
      handlePageSizeChange,
      handleSortRequest,
      handleSearchInputChange,
      handleFilterValueChange,
      handleFilterApply,
      handleFilterReset,
      handleTabChange,
      handleClone,
      handleSend,
      handleConvertToSalesReturn,
      handlePrintDownload,
      handleSendPaymentLink,
      openConvertDialog,
      closeConvertDialog,
      confirmConvertToSalesReturn,
      handleManageColumnsOpen,
      handleManageColumnsClose,
      handleColumnCheckboxChange,
      handleManageColumnsSave,
      isFilterApplied: () => {
        const { customer, invoiceNumber, fromDate, toDate, status } = filterValues;

        return Boolean(
          customer?.length ||
            invoiceNumber?.length ||
            fromDate ||
            toDate ||
            status?.length
        );
      },
      getFilterCount: () =>
        [
          filterValues.customer?.length > 0,
          filterValues.invoiceNumber?.length > 0,
          Boolean(filterValues.fromDate),
          Boolean(filterValues.toDate),
          filterValues.status?.length > 0,
        ].filter(Boolean).length,
      getCurrentTab: () => getCurrentTab(filterValues.status || []),
      toggleFilter: () => setFilterOpen((prev) => !prev),
      setFilterOpen,
      setFilterValues,
    }),
    [
      availableColumns,
      closeConvertDialog,
      confirmConvertToSalesReturn,
      convertDialogState.invoice,
      convertDialogState.open,
      customerOptions,
      fetchData,
      filterOpen,
      filterValues,
      handleClone,
      handleColumnCheckboxChange,
      handleConvertToSalesReturn,
      handleFilterApply,
      handleFilterReset,
      handleFilterValueChange,
      handleManageColumnsClose,
      handleManageColumnsOpen,
      handleManageColumnsSave,
      handlePageChange,
      handlePageSizeChange,
      handlePrintDownload,
      handleSearchInputChange,
      handleSend,
      handleSendPaymentLink,
      handleSortRequest,
      handleTabChange,
      invoiceOptions,
      invoices,
      loading,
      manageColumnsOpen,
      openConvertDialog,
      pagination,
      searchTerm,
      sortBy,
      sortDirection,
    ]
  );
}
