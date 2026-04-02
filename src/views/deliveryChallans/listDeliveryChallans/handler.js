'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePermission } from '@/Auth/usePermission';
import {
  convertToInvoice,
  deleteDeliveryChallan,
  getFilteredDeliveryChallans,
} from '@/app/(dashboard)/deliveryChallans/actions';

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
  initialErrorMessage = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const permissions = {
    canCreate: usePermission('deliveryChallan', 'create'),
    canUpdate: usePermission('deliveryChallan', 'update'),
    canView: usePermission('deliveryChallan', 'view'),
    canDelete: usePermission('deliveryChallan', 'delete'),
  };

  const [deliveryChallans, setDeliveryChallans] = useState(initialDeliveryChallans);
  const [pagination, setPagination] = useState(initialPagination || DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedDeliveryChallan, setSelectedDeliveryChallan] = useState(null);
  const [dialogState, setDialogState] = useState({
    deleteOpen: false,
    convertOpen: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  useEffect(() => {
    const successParam = searchParams.get('success');

    if (!successParam || !SUCCESS_MESSAGES[successParam]) {
      return;
    }

    showSnackbar(SUCCESS_MESSAGES[successParam]);
    router.replace(pathname);
  }, [pathname, router, searchParams, showSnackbar]);

  const refreshDeliveryChallans = useCallback(
    async ({ page = pagination.current, pageSize = pagination.pageSize } = {}) => {
      setLoading(true);

      try {
        const response = await getFilteredDeliveryChallans(page, pageSize, {});
        const nextDeliveryChallans = response?.deliveryChallans || [];

        setDeliveryChallans(nextDeliveryChallans);
        setPagination(
          response?.pagination || {
            current: page,
            pageSize,
            total: nextDeliveryChallans.length,
          }
        );

        return response;
      } catch (error) {
        showSnackbar(error?.message || 'Failed to load delivery challans', 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, showSnackbar]
  );

  const filteredDeliveryChallans = useMemo(() => {
    const normalizedSearch = String(searchTerm || '').trim().toLowerCase();

    if (!normalizedSearch) {
      return deliveryChallans;
    }

    return deliveryChallans.filter((challan) =>
      [
        challan?.challanNumber,
        challan?.deliveryChallanNumber,
        challan?.customerId?.name,
        challan?.customerId?.phone,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
    );
  }, [deliveryChallans, searchTerm]);

  const cardCounts = useMemo(
    () => ({
      totalActive: {
        count: deliveryChallans.filter((challan) => challan.status === 'ACTIVE').length,
        total_sum: deliveryChallans
          .filter((challan) => challan.status === 'ACTIVE')
          .reduce((sum, challan) => sum + (Number(challan.TotalAmount) || 0), 0),
      },
      totalConverted: {
        count: deliveryChallans.filter((challan) => challan.status === 'CONVERTED').length,
        total_sum: deliveryChallans
          .filter((challan) => challan.status === 'CONVERTED')
          .reduce((sum, challan) => sum + (Number(challan.TotalAmount) || 0), 0),
      },
      totalCancelled: {
        count: deliveryChallans.filter((challan) => challan.status === 'CANCELLED').length,
        total_sum: deliveryChallans
          .filter((challan) => challan.status === 'CANCELLED')
          .reduce((sum, challan) => sum + (Number(challan.TotalAmount) || 0), 0),
      },
      totalDeliveryChallans: {
        count: deliveryChallans.length,
        total_sum: deliveryChallans.reduce(
          (sum, challan) => sum + (Number(challan.TotalAmount) || 0),
          0
        ),
      },
    }),
    [deliveryChallans]
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

  const openDeleteDialog = useCallback((deliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setDialogState((prev) => ({ ...prev, deleteOpen: true }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, deleteOpen: false }));
    setSelectedDeliveryChallan(null);
  }, []);

  const openConvertDialog = useCallback((deliveryChallan) => {
    setSelectedDeliveryChallan(deliveryChallan);
    setDialogState((prev) => ({ ...prev, convertOpen: true }));
  }, []);

  const closeConvertDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, convertOpen: false }));
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

      setDeliveryChallans((prev) =>
        prev.filter((challan) => challan._id !== selectedDeliveryChallan._id)
      );
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      showSnackbar('Delivery challan deleted successfully!');
      closeDeleteDialog();
    } catch (error) {
      showSnackbar(
        `Failed to delete delivery challan: ${error?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoadingAction(false);
    }
  }, [closeDeleteDialog, selectedDeliveryChallan, showSnackbar]);

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

      setDeliveryChallans((prev) =>
        prev.map((challan) =>
          challan._id === selectedDeliveryChallan._id
            ? { ...challan, status: 'CONVERTED' }
            : challan
        )
      );
      showSnackbar('Delivery challan converted to invoice successfully!');
      closeConvertDialog();
    } catch (error) {
      showSnackbar(
        `Failed to convert delivery challan: ${error?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setLoadingAction(false);
    }
  }, [closeConvertDialog, selectedDeliveryChallan, showSnackbar]);

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

  const closeSnackbar = useCallback((_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    permissions,
    deliveryChallans: filteredDeliveryChallans,
    pagination,
    loading,
    loadingAction,
    searchTerm,
    snackbar,
    dialogState,
    cardCounts,
    setSearchTerm,
    handlePageChange,
    handlePageSizeChange,
    handleView,
    handleEdit,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    openConvertDialog,
    closeConvertDialog,
    handleConvertConfirm,
    closeSnackbar,
  };
}
