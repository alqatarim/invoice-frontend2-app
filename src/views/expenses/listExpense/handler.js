'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import {
  addExpense,
  deleteExpense,
  getExpenseDetails,
  getExpenseNumber,
  getExpensesList,
  setExpenseAsPaid,
  setExpenseAsPending,
  updateExpense,
} from '@/app/(dashboard)/expenses/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const getSortableValue = (expense, key) => {
  switch (key) {
    case 'amount':
      return Number(expense?.amount || 0);
    case 'expenseDate':
      return new Date(expense?.expenseDate || '').getTime() || 0;
    default:
      return String(expense?.[key] || '').toLowerCase();
  }
};

export function useExpenseListHandler({
  initialExpenses = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  initialExpenseNumber = '',
  initialErrorMessage = '',
  onError,
  onSuccess,
}) {
  const permissions = {
    canCreate: usePermission('expense', 'create'),
    canUpdate: usePermission('expense', 'update'),
    canView: usePermission('expense', 'view'),
    canDelete: usePermission('expense', 'delete'),
  };

  const [expenses, setExpenses] = useState(initialExpenses);
  const [summary, setSummary] = useState(initialSummary || {});
  const [pagination, setPagination] = useState(initialPagination || DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [expenseNumber, setExpenseNumber] = useState(initialExpenseNumber || '');
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
    selectedExpenseId: '',
    selectedExpense: null,
    selectedExpenseData: null,
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

  const sortedExpenses = useMemo(() => {
    if (!sortBy) {
      return expenses;
    }

    return [...expenses].sort((firstExpense, secondExpense) => {
      const firstValue = getSortableValue(firstExpense, sortBy);
      const secondValue = getSortableValue(secondExpense, sortBy);

      if (firstValue < secondValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }

      if (firstValue > secondValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }, [expenses, sortBy, sortDirection]);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const fetchExpenses = useCallback(
    async (
      page = stateRef.current.pagination.current,
      pageSize = stateRef.current.pagination.pageSize,
      search = stateRef.current.searchTerm
    ) => {
      if (loadingRef.current) return null;

      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await getExpensesList(page, pageSize, search);

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch expenses');
        }

        setExpenses(response.data || []);
        setSummary(response.summary || {});
        setSearchTerm(search);
        setPagination({
          current: page,
          pageSize,
          total: response.totalRecords || 0,
        });

        return response;
      } catch (error) {
        onErrorRef.current?.(error?.message || 'Failed to fetch expenses');
        return null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const refreshExpenseNumber = async () => {
    try {
      const response = await getExpenseNumber();

      if (!response?.success || typeof response.data !== 'string') {
        throw new Error(response?.message || 'Failed to load expense number.');
      }

      setExpenseNumber(response.data);
      return response.data;
    } catch (error) {
      showSnackbar(error?.message || 'Failed to load expense number.', 'error');
      return '';
    }
  };

  const openAddDialog = async () => {
    if (!expenseNumber) {
      await refreshExpenseNumber();
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

  const loadExpenseDetails = async (expenseId, mode) => {
    setDialogState(prev => ({
      ...prev,
      selectedExpenseId: expenseId,
      selectedExpenseData: null,
      detailsLoading: true,
      detailsError: '',
      viewOpen: mode === 'view',
      editOpen: mode === 'edit',
    }));

    try {
      const expenseData = await getExpenseDetails(expenseId);

      setDialogState(prev => ({
        ...prev,
        selectedExpenseData: expenseData,
        detailsLoading: false,
      }));
    } catch (error) {
      const nextMessage = error?.message || 'Failed to load expense details.';

      setDialogState(prev => ({
        ...prev,
        detailsLoading: false,
        detailsError: nextMessage,
      }));

      showSnackbar(nextMessage, 'error');
    }
  };

  const openViewDialog = async expenseId => {
    await loadExpenseDetails(expenseId, 'view');
  };

  const openEditDialog = async (expenseId, reuseCurrent = false) => {
    if (
      reuseCurrent &&
      dialogState.selectedExpenseId === expenseId &&
      dialogState.selectedExpenseData
    ) {
      setDialogState(prev => ({
        ...prev,
        viewOpen: false,
        editOpen: true,
        detailsError: '',
      }));
      return;
    }

    await loadExpenseDetails(expenseId, 'edit');
  };

  const closeViewDialog = () => {
    setDialogState(prev => ({
      ...prev,
      viewOpen: false,
      selectedExpenseId: '',
      selectedExpenseData: null,
      detailsLoading: false,
      detailsError: '',
    }));
  };

  const closeEditDialog = () => {
    setDialogState(prev => ({
      ...prev,
      editOpen: false,
      selectedExpenseId: '',
      selectedExpenseData: null,
      detailsLoading: false,
      detailsError: '',
    }));
  };

  const openDeleteDialog = useCallback(expense => {
    setDialogState(prev => ({
      ...prev,
      deleteOpen: true,
      selectedExpense: expense,
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      deleteOpen: false,
      selectedExpense: null,
    }));
  }, []);

  const retryDetailsFetch = async () => {
    if (!dialogState.selectedExpenseId) return;

    await loadExpenseDetails(
      dialogState.selectedExpenseId,
      dialogState.editOpen ? 'edit' : 'view'
    );
  };

  const handleAddExpense = async (expenseData, preparedAttachment) => {
    const response = await addExpense({
      ...expenseData,
      attachment: preparedAttachment,
    });

    if (!response?.success) {
      showSnackbar(response?.message || 'Failed to add expense', 'error');
      return {
        success: false,
        message: response?.message || 'Failed to add expense',
      };
    }

    onSuccessRef.current?.('Expense added successfully!');
    await fetchExpenses();
    await refreshExpenseNumber();

    return response;
  };

  const handleUpdateExpense = async (expenseData, preparedAttachment) => {
    if (!dialogState.selectedExpenseId) {
      return {
        success: false,
        message: 'No expense selected for editing.',
      };
    }

    const response = await updateExpense({
      id: dialogState.selectedExpenseId,
      ...expenseData,
      attachment: preparedAttachment,
    });

    if (!response?.success) {
      showSnackbar(response?.message || 'Failed to update expense', 'error');
      return {
        success: false,
        message: response?.message || 'Failed to update expense',
      };
    }

    onSuccessRef.current?.('Expense updated successfully!');
    await fetchExpenses();
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
        await fetchExpenses();
        return result;
      } catch (error) {
        onErrorRef.current?.(error.message || 'Action failed');
        return null;
      }
    },
    [fetchExpenses]
  );

  const handleSetAsPending = useCallback(
    id => executeAction(() => setExpenseAsPending(id), 'Expense set to pending successfully'),
    [executeAction]
  );

  const handleSetAsPaid = useCallback(
    id => executeAction(() => setExpenseAsPaid(id), 'Expense set to paid successfully'),
    [executeAction]
  );

  const handleDeleteConfirm = useCallback(async () => {
    const expenseId = dialogState.selectedExpense?._id;

    if (!expenseId) {
      return;
    }

    try {
      const response = await deleteExpense(expenseId);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to delete expense');
      }

      onSuccessRef.current?.('Expense deleted successfully!');
      closeDeleteDialog();
      await fetchExpenses();
    } catch (error) {
      onErrorRef.current?.(error?.message || 'Failed to delete expense');
    }
  }, [closeDeleteDialog, dialogState.selectedExpense, fetchExpenses]);

  const handlePageChange = useCallback(
    pageZeroBased => {
      const nextPage = Number(pageZeroBased) + 1;
      if (!Number.isFinite(nextPage)) return;
      fetchExpenses(nextPage, stateRef.current.pagination.pageSize);
    },
    [fetchExpenses]
  );

  const handlePageSizeChange = useCallback(
    pageSize => {
      const nextSize = Number(pageSize);
      if (!Number.isFinite(nextSize)) return;
      fetchExpenses(1, nextSize);
    },
    [fetchExpenses]
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
      fetchExpenses(1, stateRef.current.pagination.pageSize, nextValue);
    },
    [fetchExpenses]
  );

  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  };

  return {
    permissions,
    expenses: sortedExpenses,
    summary,
    pagination,
    loading,
    searchTerm,
    sortBy,
    sortDirection,
    expenseNumber,
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
    handleAddExpense,
    handleUpdateExpense,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleSetAsPending,
    handleSetAsPaid,
    closeSnackbar,
  };
}
