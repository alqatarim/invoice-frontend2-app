'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import {
  cloneDebitNote,
  deleteDebitNote,
  getDebitNotesList,
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
  initialSortBy,
  initialSortDirection,
  onError,
  onSuccess,
}) {
  const [debitNotes, setDebitNotes] = useState(initialDebitNotes || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: initialPagination?.current || 1,
    pageSize: initialPagination?.pageSize || 10,
    total: initialPagination?.total || 0,
  });
  const [sortBy, setSortBy] = useState(initialSortBy || '');
  const [sortDirection, setSortDirection] = useState(initialSortDirection || 'asc');
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);

  useEffect(() => {
    if (initialDebitNotes) {
      setDebitNotes(initialDebitNotes);
    }
  }, [initialDebitNotes]);

  useEffect(() => {
    if (initialPagination) {
      setPagination({
        current: initialPagination.current || 1,
        pageSize: initialPagination.pageSize || 10,
        total: initialPagination.total || 0,
      });
    }
  }, [initialPagination]);

  const handleView = useCallback((id) => {
    window.open(`/debitNotes/purchaseReturn-view/${id}`, '_blank');
  }, []);

  const handleEdit = useCallback((id) => {
    window.open(`/debitNotes/purchaseReturn-edit/${id}`, '_blank');
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await deleteDebitNote(id);

      if (response.success) {
        setDebitNotes((prev) => prev.filter((debitNote) => debitNote._id !== id));
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));
        onSuccess('Debit note deleted successfully');
      } else {
        onError(response.message || 'Failed to delete debit note');
      }
    } catch (error) {
      onError(error.message || 'Error deleting debit note');
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const handleClone = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await cloneDebitNote(id);

      if (response.success) {
        if (response.data) {
          setDebitNotes((prev) => [response.data, ...prev]);
          setPagination((prev) => ({
            ...prev,
            total: prev.total + 1,
          }));
        }
        onSuccess('Debit note cloned successfully');
      } else {
        onError(response.message || 'Failed to clone debit note');
      }
    } catch (error) {
      onError(error.message || 'Error cloning debit note');
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const handleSend = useCallback(async () => {
    onSuccess('Send functionality not implemented yet');
  }, [onSuccess]);

  const handlePrintDownload = useCallback((id) => {
    window.open(`/debitNotes/purchaseReturn-view/${id}`, '_blank');
  }, []);

  const openConvertDialog = useCallback(() => {
    onSuccess('Convert functionality not implemented yet');
  }, [onSuccess]);

  const fetchDebitNotes = useCallback(async (page = pagination.current, pageSize = pagination.pageSize) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    try {
      setLoading(true);
      const response = await getDebitNotesList(page, pageSize);
      if (response.success) {
        setDebitNotes(response.data || []);
        setPagination({
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        });
      } else {
        onError(response.message || 'Failed to fetch debit notes');
      }
    } catch (error) {
      onError(error.message || 'Failed to fetch debit notes');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError, pagination.current, pagination.pageSize]);

  const handlePageChange = useCallback((pageZeroBased) => {
    const nextPage = Number(pageZeroBased) + 1;
    if (!Number.isFinite(nextPage)) {
      return;
    }

    setPagination((prev) => ({ ...prev, current: nextPage }));
    fetchDebitNotes(nextPage, pagination.pageSize);
  }, [fetchDebitNotes, pagination.pageSize]);

  const handlePageSizeChange = useCallback((pageSize) => {
    const nextSize = Number(pageSize);
    if (!Number.isFinite(nextSize)) {
      return;
    }

    setPagination((prev) => ({ ...prev, pageSize: nextSize, current: 1 }));
    fetchDebitNotes(1, nextSize);
  }, [fetchDebitNotes]);

  const handleSortRequest = useCallback((property, direction) => {
    setSortBy(property);
    setSortDirection(direction);
  }, []);

  const handleSearchInputChange = useCallback((searchValue) => {
    setSearchTerm(searchValue);
  }, []);

  return {
    debitNotes,
    loading,
    pagination,
    sortBy,
    sortDirection,
    searchTerm,
    handleView,
    handleEdit,
    handleDelete,
    handleClone,
    handleSend,
    handlePrintDownload,
    openConvertDialog,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
  };
}

export function usePurchaseReturnListHandler({
  initialDebitNotes = [],
  initialPagination = DEFAULT_PAGINATION,
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

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  };

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  };

  const handlers = useDebitNoteListHandlers({
    initialDebitNotes,
    initialPagination,
    onError: showError,
    onSuccess: showSuccess,
  });

  const columns = useMemo(() => {
    if (!theme) {
      return [];
    }

    return getDebitNoteColumns({ theme, permissions });
  }, [permissions, theme]);

  const [columnsState, setColumnsState] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    const savedColumns = window.localStorage.getItem('debitNoteVisibleColumns');
    if (!savedColumns) {
      return [];
    }

    try {
      const parsedColumns = JSON.parse(savedColumns);
      return Array.isArray(parsedColumns) ? parsedColumns : [];
    } catch (error) {
      console.warn('Failed to parse saved debit note columns:', error);
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
      handleDelete: handlers.handleDelete,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      handleClone: handlers.handleClone,
      handleSend: handlers.handleSend,
      handlePrintDownload: handlers.handlePrintDownload,
      openConvertDialog: handlers.openConvertDialog,
      permissions,
      pagination: handlers.pagination,
    };

    return columnsState
      .filter((column) => column.visible)
      .map((column) => ({
        ...column,
        renderCell: column.renderCell
          ? (row, index) => column.renderCell(row, cellHandlers, index)
          : undefined,
      }));
  }, [columnsState, handlers, permissions]);

  const handleColumnCheckboxChange = (columnKey, checked) => {
    setColumnsState((prev) =>
      prev.map((column) =>
        column.key === columnKey ? { ...column, visible: checked } : column
      )
    );
  };

  const handleSaveColumns = () => {
    setManageColumnsOpen(false);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('debitNoteVisibleColumns', JSON.stringify(columnsState));
    }
  };

  const closeSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return {
    permissions,
    snackbar,
    manageColumnsOpen,
    columnsState,
    tableColumns,
    debitNotes: handlers.debitNotes,
    loading: handlers.loading,
    pagination: handlers.pagination,
    sortBy: handlers.sortBy,
    sortDirection: handlers.sortDirection,
    searchTerm: handlers.searchTerm,
    handlePageChange: handlers.handlePageChange,
    handlePageSizeChange: handlers.handlePageSizeChange,
    handleSortRequest: handlers.handleSortRequest,
    handleSearchInputChange: handlers.handleSearchInputChange,
    handleView: handlers.handleView,
    openManageColumns: () => setManageColumnsOpen(true),
    closeManageColumns: () => setManageColumnsOpen(false),
    handleColumnCheckboxChange,
    handleSaveColumns,
    closeSnackbar,
  };
}
