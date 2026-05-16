'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  deletePayment,
  getPaymentsList,
  searchCustomers,
} from '@/app/(dashboard)/payments/actions';

export function usePaymentListHandlers({
  initialPayments = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialCustomerOptions = [],
  onError,
  onSuccess,
  onView,
  onEdit,
} = {}) {
  const router = useRouter();

  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [filterValues, setFilterValues] = useState({
    customer: [],
    search_customer: '',
    status: '',
    payment_method: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [payments, setPayments] = useState(initialPayments);
  const [pagination, setPagination] = useState(() => {
    const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
    if (initialPayments?.length > 0 && basePagination.total === 0) {
      return { ...basePagination, total: initialPayments.length };
    }

    return basePagination;
  });
  const [loading, setLoading] = useState(false);
  const [sorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [fullDataset, setFullDataset] = useState(initialPayments);
  const loadingRef = useRef(false);
  const stateRef = useRef({
    searchTerm: '',
    pagination: initialPagination,
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
  });

  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy: sorting.sortBy,
      sortDirection: sorting.sortDirection
    };
  }, [searchTerm, pagination, sorting.sortBy, sorting.sortDirection]);

  useEffect(() => {
    if (initialCustomerOptions?.length > 0) {
      setCustomerOptions(initialCustomerOptions);
    }
  }, [initialCustomerOptions]);

  const handleCustomerSearch = useCallback(async (searchTermValue) => {
    setCustomerSearchLoading(true);

    try {
      const response = await searchCustomers(searchTermValue);
      const results = response.data || [];

      setCustomerOptions(results.map(customer => ({
        value: customer._id,
        label: customer.name || 'Unknown Customer',
        customer: {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
          image: customer.image
        }
      })));
    } catch (error) {
      console.error('Search error:', error);
      setCustomerOptions([]);
    } finally {
      setCustomerSearchLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
    } = params;

    setLoading(true);
    try {
      const response = await getPaymentsList(page, pageSize);

      if (response.success) {
        setPayments(response.data);
        setPagination({
          current: page,
          pageSize,
          total: response.totalRecords
        });
        setFullDataset(response.data);

        return {
          payments: response.data,
          pagination: { current: page, pageSize, total: response.totalRecords }
        };
      }

      throw new Error(response.message);
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch payments');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pagination, onError]);

  const handlePageChange = useCallback((eventOrPage, maybePage) => {
    const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
    if (typeof nextPage !== 'number') return;
    fetchData({ page: nextPage + 1 });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((eventOrSize) => {
    const nextSize = typeof eventOrSize === 'number'
      ? eventOrSize
      : parseInt(eventOrSize.target.value, 10);
    if (!Number.isFinite(nextSize)) return;
    fetchData({ page: 1, pageSize: nextSize });
  }, [fetchData]);

  const handleSortRequest = useCallback((columnKey, direction) => {
    const newDirection =
      direction || (sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc');

    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });

    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  const handleSearchInputChange = useCallback(async (value) => {
    if (value === stateRef.current.searchTerm) return;

    setSearching(true);
    setSearchTerm(value);

    try {
      const dataToFilter = fullDataset.length > 0 ? fullDataset : payments;

      if (value.trim() === '') {
        setPayments(dataToFilter);
        setPagination(prev => ({
          ...prev,
          current: 1,
          total: dataToFilter.length
        }));
      } else {
        const filtered = dataToFilter.filter(item =>
          item.paymentNumber?.toLowerCase().includes(value.toLowerCase()) ||
          item.customerInfo?.name?.toLowerCase().includes(value.toLowerCase()) ||
          item.payment_method?.toLowerCase().includes(value.toLowerCase()) ||
          item.notes?.toLowerCase().includes(value.toLowerCase())
        );
        setPayments(filtered);
        setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
      }
    } catch (error) {
      console.error('Error searching payments:', error);
      onError?.(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [fullDataset, onError, payments]);

  const handleFilterValueChange = useCallback((field, value) => {
    setFilterValues(prev => {
      const nextValues = { ...prev, [field]: value };

      if (field === 'customer') {
        nextValues.customer = Array.isArray(value) ? value : [];
      }

      if (field === 'search_customer' && value === '') {
        nextValues.customer = [];
      }

      return nextValues;
    });
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterValues({
      customer: [],
      search_customer: '',
      status: '',
      payment_method: '',
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    const { customer, search_customer, status, payment_method } = filterValues;

    return Boolean(
      (customer && customer.length > 0) ||
      search_customer ||
      status ||
      payment_method
    );
  }, [filterValues]);

  const getActiveFilterCount = useCallback(() => {
    const { customer, search_customer, status, payment_method } = filterValues;

    return [
      customer && customer.length > 0,
      search_customer,
      status,
      payment_method
    ].filter(Boolean).length;
  }, [filterValues]);

  const handleDelete = useCallback(async (id) => {
    try {
      const result = await deletePayment(id);
      if (result.success) {
        onSuccess?.('Payment deleted successfully!');
        await fetchData({ page: pagination?.current });
      } else {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      onError?.(error.message || 'Failed to delete payment');
      throw error;
    }
  }, [fetchData, onError, onSuccess, pagination]);

  const handleView = useCallback((id) => {
    if (onView) {
      onView(id);
    } else {
      router.push(`/payments/payment-view/${id}`);
    }
  }, [onView, router]);

  const handleEdit = useCallback((id) => {
    if (onEdit) {
      onEdit(id);
    } else {
      router.push(`/payments/payment-edit/${id}`);
    }
  }, [onEdit, router]);

  const handlePrintDownload = useCallback((id) => {
    try {
      window.open(`/payments/payment-view/${id}?print=true`, '_blank');
      onSuccess?.('Payment is being prepared for download.');
    } catch (error) {
      onError?.(error.message || 'Failed to download payment.');
    }
  }, [onError, onSuccess]);

  return {
    payments,
    pagination,
    loading,
    sortBy: sorting.sortBy,
    sortDirection: sorting.sortDirection,
    filterValues,
    filterOpen,
    filters: filterValues,
    searchTerm,
    searching,
    customerOptions,
    customerSearchLoading,
    fetchData,
    refreshData: fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleFilterValueChange,
    handleFilterApply: fetchData,
    handleFilterReset,
    handleFilterToggle: () => setFilterOpen(open => !open),
    isFilterApplied: hasActiveFilters,
    getFilterCount: getActiveFilterCount,
    handleCustomerSearch,
    handleSearchInputChange,
    handleDelete,
    handleView,
    handleEdit,
    handlePrintDownload,
  };
}
