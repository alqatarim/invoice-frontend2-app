'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import {
  cloneDebitNote,
  deleteDebitNote,
  getDebitNotesList,
  processPurchaseReturnRefund,
  setPurchaseReturnAsPending,
} from '@/app/(dashboard)/debitNotes/actions';
import { getDebitNoteColumns } from './debitNoteColumns';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

function useDebitNoteListHandlers({
  initialDebitNotes,
  initialPagination,
  initialSummary = {},
  onError,
  onSuccess,
}) {
  const router = useRouter();
  const [debitNotes, setDebitNotes] = useState(initialDebitNotes || []);
  const [summary, setSummary] = useState(initialSummary || {});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: initialPagination?.current || 1,
    pageSize: initialPagination?.pageSize || 10,
    total: initialPagination?.total || 0,
  });
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);
  const loadingRef = useRef(false);
  const onErrorRef = useRef(onError);
  const stateRef = useRef({ searchTerm: '', pagination });

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    stateRef.current = { searchTerm, pagination };
  }, [searchTerm, pagination]);

  const fetchDebitNotes = useCallback(
    async (page = stateRef.current.pagination.current, pageSize = stateRef.current.pagination.pageSize, search = stateRef.current.searchTerm) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      try {
        setLoading(true);
        const response = await getDebitNotesList(page, pageSize, search);
        if (response.success) {
          setDebitNotes(response.data || []);
          setPagination({
            current: page,
            pageSize,
            total: response.totalRecords || 0,
          });
          setSummary(response.summary || {});
          setSearchTerm(search);
        } else {
          onErrorRef.current?.(response.message || 'Failed to fetch purchase returns');
        }
      } catch (error) {
        onErrorRef.current?.(error.message || 'Failed to fetch purchase returns');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
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
          await fetchDebitNotes();
        }
        return result;
      } catch (error) {
        onError?.(error.message || 'Action failed');
        throw error;
      }
    },
    [fetchDebitNotes, onError, onSuccess]
  );

  const handleView = useCallback(
    id => {
      if (!id) return;
      router.push(`/debitNotes/purchaseReturn-view/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    id => {
      if (!id) return;
      router.push(`/debitNotes/purchaseReturn-edit/${id}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback(debitNote => {
    setSelectedDebitNote(debitNote);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedDebitNote(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedDebitNote?._id) return;

    try {
      const response = await deleteDebitNote(selectedDebitNote._id);

      if (response.success) {
        onSuccess?.(response.message || 'Purchase return deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedDebitNote(null);
        await fetchDebitNotes();
        return;
      }

      throw new Error(response.message || 'Failed to delete purchase return');
    } catch (error) {
      onError?.(error.message || 'Failed to delete purchase return');
    }
  }, [fetchDebitNotes, onError, onSuccess, selectedDebitNote]);

  const handleClone = useCallback(
    id => executeAction(() => cloneDebitNote(id), 'Purchase return cloned successfully'),
    [executeAction]
  );

  const handleSetAsPending = useCallback(
    id => executeAction(() => setPurchaseReturnAsPending(id), 'Purchase return set to pending successfully'),
    [executeAction]
  );

  const handleProcessRefund = useCallback(
    id => executeAction(() => processPurchaseReturnRefund(id), 'Purchase return processed successfully'),
    [executeAction]
  );

  const handlePrintDownload = useCallback(
    id => {
      if (!id) return;
      router.push(`/debitNotes/purchaseReturn-view/${id}`);
    },
    [router]
  );

  const handlePageChange = useCallback(
    pageZeroBased => {
      const nextPage = Number(pageZeroBased) + 1;
      if (!Number.isFinite(nextPage)) return;
      fetchDebitNotes(nextPage, stateRef.current.pagination.pageSize);
    },
    [fetchDebitNotes]
  );

  const handlePageSizeChange = useCallback(
    pageSize => {
      const nextSize = Number(pageSize);
      if (!Number.isFinite(nextSize)) return;
      fetchDebitNotes(1, nextSize);
    },
    [fetchDebitNotes]
  );

  const handleSortRequest = useCallback((property, direction) => {
    setSortBy(property);
    setSortDirection(direction);
  }, []);

  const handleSearchInputChange = useCallback(
    searchValue => {
      const nextValue = String(searchValue ?? '');
      if (nextValue === stateRef.current.searchTerm) return;

      setSearchTerm(nextValue);
      fetchDebitNotes(1, stateRef.current.pagination.pageSize, nextValue);
    },
    [fetchDebitNotes]
  );

  return {
    debitNotes,
    summary,
    loading,
    pagination,
    sortBy,
    sortDirection,
    searchTerm,
    deleteDialogOpen,
    selectedDebitNote,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleClone,
    handleSetAsPending,
    handleProcessRefund,
    handlePrintDownload,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
  };
}

export function usePurchaseReturnListHandler({
  initialDebitNotes = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  initialErrorMessage = '',
}) {
  const theme = useTheme();

  const permissions = {
    canCreate: usePermission('debitNote', 'create'),
    canUpdate: usePermission('debitNote', 'update'),
    canView: usePermission('debitNote', 'view'),
    canDelete: usePermission('debitNote', 'delete'),
  };

  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const showError = useCallback(message => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const showSuccess = useCallback(message => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  const handlers = useDebitNoteListHandlers({
    initialDebitNotes,
    initialPagination,
    initialSummary,
    onError: showError,
    onSuccess: showSuccess,
  });

  const columns = useMemo(() => {
    if (!theme) return [];
    return getDebitNoteColumns({ theme, permissions });
  }, [permissions, theme]);

  const [columnsState, setColumnsState] = useState(() => {
    if (typeof window === 'undefined') return [];
    const savedColumns = window.localStorage.getItem('debitNoteVisibleColumns');
    if (!savedColumns) return [];

    try {
      const parsedColumns = JSON.parse(savedColumns);
      return Array.isArray(parsedColumns) ? parsedColumns : [];
    } catch {
      return [];
    }
  });
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  useEffect(() => {
    if (columns.length > 0 && columnsState.length === 0) {
      setColumnsState(columns);
    }
  }, [columns, columnsState.length]);

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDeleteClick: handlers.handleDeleteClick,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      handleClone: handlers.handleClone,
      handleSetAsPending: handlers.handleSetAsPending,
      handleProcessRefund: handlers.handleProcessRefund,
      handlePrintDownload: handlers.handlePrintDownload,
    };

    return columnsState
      .filter(column => column.visible)
      .map(column => ({
        ...column,
        renderCell: column.renderCell
          ? (row, index) => column.renderCell(row, cellHandlers, index)
          : undefined,
      }));
  }, [columnsState, handlers]);

  const handleColumnCheckboxChange = (columnKey, checked) => {
    setColumnsState(prev =>
      prev.map(column => (column.key === columnKey ? { ...column, visible: checked } : column))
    );
  };

  const handleSaveColumns = () => {
    setManageColumnsOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('debitNoteVisibleColumns', JSON.stringify(columnsState));
    }
  };

  const closeSnackbar = useCallback((_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    permissions,
    snackbar,
    manageColumnsOpen,
    columnsState,
    tableColumns,
    summary: handlers.summary,
    debitNotes: handlers.debitNotes,
    loading: handlers.loading,
    pagination: handlers.pagination,
    sortBy: handlers.sortBy,
    sortDirection: handlers.sortDirection,
    searchTerm: handlers.searchTerm,
    deleteDialogOpen: handlers.deleteDialogOpen,
    selectedDebitNote: handlers.selectedDebitNote,
    handlePageChange: handlers.handlePageChange,
    handlePageSizeChange: handlers.handlePageSizeChange,
    handleSortRequest: handlers.handleSortRequest,
    handleSearchInputChange: handlers.handleSearchInputChange,
    handleView: handlers.handleView,
    handleDeleteConfirm: handlers.handleDeleteConfirm,
    handleDeleteCancel: handlers.handleDeleteCancel,
    openManageColumns: () => setManageColumnsOpen(true),
    closeManageColumns: () => setManageColumnsOpen(false),
    handleColumnCheckboxChange,
    handleSaveColumns,
    closeSnackbar,
  };
}
