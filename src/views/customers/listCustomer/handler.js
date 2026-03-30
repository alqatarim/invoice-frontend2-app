'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  activateCustomer,
  deactivateCustomer,
  deleteCustomer,
  getFilteredCustomers,
} from '@/app/(dashboard)/customers/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

export function useCustomerListHandler({
  initialCustomers = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSortBy = 'createdAt',
  initialSortDirection = 'desc',
  onError,
  onSuccess,
}) {
  const router = useRouter();

  const [customers, setCustomers] = useState(initialCustomers);
  const [pagination, setPagination] = useState(initialPagination);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [activateAnchorEl, setActivateAnchorEl] = useState(null);
  const [deactivateAnchorEl, setDeactivateAnchorEl] = useState(null);

  const loadingRef = useRef(false);
  const stateRef = useRef({
    pagination: initialPagination,
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
    searchTerm: '',
  });

  useEffect(() => {
    stateRef.current = {
      pagination,
      sortBy,
      sortDirection,
      searchTerm,
    };
  }, [pagination, sortBy, sortDirection, searchTerm]);

  const fetchCustomers = useCallback(
    async (params = {}) => {
      if (loadingRef.current) {
        return null;
      }

      loadingRef.current = true;
      setLoading(true);

      try {
        const currentState = stateRef.current;
        const page = params.page ?? currentState.pagination.current;
        const pageSize = params.pageSize ?? currentState.pagination.pageSize;
        const nextSortBy = params.sortBy ?? currentState.sortBy;
        const nextSortDirection = params.sortDirection ?? currentState.sortDirection;
        const nextSearchTerm =
          params.search !== undefined ? params.search : currentState.searchTerm;

        const result = await getFilteredCustomers({
          skip: (page - 1) * pageSize,
          limit: pageSize,
          ...(nextSearchTerm ? { search_customer: nextSearchTerm } : {}),
          ...(nextSortBy ? { sortBy: nextSortBy } : {}),
          ...(nextSortDirection ? { sortDirection: nextSortDirection } : {}),
        });

        setCustomers(result?.customers || []);
        setPagination({
          current: page,
          pageSize,
          total: result?.total || 0,
        });
        setSortBy(nextSortBy);
        setSortDirection(nextSortDirection);

        if (params.search !== undefined) {
          setSearchTerm(params.search);
        }

        return result;
      } catch (error) {
        onError?.(error.message || 'Failed to fetch customers');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [onError]
  );

  const refreshData = useCallback(() => {
    const currentState = stateRef.current;

    return fetchCustomers({
      page: currentState.pagination.current,
      pageSize: currentState.pagination.pageSize,
      sortBy: currentState.sortBy,
      sortDirection: currentState.sortDirection,
      search: currentState.searchTerm,
    });
  }, [fetchCustomers]);

  const handlePageChange = useCallback(
    newPageZeroBased => {
      const nextPage = Number(newPageZeroBased) + 1;

      if (!Number.isFinite(nextPage)) {
        return;
      }

      setPagination(current => ({
        ...current,
        current: nextPage,
      }));

      fetchCustomers({ page: nextPage });
    },
    [fetchCustomers]
  );

  const handlePageSizeChange = useCallback(
    newPageSize => {
      const pageSize = Number(newPageSize);

      if (!Number.isFinite(pageSize) || pageSize <= 0) {
        return;
      }

      setPagination(current => ({
        ...current,
        current: 1,
        pageSize,
      }));

      fetchCustomers({ page: 1, pageSize });
    },
    [fetchCustomers]
  );

  const handleSortChange = useCallback(
    (columnKey, direction) => {
      const nextDirection =
        direction ||
        (stateRef.current.sortBy === columnKey && stateRef.current.sortDirection === 'asc'
          ? 'desc'
          : 'asc');

      setSortBy(columnKey);
      setSortDirection(nextDirection);

      fetchCustomers({
        page: 1,
        sortBy: columnKey,
        sortDirection: nextDirection,
      });
    },
    [fetchCustomers]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) {
        return;
      }

      setSearching(true);
      setSearchTerm(value);

      try {
        await fetchCustomers({
          page: 1,
          search: value,
        });
      } catch (error) {
        onError?.(error.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [fetchCustomers, onError]
  );

  const handleEdit = useCallback(
    customer => {
      const customerId = customer?._id;

      if (!customerId) {
        return;
      }

      router.push(`/customers/edit/${customerId}`);
    },
    [router]
  );

  const handleView = useCallback(
    customer => {
      const customerId = customer?._id;

      if (!customerId) {
        return;
      }

      router.push(`/customers/customer-view/${customerId}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback(customer => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedCustomer(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedCustomer?._id) {
      return;
    }

    try {
      await deleteCustomer(selectedCustomer._id);
      onSuccess?.('Customer deleted successfully');
      handleDeleteCancel();
      await refreshData();
    } catch (error) {
      onError?.(error.message || 'Failed to delete customer');
    }
  }, [handleDeleteCancel, onError, onSuccess, refreshData, selectedCustomer]);

  const handleActivateClick = useCallback((customer, anchorEl) => {
    setSelectedCustomer(customer);
    setActivateAnchorEl(anchorEl);
    setActivateDialogOpen(true);
  }, []);

  const handleActivateCancel = useCallback(() => {
    setActivateDialogOpen(false);
    setActivateAnchorEl(null);
    setSelectedCustomer(null);
  }, []);

  const handleActivateConfirm = useCallback(async () => {
    if (!selectedCustomer?._id) {
      return;
    }

    try {
      await activateCustomer(selectedCustomer._id);
      onSuccess?.('Customer activated successfully');
      handleActivateCancel();
      await refreshData();
    } catch (error) {
      onError?.(error.message || 'Failed to activate customer');
    }
  }, [handleActivateCancel, onError, onSuccess, refreshData, selectedCustomer]);

  const handleDeactivateClick = useCallback((customer, anchorEl) => {
    setSelectedCustomer(customer);
    setDeactivateAnchorEl(anchorEl);
    setDeactivateDialogOpen(true);
  }, []);

  const handleDeactivateCancel = useCallback(() => {
    setDeactivateDialogOpen(false);
    setDeactivateAnchorEl(null);
    setSelectedCustomer(null);
  }, []);

  const handleDeactivateConfirm = useCallback(async () => {
    if (!selectedCustomer?._id) {
      return;
    }

    try {
      await deactivateCustomer(selectedCustomer._id);
      onSuccess?.('Customer deactivated successfully');
      handleDeactivateCancel();
      await refreshData();
    } catch (error) {
      onError?.(error.message || 'Failed to deactivate customer');
    }
  }, [handleDeactivateCancel, onError, onSuccess, refreshData, selectedCustomer]);

  const customersWithIndex = useMemo(
    () =>
      customers.map((customer, index) => ({
        ...customer,
        _index: index,
      })),
    [customers]
  );

  return {
    customers: customersWithIndex,
    pagination,
    sortBy,
    sortDirection,
    searchTerm,
    searching,
    loading,
    refreshData,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearchInputChange,
    selectedCustomer,
    deleteDialogOpen,
    activateDialogOpen,
    deactivateDialogOpen,
    activateAnchorEl,
    deactivateAnchorEl,
    handleEdit,
    handleView,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleActivateClick,
    handleActivateConfirm,
    handleActivateCancel,
    handleDeactivateClick,
    handleDeactivateConfirm,
    handleDeactivateCancel,
  };
}
