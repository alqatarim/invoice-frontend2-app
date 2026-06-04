'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  clonePurchaseOrder,
  convertToPurchase,
  deletePurchaseOrder,
  getFilteredPurchaseOrders,
  getPurchaseOrderStats,
  printDownloadPurchaseOrder,
  updatePurchaseOrderStatus,
} from '@/app/(dashboard)/purchase-orders/actions';
import { purchaseOrderStatusDefinitions } from '@/data/dataSets';

export const normalizePurchaseOrderStatus = (status = '') => {
  const normalized = String(status || '').trim().toUpperCase();
  return normalized || 'Draft';
};

export const getPurchaseOrderStatusOption = status => {
  const normalized = normalizePurchaseOrderStatus(status);
  return (
    purchaseOrderStatusDefinitions.find(item => item.value === normalized) || {
      value: normalized,
      label: 'Unknown',
      color: 'default',
      icon: 'mdi:help-circle-outline',
    }
  );
};

function usePurchaseOrderListData({
  initialPurchaseOrders = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCardCounts = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
}) {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [cardCounts, setCardCounts] = useState(initialCardCounts);
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
  const onErrorRef = useRef(onError);
  const stateRef = useRef({
    searchTerm: '',
    pagination,
    sorting,
  });

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sorting,
    };
  }, [searchTerm, pagination, sorting]);

  const fetchData = useCallback(
    async (params = {}) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const {
        page = stateRef.current.pagination.current,
        pageSize = stateRef.current.pagination.pageSize,
        sortBy = stateRef.current.sorting.sortBy,
        sortDirection = stateRef.current.sorting.sortDirection,
        search = stateRef.current.searchTerm,
      } = params;

      setLoading(true);
      try {
        const result = await getFilteredPurchaseOrders('ALL', page, pageSize, { search }, sortBy, sortDirection);

        setPurchaseOrders(result.purchaseOrders);
        setPagination(result.pagination);
        setSorting({ sortBy, sortDirection });
        setFullDataset(result.purchaseOrders);
        setSearchTerm(search);

        return result;
      } catch (error) {
        console.error('fetchData error:', error);
        onErrorRef.current?.(error.message || 'Failed to fetch purchase orders');
        throw error;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
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
      const { sorting: currentSorting } = stateRef.current;
      const nextDirection =
        direction || (currentSorting.sortBy === columnKey && currentSorting.sortDirection === 'asc' ? 'desc' : 'asc');

      setSorting({ sortBy: columnKey, sortDirection: nextDirection });
      fetchData({ page: 1, sortBy: columnKey, sortDirection: nextDirection });

      return { sortBy: columnKey, sortDirection: nextDirection };
    },
    [fetchData]
  );

  const handleSearchInputChange = useCallback(
    async value => {
      const nextValue = String(value ?? '');
      if (nextValue === stateRef.current.searchTerm) return;

      setSearching(true);
      setSearchTerm(nextValue);

      try {
        await fetchData({ page: 1, search: nextValue });
      } catch (error) {
        console.error('Error searching purchase orders:', error);
        onErrorRef.current?.(error.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    },
    [fetchData]
  );

  const refreshCardCounts = useCallback(async () => {
    const response = await getPurchaseOrderStats();

    if (response?.success) {
      setCardCounts(response.data || {});
    }

    return response;
  }, []);

  return {
    purchaseOrders,
    cardCounts,
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
    refreshCardCounts,
  };
}

function useConvertDialog({ handleConvertToPurchase, onError }) {
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
    } catch (error) {
      onError?.(error.message || 'Failed to convert purchase order to purchase.');
    }
  }, [closeConvertDialog, dialogState, handleConvertToPurchase, onError]);

  return {
    convertDialogOpen: dialogState.open,
    openConvertDialog,
    closeConvertDialog,
    confirmConvertToPurchase,
  };
}

function usePurchaseOrderListActions({ onSuccess, onError, fetchData, refreshCardCounts, pagination }) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

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
    async (action, fallbackMessage, shouldRefresh = false) => {
      try {
        const result = await action();

        if (result?.success === false) {
          throw new Error(result?.message || 'Action failed');
        }

        onSuccess?.(result?.message || fallbackMessage);
        if (shouldRefresh) {
          await fetchData({ page: pagination?.current });
          await refreshCardCounts?.();
        }
        return result;
      } catch (error) {
        onError?.(error.message || 'Action failed');
        throw error;
      }
    },
    [fetchData, onError, onSuccess, pagination?.current, refreshCardCounts]
  );

  const handleClone = useCallback(
    id =>
      executeAction(() => clonePurchaseOrder(id), 'Purchase order cloned successfully!', true),
    [executeAction]
  );

  const handleConvertToPurchase = useCallback(
    id =>
      executeAction(
        () => convertToPurchase(id),
        'Purchase order converted to purchase successfully!',
        true
      ),
    [executeAction]
  );

  const handleStatusChange = useCallback(
    (id, status) =>
      executeAction(
        async () => {
          const result = await updatePurchaseOrderStatus(id, status);
          if (!result?.success) {
            throw new Error(result?.message || 'Failed to update purchase order status.');
          }
          return result;
        },
        'Purchase order status updated successfully.',
        true
      ),
    [executeAction]
  );

  const handleSubmitForApproval = useCallback(
    id =>
      executeAction(
        async () => {
          const result = await updatePurchaseOrderStatus(id, 'PENDING_APPROVAL');
          if (!result?.success) {
            throw new Error(result?.message || 'Failed to submit purchase order for approval.');
          }
          return result;
        },
        'Purchase order submitted for approval successfully.',
        true
      ),
    [executeAction]
  );

  const handleDeleteClick = useCallback(purchaseOrder => {
    setSelectedPurchaseOrder(purchaseOrder);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedPurchaseOrder(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedPurchaseOrder?._id) return;

    try {
      const response = await deletePurchaseOrder(selectedPurchaseOrder._id);

      if (response.success) {
        onSuccess?.(response.message || 'Purchase order deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedPurchaseOrder(null);
        await fetchData({ page: pagination?.current });
        await refreshCardCounts?.();
        return;
      }

      throw new Error(response.message || 'Failed to delete purchase order');
    } catch (error) {
      onError?.(error.message || 'Failed to delete purchase order');
    }
  }, [fetchData, onError, onSuccess, pagination?.current, refreshCardCounts, selectedPurchaseOrder]);

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
    handleConvertToPurchase,
    handleStatusChange,
    handleSubmitForApproval,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    deleteDialogOpen,
    selectedPurchaseOrder,
    handlePrintDownload,
  };
}

export function usePurchaseOrderListHandlers(options = {}) {
  const data = usePurchaseOrderListData(options);
  const actions = usePurchaseOrderListActions({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    refreshCardCounts: data.refreshCardCounts,
    pagination: data.pagination,
  });
  const convertDialog = useConvertDialog({
    handleConvertToPurchase: actions.handleConvertToPurchase,
    onError: options.onError,
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
