'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import {
  cloneQuotation,
  convertToInvoice,
  deleteQuotation,
  getQuotationsList,
} from '@/app/(dashboard)/quotations/actions';
import { getQuotationColumns } from './quotationColumns';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

function useQuotationListData({
  initialQuotations = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
}) {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [summary, setSummary] = useState(initialSummary);
  const [pagination, setPagination] = useState({
    current: initialPagination?.current || 1,
    pageSize: initialPagination?.pageSize || 10,
    total: initialPagination?.total || 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);
  const onErrorRef = useRef(onError);
  const stateRef = useRef({ searchTerm: '', pagination });

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    stateRef.current = { searchTerm, pagination };
  }, [searchTerm, pagination]);

  const fetchQuotations = useCallback(
    async ({
      page = stateRef.current.pagination.current,
      pageSize = stateRef.current.pagination.pageSize,
      search = stateRef.current.searchTerm,
    } = {}) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await getQuotationsList(page, pageSize, { search });

        if (response?.success) {
          setQuotations(response.data || []);
          setSummary(response.summary || {});
          setPagination({
            current: page,
            pageSize,
            total: response.totalRecords || 0,
          });
          setSearchTerm(search);
        } else {
          onErrorRef.current?.(response?.message || 'Failed to load quotations');
        }
      } catch (error) {
        onErrorRef.current?.(error.message || 'Failed to load quotations');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const handlePageChange = useCallback(
    pageZeroBased => {
      const nextPage = Number(pageZeroBased) + 1;
      if (!Number.isFinite(nextPage)) return;
      fetchQuotations({ page: nextPage, pageSize: stateRef.current.pagination.pageSize });
    },
    [fetchQuotations]
  );

  const handlePageSizeChange = useCallback(
    pageSize => {
      const nextSize = Number(pageSize);
      if (!Number.isFinite(nextSize)) return;
      fetchQuotations({ page: 1, pageSize: nextSize });
    },
    [fetchQuotations]
  );

  const handleSearchInputChange = useCallback(
    searchValue => {
      const nextValue = String(searchValue ?? '');
      if (nextValue === stateRef.current.searchTerm) return;

      setSearchTerm(nextValue);
      fetchQuotations({ page: 1, search: nextValue });
    },
    [fetchQuotations]
  );

  return {
    quotations,
    summary,
    pagination,
    loading,
    searchTerm,
    fetchQuotations,
    handlePageChange,
    handlePageSizeChange,
    handleSearchInputChange,
  };
}

function useConvertDialog({ handleConvertToInvoice, onError }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    quotation: null,
  });

  const openConvertDialog = useCallback(quotation => {
    setDialogState({
      open: true,
      quotation,
    });
  }, []);

  const closeConvertDialog = useCallback(() => {
    setDialogState({ open: false, quotation: null });
  }, []);

  const confirmConvertToInvoice = useCallback(async () => {
    const { quotation } = dialogState;
    if (!quotation?._id) return;

    try {
      await handleConvertToInvoice(quotation._id);
      closeConvertDialog();
    } catch (error) {
      onError?.(error.message || 'Failed to convert quotation to invoice.');
    }
  }, [closeConvertDialog, dialogState, handleConvertToInvoice, onError]);

  return {
    convertDialogOpen: dialogState.open,
    selectedQuotation: dialogState.quotation,
    openConvertDialog,
    closeConvertDialog,
    confirmConvertToInvoice,
  };
}

function useQuotationListActions({ onSuccess, onError, fetchQuotations, pagination }) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const handleView = useCallback(
    id => {
      if (!id) return;
      router.push(`/quotations/quotation-view/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/quotations/quotation-edit/${id}`);
    },
    [router]
  );

  const executeAction = useCallback(
    async (action, fallbackMessage, shouldRefresh = true) => {
      try {
        const result = await action();

        if (result?.success === false) {
          throw new Error(result?.message || 'Action failed');
        }

        onSuccess?.(result?.message || fallbackMessage);
        if (shouldRefresh) {
          await fetchQuotations({ page: pagination?.current });
        }
        return result;
      } catch (error) {
        onError?.(error.message || 'Action failed');
        throw error;
      }
    },
    [fetchQuotations, onError, onSuccess, pagination?.current]
  );

  const handleClone = useCallback(
    id => executeAction(() => cloneQuotation(id), 'Quotation cloned successfully', true),
    [executeAction]
  );

  const handleConvertToInvoice = useCallback(
    id => executeAction(() => convertToInvoice(id), 'Quotation converted to invoice successfully', true),
    [executeAction]
  );

  const handleDeleteClick = useCallback(quotation => {
    setSelectedQuotation(quotation);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedQuotation(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedQuotation?._id) return;

    try {
      const response = await deleteQuotation(selectedQuotation._id);

      if (response.success) {
        onSuccess?.(response.message || 'Quotation deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedQuotation(null);
        await fetchQuotations({ page: pagination?.current });
        return;
      }

      throw new Error(response.message || 'Failed to delete quotation');
    } catch (error) {
      onError?.(error.message || 'Failed to delete quotation');
    }
  }, [fetchQuotations, onError, onSuccess, pagination?.current, selectedQuotation]);

  return {
    handleView,
    handleEdit,
    handleClone,
    handleConvertToInvoice,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    deleteDialogOpen,
    selectedQuotation,
  };
}

export function useQuotationListHandler({
  initialQuotations = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  onError,
  onSuccess,
}) {
  const theme = useTheme();

  const permissions = {
    canCreate: usePermission('quotation', 'create'),
    canUpdate: usePermission('quotation', 'update'),
    canView: usePermission('quotation', 'view'),
    canDelete: usePermission('quotation', 'delete'),
  };

  const data = useQuotationListData({
    initialQuotations,
    initialPagination,
    initialSummary,
    onError,
  });

  const actions = useQuotationListActions({
    onSuccess,
    onError,
    fetchQuotations: data.fetchQuotations,
    pagination: data.pagination,
  });

  const convertDialog = useConvertDialog({
    handleConvertToInvoice: actions.handleConvertToInvoice,
    onError,
  });

  const columns = useMemo(
    () => getQuotationColumns({ theme, permissions }),
    [permissions, theme]
  );

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDeleteClick: actions.handleDeleteClick,
      handleView: actions.handleView,
      handleEdit: actions.handleEdit,
      handleClone: actions.handleClone,
      openConvertDialog: convertDialog.openConvertDialog,
    };

    return columns.map(column => ({
      ...column,
      renderCell: column.renderCell
        ? (row, index) => column.renderCell(row, cellHandlers, index)
        : undefined,
    }));
  }, [actions, columns, convertDialog.openConvertDialog]);

  const tablePagination = useMemo(
    () => ({
      page: Math.max(0, data.pagination.current - 1),
      pageSize: data.pagination.pageSize,
      total: data.pagination.total,
    }),
    [data.pagination]
  );

  return {
    permissions,
    tableColumns,
    tablePagination,
    ...data,
    ...actions,
    ...convertDialog,
  };
}
