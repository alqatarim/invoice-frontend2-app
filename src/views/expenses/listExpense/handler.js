'use client';

import { useMemo, useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import {
  addExpense,
  deleteExpense,
  getExpenseDetails,
  getExpenseNumber,
  getExpensesList,
  updateExpense,
} from '@/app/(dashboard)/expenses/actions';

const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
};

const matchesExpenseSearch = (expense, query) => {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    expense?.expenseId,
    expense?.reference,
    expense?.paymentMode,
    expense?.description,
    expense?.status,
  ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
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
  initialExpenseNumber = '',
  initialErrorMessage = '',
}) {
  const permissions = {
    canCreate: usePermission('expense', 'create'),
    canUpdate: usePermission('expense', 'update'),
    canView: usePermission('expense', 'view'),
    canDelete: usePermission('expense', 'delete'),
  };

  const [sourceExpenses, setSourceExpenses] = useState(initialExpenses);
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
    selectedExpenseId: '',
    selectedExpenseData: null,
    detailsLoading: false,
    detailsError: '',
  });

  const expenses = useMemo(() => {
    const filteredExpenses = sourceExpenses.filter((expense) =>
      matchesExpenseSearch(expense, searchTerm)
    );

    if (!sortBy) {
      return filteredExpenses;
    }

    return [...filteredExpenses].sort((firstExpense, secondExpense) => {
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
  }, [searchTerm, sortBy, sortDirection, sourceExpenses]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const refreshExpenses = async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
  } = {}) => {
    setLoading(true);

    try {
      const response = await getExpensesList(page, pageSize);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch expenses');
      }

      setSourceExpenses(response.data || []);
      setPagination({
        current: page,
        pageSize,
        total: response.totalRecords || 0,
      });

      return response;
    } catch (error) {
      showSnackbar(error?.message || 'Failed to fetch expenses', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

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

    setDialogState((prev) => ({
      ...prev,
      addOpen: true,
    }));
  };

  const closeAddDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      addOpen: false,
    }));
  };

  const loadExpenseDetails = async (expenseId, mode) => {
    setDialogState((prev) => ({
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

      setDialogState((prev) => ({
        ...prev,
        selectedExpenseData: expenseData,
        detailsLoading: false,
      }));
    } catch (error) {
      const nextMessage = error?.message || 'Failed to load expense details.';

      setDialogState((prev) => ({
        ...prev,
        detailsLoading: false,
        detailsError: nextMessage,
      }));

      showSnackbar(nextMessage, 'error');
    }
  };

  const openViewDialog = async (expenseId) => {
    await loadExpenseDetails(expenseId, 'view');
  };

  const openEditDialog = async (expenseId, reuseCurrent = false) => {
    if (
      reuseCurrent &&
      dialogState.selectedExpenseId === expenseId &&
      dialogState.selectedExpenseData
    ) {
      setDialogState((prev) => ({
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
    setDialogState((prev) => ({
      ...prev,
      viewOpen: false,
      selectedExpenseId: '',
      selectedExpenseData: null,
      detailsLoading: false,
      detailsError: '',
    }));
  };

  const closeEditDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      editOpen: false,
      selectedExpenseId: '',
      selectedExpenseData: null,
      detailsLoading: false,
      detailsError: '',
    }));
  };

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

    showSnackbar('Expense added successfully!');
    await refreshExpenses();
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

    showSnackbar('Expense updated successfully!');
    await refreshExpenses();
    return response;
  };

  const handleDelete = async (expenseId) => {
    const response = await deleteExpense(expenseId);

    if (!response?.success) {
      showSnackbar(response?.message || 'Failed to delete expense', 'error');
      return;
    }

    showSnackbar('Expense deleted successfully!');
    await refreshExpenses();
  };

  const handlePageChange = async (eventOrPage, maybePage) => {
    const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
    if (typeof nextPage !== 'number') return;

    await refreshExpenses({ page: nextPage + 1 });
  };

  const handlePageSizeChange = async (eventOrSize) => {
    const nextPageSize =
      typeof eventOrSize === 'number'
        ? eventOrSize
        : Number(eventOrSize?.target?.value);

    if (!Number.isFinite(nextPageSize)) return;

    await refreshExpenses({ page: 1, pageSize: nextPageSize });
  };

  const handleSortRequest = (columnKey, direction) => {
    const nextDirection =
      direction || (sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc');

    setSortBy(columnKey);
    setSortDirection(nextDirection);

    return {
      sortBy: columnKey,
      sortDirection: nextDirection,
    };
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const openEditFromView = () => {
    if (!dialogState.selectedExpenseId) return;
    openEditDialog(dialogState.selectedExpenseId, true);
  };

  return {
    permissions,
    expenses,
    pagination,
    loading,
    searchTerm,
    sortBy,
    sortDirection,
    expenseNumber,
    dialogState,
    snackbar,
    setSearchTerm,
    openAddDialog,
    closeAddDialog,
    openViewDialog,
    closeViewDialog,
    openEditDialog,
    closeEditDialog,
    openEditFromView,
    retryDetailsFetch,
    handleAddExpense,
    handleUpdateExpense,
    handleDelete,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    closeSnackbar,
  };
}
