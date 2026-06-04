'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import {
  convertToInvoice,
  deleteDeliveryChallan,
  getFilteredDeliveryChallans,
} from '@/app/(dashboard)/deliveryChallans/actions';
import { getDeliveryChallanColumns } from './deliveryChallanColumns';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const SUCCESS_MESSAGES = {
  add: 'Delivery challan added successfully!',
  edit: 'Delivery challan updated successfully!',
  delete: 'Delivery challan deleted successfully!',
  convert: 'Delivery challan converted to invoice successfully!',
};

export function useDeliveryChallanListHandler({
  initialDeliveryChallans = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  initialErrorMessage = '',
  onError,
  onSuccess,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = useTheme();

  const canCreate = usePermission('deliveryChallan', 'create');
  const canUpdate = usePermission('deliveryChallan', 'update');
  const canView = usePermission('deliveryChallan', 'view');
  const canDelete = usePermission('deliveryChallan', 'delete');

  const permissions = useMemo(
    () => ({
      canCreate,
      canUpdate,
      canView,
      canDelete,
    }),
    [canCreate, canUpdate, canView, canDelete]
  );

  const [deliveryChallans, setDeliveryChallans] = useState(initialDeliveryChallans);
  const [summary, setSummary] = useState(initialSummary || {});
  const [pagination, setPagination] = useState(initialPagination || DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedDeliveryChallan, setSelectedDeliveryChallan] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  const loadingRef = useRef(false);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  const stateRef = useRef({ pagination, searchTerm });

  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onError, onSuccess]);

  useEffect(() => {
    stateRef.current = { pagination, searchTerm };
  }, [pagination, searchTerm]);

  useEffect(() => {
    setDeliveryChallans(initialDeliveryChallans);
    setSummary(initialSummary || {});
    setPagination(initialPagination || DEFAULT_PAGINATION);
  }, [initialDeliveryChallans, initialPagination, initialSummary]);

  useEffect(() => {
    if (initialErrorMessage) {
      onErrorRef.current?.(initialErrorMessage);
    }
  }, [initialErrorMessage]);

  const refreshDeliveryChallans = useCallback(
    async ({
      page = stateRef.current.pagination.current,
      pageSize = stateRef.current.pagination.pageSize,
      search = stateRef.current.searchTerm,
    } = {}) => {
      if (loadingRef.current) return null;
      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await getFilteredDeliveryChallans(page, pageSize, { search });
        const nextDeliveryChallans = response?.deliveryChallans || [];

        setDeliveryChallans(nextDeliveryChallans);
        setSummary(response?.summary || {});
        setSearchTerm(search);
        setPagination(
          response?.pagination || {
            current: page,
            pageSize,
            total: nextDeliveryChallans.length,
          }
        );

        return response;
      } catch (error) {
        onErrorRef.current?.(error?.message || 'Failed to load delivery challans');
        return null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    const successParam = searchParams.get('success');

    if (successParam) {
      refreshDeliveryChallans();
    }

    if (!successParam || !SUCCESS_MESSAGES[successParam]) {
      return;
    }

    onSuccessRef.current?.(SUCCESS_MESSAGES[successParam]);
    router.replace(pathname);
  }, [pathname, refreshDeliveryChallans, router, searchParams]);

  const columns = useMemo(
    () => getDeliveryChallanColumns({ theme, permissions }),
    [theme, permissions]
  );

  const handleView = useCallback(
    (deliveryChallanId) => {
      router.push(`/deliveryChallans/deliveryChallans-view/${deliveryChallanId}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (deliveryChallanId) => {
      router.push(`/deliveryChallans/deliveryChallans-edit/${deliveryChallanId}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((deliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedDeliveryChallan(null);
  }, []);

  const handleConvertClick = useCallback((deliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setConvertDialogOpen(true);
  }, []);

  const closeConvertDialog = useCallback(() => {
    setConvertDialogOpen(false);
    setSelectedDeliveryChallan(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedDeliveryChallan?._id) {
      return;
    }

    try {
      setLoadingAction(true);

      const response = await deleteDeliveryChallan(selectedDeliveryChallan._id);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete delivery challan');
      }

      onSuccessRef.current?.(response.message || 'Delivery challan deleted successfully!');
      handleDeleteCancel();
      await refreshDeliveryChallans();
    } catch (error) {
      onErrorRef.current?.(
        error?.message || 'Failed to delete delivery challan'
      );
    } finally {
      setLoadingAction(false);
    }
  }, [handleDeleteCancel, refreshDeliveryChallans, selectedDeliveryChallan]);

  const handleConvertConfirm = useCallback(async () => {
    if (!selectedDeliveryChallan?._id) {
      return;
    }

    try {
      setLoadingAction(true);

      const response = await convertToInvoice(selectedDeliveryChallan);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to convert delivery challan to invoice');
      }

      onSuccessRef.current?.(
        response.message || 'Delivery challan converted to invoice successfully!'
      );
      closeConvertDialog();
      await refreshDeliveryChallans();
    } catch (error) {
      onErrorRef.current?.(
        error?.message || 'Failed to convert delivery challan'
      );
    } finally {
      setLoadingAction(false);
    }
  }, [closeConvertDialog, refreshDeliveryChallans, selectedDeliveryChallan]);

  const handlePageChange = useCallback(
    async (page) => {
      if (typeof page !== 'number') {
        return;
      }

      await refreshDeliveryChallans({ page: page + 1 });
    },
    [refreshDeliveryChallans]
  );

  const handlePageSizeChange = useCallback(
    async (pageSize) => {
      if (typeof pageSize !== 'number') {
        return;
      }

      await refreshDeliveryChallans({ page: 1, pageSize });
    },
    [refreshDeliveryChallans]
  );

  const handleSearchInputChange = useCallback(
    (value) => {
      const nextValue = String(value ?? '');
      if (nextValue === stateRef.current.searchTerm) return;

      refreshDeliveryChallans({ page: 1, search: nextValue });
    },
    [refreshDeliveryChallans]
  );

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDeleteClick,
      handleView,
      handleEdit,
      handleConvertClick,
      permissions,
    };

    return columns.map((col) => ({
      ...col,
      renderCell: col.renderCell
        ? (row, index) => col.renderCell(row, cellHandlers, index)
        : undefined,
    }));
  }, [columns, handleConvertClick, handleDeleteClick, handleEdit, handleView, permissions]);

  return {
    permissions,
    deliveryChallans,
    summary,
    pagination,
    loading,
    loadingAction,
    searchTerm,
    deleteDialogOpen,
    convertDialogOpen,
    selectedDeliveryChallan,
    tableColumns,
    handleSearchInputChange,
    handlePageChange,
    handlePageSizeChange,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleConvertClick,
    closeConvertDialog,
    handleConvertConfirm,
  };
}
