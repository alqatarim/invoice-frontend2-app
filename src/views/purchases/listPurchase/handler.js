'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePurchase, getPurchaseList } from '@/app/(dashboard)/purchases/actions';

function usePurchaseListData({
  initialPurchases = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
}) {
  const [purchases, setPurchases] = useState(initialPurchases);
  const [pagination, setPagination] = useState(() => {
    const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
    if (initialPurchases.length > 0 && basePagination.total === 0) {
      return { ...basePagination, total: initialPurchases.length };
    }
    return basePagination;
  });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [fullDataset, setFullDataset] = useState(initialPurchases);
  const loadingRef = useRef(false);
  const stateRef = useRef({
    searchTerm: '',
  });

  useEffect(() => {
    stateRef.current.searchTerm = searchTerm;
  }, [searchTerm]);

  const fetchData = useCallback(
    async (params = {}) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const {
        page = pagination.current,
        pageSize = pagination.pageSize,
        search = stateRef.current.searchTerm,
      } = params;

      setLoading(true);
      try {
        const response = await getPurchaseList(page, pageSize, search, {});

        if (!response.success) {
          throw new Error(response.message);
        }

        setPurchases(response.data);
        setPagination({
          current: page,
          pageSize,
          total: response.totalRecords,
        });
        setFullDataset(response.data);
        setSearchTerm(search);

        return {
          purchases: response.data,
          pagination: { current: page, pageSize, total: response.totalRecords },
        };
      } catch (error) {
        console.error('fetchData error:', error);
        onError?.(error.message || 'Failed to fetch purchases');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [pagination.current, pagination.pageSize, onError]
  );

  const handlePageChange = useCallback(
    (eventOrPage, maybePage) => {
      const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
      if (typeof nextPage !== 'number') return;
      fetchData({ page: nextPage + 1 });
    },
    [fetchData]
  );

  const handlePageSizeChange = useCallback(
    eventOrSize => {
      const nextSize =
        typeof eventOrSize === 'number' ? eventOrSize : parseInt(eventOrSize.target.value, 10);
      if (!Number.isFinite(nextSize)) return;
      fetchData({ page: 1, pageSize: nextSize });
    },
    [fetchData]
  );

  const handleSortRequest = useCallback(
    (columnKey, direction) => {
      const nextDirection =
        direction || (sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc');

      setSorting({ sortBy: columnKey, sortDirection: nextDirection });
      fetchData({ page: 1, sortBy: columnKey, sortDirection: nextDirection });

      return { sortBy: columnKey, sortDirection: nextDirection };
    },
    [sorting.sortBy, sorting.sortDirection, fetchData]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      if (value === stateRef.current.searchTerm) return;

      setSearching(true);
      setSearchTerm(value);

      try {
        await fetchData({ page: 1, search: value });
      } catch (error) {
        console.error('Error searching purchases:', error);
        onError?.(error.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [fetchData, onError]
  );

  return {
    purchases,
    pagination,
    loading,
    sortBy: sorting.sortBy,
    sortDirection: sorting.sortDirection,
    searchTerm,
    searching,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
  };
}

function usePurchaseListActions({ onSuccess, onError, fetchData, pagination }) {
  const router = useRouter();

  const handleView = useCallback(
    id => {
      if (!id) return;
      router.push(`/purchases/purchase-view/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/purchases/purchase-edit/${id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    async id => {
      try {
        const result = await deletePurchase(id);
        if (!result.success) {
          throw new Error(result.message);
        }

        onSuccess?.('Purchase deleted successfully!');
        await fetchData({ page: pagination?.current });
        return result;
      } catch (error) {
        onError?.(error.message || 'Failed to delete purchase');
        throw error;
      }
    },
    [fetchData, onError, onSuccess, pagination?.current]
  );

  const handlePrintDownload = useCallback(
    async id => {
      try {
        window.open(`/purchases/purchase-view/${id}?print=true`, '_blank');
        onSuccess?.('Purchase is being prepared for download.');
      } catch (error) {
        onError?.(error.message || 'Failed to download purchase.');
      }
    },
    [onError, onSuccess]
  );

  return {
    handleView,
    handleEdit,
    handleDelete,
    handlePrintDownload,
  };
}

export function usePurchaseListHandlers(options = {}) {
  const data = usePurchaseListData(options);
  const actions = usePurchaseListActions({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
  });

  return useMemo(
    () => ({
      ...data,
      ...actions,
    }),
    [actions, data]
  );
}
