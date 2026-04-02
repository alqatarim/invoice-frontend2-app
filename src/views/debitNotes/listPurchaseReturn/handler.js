'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import { useDebitNoteListHandlers } from '@/handlers/debitNotes/useDebitNoteListHandlers';
import { getDebitNoteColumns } from './debitNoteColumns';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

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
