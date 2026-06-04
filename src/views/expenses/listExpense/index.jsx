'use client';

import React, { useCallback, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import ExpenseDialog from '@/views/expenses/expense';
import ExpenseList from './ExpenseList';
import { useExpenseListHandler } from './handler';

const ExpenseListContent = ({
  initialExpenses = [],
  initialPagination,
  initialSummary = {},
  initialExpenseNumber = '',
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const onError = useCallback(
    message => {
      enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
    },
    [enqueueSnackbar]
  );

  const onSuccess = useCallback(
    message => {
      enqueueSnackbar(message, {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    [enqueueSnackbar]
  );

  useEffect(() => {
    if (initialErrorMessage) {
      onError(initialErrorMessage);
    }
  }, [initialErrorMessage, onError]);

  const handler = useExpenseListHandler({
    initialExpenses,
    initialPagination,
    initialSummary,
    initialExpenseNumber,
    initialErrorMessage,
    onError,
    onSuccess,
  });

  useEffect(() => {
    if (!handler.snackbar.open || !handler.snackbar.message) return;

    enqueueSnackbar(handler.snackbar.message, {
      variant: handler.snackbar.severity || 'info',
    });
    handler.closeSnackbar();
  }, [enqueueSnackbar, handler]);

  return (
    <>
      <ExpenseList
        expenses={handler.expenses}
        pagination={handler.pagination}
        loading={handler.loading}
        permissions={handler.permissions}
        searchTerm={handler.searchTerm}
        sortBy={handler.sortBy}
        sortDirection={handler.sortDirection}
        summary={handler.summary}
        deleteDialogOpen={handler.dialogState.deleteOpen}
        selectedExpense={handler.dialogState.selectedExpense}
        onOpenAddDialog={handler.openAddDialog}
        onPageChange={handler.handlePageChange}
        onPageSizeChange={handler.handlePageSizeChange}
        onSortRequest={handler.handleSortRequest}
        onSearchChange={handler.handleSearchInputChange}
        onDelete={handler.openDeleteDialog}
        onView={handler.openViewDialog}
        onEdit={handler.openEditDialog}
        onSetAsPending={handler.handleSetAsPending}
        onSetAsPaid={handler.handleSetAsPaid}
        onDeleteDialogClose={handler.closeDeleteDialog}
        onDeleteConfirm={handler.handleDeleteConfirm}
      />

      <ExpenseDialog
        mode="add"
        open={handler.dialogState.addOpen}
        onClose={handler.closeAddDialog}
        onSave={handler.handleAddExpense}
        expenseNumber={handler.expenseNumber}
      />

      <ExpenseDialog
        mode="edit"
        open={handler.dialogState.editOpen}
        expenseData={handler.dialogState.selectedExpenseData}
        loading={handler.dialogState.detailsLoading}
        error={handler.dialogState.detailsError}
        onRetry={handler.retryDetailsFetch}
        onClose={handler.closeEditDialog}
        onSave={handler.handleUpdateExpense}
      />

      <ExpenseDialog
        mode="view"
        open={handler.dialogState.viewOpen}
        expenseData={handler.dialogState.selectedExpenseData}
        loading={handler.dialogState.detailsLoading}
        error={handler.dialogState.detailsError}
        onRetry={handler.retryDetailsFetch}
        onClose={handler.closeViewDialog}
      />
    </>
  );
};

const ExpenseListIndex = props => {
  const snackbarAction = snackbarId => (
    <IconButton onClick={() => closeNotistackSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <ExpenseListContent {...props} />
    </SnackbarProvider>
  );
};

export default ExpenseListIndex;
