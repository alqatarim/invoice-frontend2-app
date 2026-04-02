'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/Auth/usePermission';
import { getFilteredPaymentSummaries } from '@/app/(dashboard)/payment-summary/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

export function usePaymentSummaryListHandler({
  initialPaymentSummaries = [],
  initialPagination = DEFAULT_PAGINATION,
  initialErrorMessage = '',
}) {
  const router = useRouter();

  const permissions = {
    canView: usePermission('paymentSummary', 'view'),
    canExport: usePermission('paymentSummary', 'export'),
  };

  const [paymentSummaries, setPaymentSummaries] = useState(initialPaymentSummaries);
  const [pagination, setPagination] = useState(initialPagination || DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
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

  const filteredPaymentSummaries = useMemo(() => {
    const normalizedSearch = String(searchTerm || '').trim().toLowerCase();

    if (!normalizedSearch) {
      return paymentSummaries;
    }

    return paymentSummaries.filter((payment) =>
      [
        payment?.payment_number,
        payment?.invoiceNumber,
        payment?.customerDetail?.name,
        payment?.customerDetail?.phone,
        payment?.customerDetail?.email,
        payment?.payment_method,
        payment?.status,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch))
    );
  }, [paymentSummaries, searchTerm]);

  const cardCounts = useMemo(
    () => ({
      totalPaid: {
        count: paymentSummaries.filter(
          (payment) => payment.status === 'Success' || payment.status === 'PAID'
        ).length,
        total_sum: paymentSummaries
          .filter((payment) => payment.status === 'Success' || payment.status === 'PAID')
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
      },
      totalRefund: {
        count: paymentSummaries.filter((payment) => payment.status === 'REFUND').length,
        total_sum: paymentSummaries
          .filter((payment) => payment.status === 'REFUND')
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
      },
      totalFailed: {
        count: paymentSummaries.filter((payment) => payment.status === 'Failed').length,
        total_sum: paymentSummaries
          .filter((payment) => payment.status === 'Failed')
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0),
      },
      totalPayments: {
        count: paymentSummaries.length,
        total_sum: paymentSummaries.reduce(
          (sum, payment) => sum + (Number(payment.amount) || 0),
          0
        ),
      },
    }),
    [paymentSummaries]
  );

  const refreshPaymentSummaries = useCallback(
    async ({ page = pagination.current, pageSize = pagination.pageSize } = {}) => {
      setLoading(true);

      try {
        const response = await getFilteredPaymentSummaries(page, pageSize, {});
        const nextPaymentSummaries = response?.payments || [];

        setPaymentSummaries(nextPaymentSummaries);
        setPagination(
          response?.pagination || {
            current: page,
            pageSize,
            total: nextPaymentSummaries.length,
          }
        );
      } catch (error) {
        showSnackbar(error?.message || 'Failed to load payment summaries', 'error');
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, showSnackbar]
  );

  const handlePageChange = useCallback(
    async (page) => {
      if (typeof page !== 'number') {
        return;
      }

      await refreshPaymentSummaries({ page: page + 1 });
    },
    [refreshPaymentSummaries]
  );

  const handlePageSizeChange = useCallback(
    async (pageSize) => {
      if (typeof pageSize !== 'number') {
        return;
      }

      await refreshPaymentSummaries({ page: 1, pageSize });
    },
    [refreshPaymentSummaries]
  );

  const handleView = useCallback(
    (paymentId) => {
      router.push(`/payment-summary/payment-summary-view/${paymentId}`);
    },
    [router]
  );

  const handleExport = useCallback(() => {
    showSnackbar('Export functionality not yet implemented', 'info');
  }, [showSnackbar]);

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
    paymentSummaries: filteredPaymentSummaries,
    pagination,
    loading,
    searchTerm,
    cardCounts,
    snackbar,
    setSearchTerm,
    handlePageChange,
    handlePageSizeChange,
    handleView,
    handleExport,
    closeSnackbar,
  };
}
