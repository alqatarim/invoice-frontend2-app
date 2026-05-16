'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addPurchaseOrder,
  clonePurchaseOrder,
  convertToPurchase,
  getFilteredPurchaseOrders,
  printDownloadPurchaseOrder,
} from '@/app/(dashboard)/purchase-orders/actions';

function usePurchaseOrderListData({
  initialPurchaseOrders = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
}) {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [pagination, setPagination] = useState(() => {
    const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
    if (initialPurchaseOrders.length > 0 && basePagination.total === 0) {
      return { ...basePagination, total: initialPurchaseOrders.length };
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
  const [fullDataset, setFullDataset] = useState(initialPurchaseOrders);
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
        sortBy = sorting.sortBy,
        sortDirection = sorting.sortDirection,
      } = params;

      setLoading(true);
      try {
        const result = await getFilteredPurchaseOrders('ALL', page, pageSize, {}, sortBy, sortDirection);

        setPurchaseOrders(result.purchaseOrders);
        setPagination(result.pagination);
        setSorting({ sortBy, sortDirection });
        setFullDataset(result.purchaseOrders);

        return result;
      } catch (error) {
        console.error('fetchData error:', error);
        onError?.(error.message || 'Failed to fetch purchase orders');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [onError, pagination.current, pagination.pageSize, sorting.sortBy, sorting.sortDirection]
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
        const dataToFilter = fullDataset.length > 0 ? fullDataset : purchaseOrders;

        if (value.trim() === '') {
          setPurchaseOrders(dataToFilter);
          setPagination(previous => ({
            ...previous,
            current: 1,
            total: dataToFilter.length,
          }));
        } else {
          const filtered = dataToFilter.filter(item =>
            item.purchaseOrderId?.toLowerCase().includes(value.toLowerCase()) ||
            item.vendorInfo?.vendor_name?.toLowerCase().includes(value.toLowerCase()) ||
            item.vendorInfo?.phone?.includes(value) ||
            item.notes?.toLowerCase().includes(value.toLowerCase())
          );

          setPurchaseOrders(filtered);
          setPagination(previous => ({
            ...previous,
            current: 1,
            total: filtered.length,
          }));
        }
      } catch (error) {
        console.error('Error searching purchase orders:', error);
        onError?.(error.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [fullDataset, onError, purchaseOrders]
  );

  return {
    purchaseOrders,
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

function useConvertDialog({ handleConvertToPurchase, onError, onSuccess }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    purchaseOrder: null,
  });

  const openConvertDialog = useCallback(purchaseOrder => {
    setDialogState({ open: true, purchaseOrder });
  }, []);

  const closeConvertDialog = useCallback(() => {
    setDialogState({ open: false, purchaseOrder: null });
  }, []);

  const confirmConvertToPurchase = useCallback(async () => {
    const { purchaseOrder } = dialogState;
    if (!purchaseOrder) return;

    try {
      await handleConvertToPurchase(purchaseOrder.id || purchaseOrder._id);
      closeConvertDialog();
      onSuccess?.('Purchase order converted to purchase successfully.');
    } catch (error) {
      onError?.(error.message || 'Failed to convert purchase order to purchase.');
    }
  }, [closeConvertDialog, dialogState, handleConvertToPurchase, onError, onSuccess]);

  return {
    convertDialogOpen: dialogState.open,
    openConvertDialog,
    closeConvertDialog,
    confirmConvertToPurchase,
  };
}

function usePurchaseOrderListActions({ onSuccess, onError, fetchData, pagination }) {
  const router = useRouter();

  const handleView = useCallback(
    id => {
      if (!id) return;
      router.push(`/purchase-orders/order-view/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/purchase-orders/order-edit/${id}`);
    },
    [router]
  );

  const executeAction = useCallback(
    async (action, successMessage, shouldRefresh = false) => {
      try {
        const result = await action();
        onSuccess?.(successMessage);
        if (shouldRefresh) {
          await fetchData({ page: pagination?.current });
        }
        return result;
      } catch (error) {
        onError?.(error.message || 'Action failed');
        throw error;
      }
    },
    [fetchData, onError, onSuccess, pagination?.current]
  );

  const handleClone = useCallback(
    id =>
      executeAction(() => clonePurchaseOrder(id), 'Purchase order cloned successfully!', true),
    [executeAction]
  );

  const handleSend = useCallback(
    id => executeAction(() => addPurchaseOrder(id), 'Purchase order sent successfully!'),
    [executeAction]
  );

  const handleConvertToPurchase = useCallback(
    id =>
      executeAction(() => convertToPurchase(id), 'Purchase order converted to purchase successfully!', true),
    [executeAction]
  );

  const handlePrintDownload = useCallback(
    async id => {
      try {
        const pdfUrl = await printDownloadPurchaseOrder(id);
        window.open(pdfUrl, '_blank');
        onSuccess?.('Purchase order is being prepared for download.');
      } catch (error) {
        onError?.(error.message || 'Failed to download purchase order.');
      }
    },
    [onError, onSuccess]
  );

  return {
    handleView,
    handleEdit,
    handleClone,
    handleSend,
    handleConvertToPurchase,
    handlePrintDownload,
  };
}

export function usePurchaseOrderListHandlers(options = {}) {
  const data = usePurchaseOrderListData(options);
  const actions = usePurchaseOrderListActions({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
  });
  const convertDialog = useConvertDialog({
    handleConvertToPurchase: actions.handleConvertToPurchase,
    onError: options.onError,
    onSuccess: options.onSuccess,
  });

  return useMemo(
    () => ({
      ...data,
      ...actions,
      ...convertDialog,
    }),
    [actions, convertDialog, data]
  );
}
