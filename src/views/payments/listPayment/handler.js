'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import {
  addPayment,
  deletePayment,
  getPaymentDetails,
  getPaymentNumber,
  getPaymentsList,
  setPaymentAsFailed,
  setPaymentAsSuccess,
  updatePayment,
} from '@/app/(dashboard)/payments/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const getSortableValue = (payment, key) => {
  switch (key) {
    case 'amount':
      return Number(payment?.amount || 0);
    case 'payment_date':
      return new Date(payment?.createdAt || '').getTime() || 0;
    case 'customer':
      return String(payment?.customerDetail?.name || '').toLowerCase();
    default:
      return String(payment?.[key] || payment?.payment_number || '').toLowerCase();
  }
};

export function usePaymentListHandler({
  initialPayments = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  initialPaymentNumber = '',
  initialCustomerOptions = [],
  initialErrorMessage = '',
  onError,
  onSuccess,
}) {
  const permissions = {
    canCreate: usePermission('payment', 'create'),
    canUpdate: usePermission('payment', 'update'),
    canView: usePermission('payment', 'view'),
    canDelete: usePermission('payment', 'delete'),
  };

  const [payments, setPayments] = useState(initialPayments);
  const [summary, setSummary] = useState(initialSummary || {});
  const [pagination, setPagination] = useState(initialPagination || DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [paymentNumber, setPaymentNumber] = useState(initialPaymentNumber || '');
  const [customerOptions] = useState(initialCustomerOptions || []);
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: 'error',
  });
  const [dialogState, setDialogState] = useState({
    addOpen: false,
    editOpen: false,
    viewOpen: false,
    deleteOpen: false,
    selectedPaymentId: '',
    selectedPayment: null,
    selectedPaymentData: null,
    detailsLoading: false,
    detailsError: '',
  });

  const loadingRef = useRef(false);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  const stateRef = useRef({ searchTerm: '', pagination });

  useEffect(() => {
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  }, [onError, onSuccess]);

  useEffect(() => {
    stateRef.current = { searchTerm, pagination };
  }, [searchTerm, pagination]);

  const sortedPayments = useMemo(() => {
    if (!sortBy) {
      return payments;
    }

    return [...payments].sort((firstPayment, secondPayment) => {
      const firstValue = getSortableValue(firstPayment, sortBy);
      const secondValue = getSortableValue(secondPayment, sortBy);

      if (firstValue < secondValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }, [payments, sortBy, sortDirection]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const fetchPayments = useCallback(
    async (
      page = stateRef.current.pagination.current,
      pageSize = stateRef.current.pagination.pageSize,
      search = stateRef.current.searchTerm
    ) => {
      if (loadingRef.current) return null;

      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await getPaymentsList(page, pageSize, search);

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch payments');
        }

        setPayments(response.data || []);
        setSummary(response.summary || {});
        setSearchTerm(search);
        setPagination({
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        });

        return response;
      } catch (error) {
        onErrorRef.current?.(error?.message || 'Failed to fetch payments');
        return null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const refreshPaymentNumber = async () => {
    try {
      const response = await getPaymentNumber();

      if (!response?.success || typeof response.data !== 'string') {
        throw new Error(response?.message || 'Failed to load payment number.');
      }

      setPaymentNumber(response.data);
      return response.data;
    } catch (error) {
      showSnackbar(error?.message || 'Failed to load payment number.', 'error');
      return '';
    }
  };

  const openAddDialog = async () => {
    if (!paymentNumber) {
      await refreshPaymentNumber();
    }

    setDialogState(prev => ({
      ...prev,
      addOpen: true,
    }));
  };

  const closeAddDialog = () => {
    setDialogState(prev => ({
      ...prev,
      addOpen: false,
    }));
  };

  const loadPaymentDetails = async (paymentId, mode) => {
    setDialogState(prev => ({
      ...prev,
      selectedPaymentId: paymentId,
      selectedPaymentData: null,
      detailsLoading: true,
      detailsError: '',
      viewOpen: mode === 'view',
      editOpen: mode === 'edit',
    }));

    try {
      const response = await getPaymentDetails(paymentId);

      if (!response?.success || !response.paymentDetails) {
        throw new Error(response?.message || 'Failed to load payment details.');
      }

      setDialogState(prev => ({
        ...prev,
        selectedPaymentData: { paymentDetails: response.paymentDetails },
        detailsLoading: false,
      }));
    } catch (error) {
      const nextMessage = error?.message || 'Failed to load payment details.';

      setDialogState(prev => ({
        ...prev,
        detailsLoading: false,
        detailsError: nextMessage,
      }));

      showSnackbar(nextMessage, 'error');
    }
  };

  const openViewDialog = async paymentId => {
    await loadPaymentDetails(paymentId, 'view');
  };

  const openEditDialog = async paymentId => {
    await loadPaymentDetails(paymentId, 'edit');
  };

  const closeViewDialog = () => {
    setDialogState(prev => ({
      ...prev,
      viewOpen: false,
      selectedPaymentId: '',
      selectedPaymentData: null,
      detailsLoading: false,
      detailsError: '',
    }));
  };

  const closeEditDialog = () => {
    setDialogState(prev => ({
      ...prev,
      editOpen: false,
      selectedPaymentId: '',
      selectedPaymentData: null,
      detailsLoading: false,
      detailsError: '',
    }));
  };

  const openDeleteDialog = useCallback(payment => {
    setDialogState(prev => ({
      ...prev,
      deleteOpen: true,
      selectedPayment: payment,
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      deleteOpen: false,
      selectedPayment: null,
    }));
  }, []);

  const retryDetailsFetch = async () => {
    if (!dialogState.selectedPaymentId) return;

    await loadPaymentDetails(
      dialogState.selectedPaymentId,
      dialogState.editOpen ? 'edit' : 'view'
    );
  };

  const handleAddPayment = async formData => {
    const response = await addPayment(formData);

    if (!response?.success) {
      showSnackbar(response?.message || 'Failed to add payment', 'error');
      return {
        success: false,
        message: response?.message || 'Failed to add payment',
      };
    }

    onSuccessRef.current?.('Payment added successfully!');
    await fetchPayments();
    await refreshPaymentNumber();

    return response;
  };

  const handleUpdatePayment = async formData => {
    if (!dialogState.selectedPaymentId) {
      return {
        success: false,
        message: 'No payment selected for editing.',
      };
    }

    const response = await updatePayment(dialogState.selectedPaymentId, formData);

    if (!response?.success) {
      showSnackbar(response?.message || 'Failed to update payment', 'error');
      return {
        success: false,
        message: response?.message || 'Failed to update payment',
      };
    }

    onSuccessRef.current?.('Payment updated successfully!');
    await fetchPayments();
    return response;
  };

  const executeAction = useCallback(
    async (action, fallbackMessage) => {
      try {
        const result = await action();

        if (result?.success === false) {
          throw new Error(result?.message || 'Action failed');
        }

        onSuccessRef.current?.(result?.message || fallbackMessage);
        await fetchPayments();
        return result;
      } catch (error) {
        onErrorRef.current?.(error.message || 'Action failed');
        return null;
      }
    },
    [fetchPayments]
  );

  const handleSetAsSuccess = useCallback(
    id => executeAction(() => setPaymentAsSuccess(id), 'Payment set to success successfully'),
    [executeAction]
  );

  const handleSetAsFailed = useCallback(
    id => executeAction(() => setPaymentAsFailed(id), 'Payment set to failed successfully'),
    [executeAction]
  );

  const handleDeleteConfirm = useCallback(async () => {
    const paymentId = dialogState.selectedPayment?._id;

    if (!paymentId) {
      return;
    }

    try {
      const response = await deletePayment(paymentId);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete payment');
      }

      onSuccessRef.current?.('Payment deleted successfully!');
      closeDeleteDialog();
      await fetchPayments();
    } catch (error) {
      onErrorRef.current?.(error?.message || 'Failed to delete payment');
    }
  }, [closeDeleteDialog, dialogState.selectedPayment, fetchPayments]);

  const handlePageChange = useCallback(
    pageZeroBased => {
      const nextPage = Number(pageZeroBased) + 1;
      if (!Number.isFinite(nextPage)) return;
      fetchPayments(nextPage, stateRef.current.pagination.pageSize);
    },
    [fetchPayments]
  );

  const handlePageSizeChange = useCallback(
    pageSize => {
      const nextSize = Number(pageSize);
      if (!Number.isFinite(nextSize)) return;
      fetchPayments(1, nextSize);
    },
    [fetchPayments]
  );

  const handleSortRequest = useCallback((columnKey, direction) => {
    const nextDirection =
      direction || (sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc');

    setSortBy(columnKey);
    setSortDirection(nextDirection);

    return {
      sortBy: columnKey,
      sortDirection: nextDirection,
    };
  }, [sortBy, sortDirection]);

  const handleSearchInputChange = useCallback(
    searchValue => {
      const nextValue = String(searchValue ?? '');
      if (nextValue === stateRef.current.searchTerm) return;

      setSearchTerm(nextValue);
      fetchPayments(1, stateRef.current.pagination.pageSize, nextValue);
    },
    [fetchPayments]
  );

  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  return {
    permissions,
    payments: sortedPayments,
    summary,
    pagination,
    loading,
    searchTerm,
    sortBy,
    sortDirection,
    paymentNumber,
    customerOptions,
    dialogState,
    snackbar,
    openAddDialog,
    closeAddDialog,
    openViewDialog,
    closeViewDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    handleDeleteConfirm,
    retryDetailsFetch,
    handleAddPayment,
    handleUpdatePayment,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleSetAsSuccess,
    handleSetAsFailed,
    closeSnackbar,
  };
}
