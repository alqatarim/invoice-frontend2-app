'use client';

import React, { useEffect } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import AddExpenseDialog from '@/views/expenses/addExpense/AddExpenseDialog';
import EditExpenseDialog from '@/views/expenses/editExpense/EditExpenseDialog';
import ViewExpenseDialog from '@/views/expenses/viewExpense/ViewExpenseDialog';
import ExpenseList from './ExpenseList';
import { useExpenseListHandler } from './handler';

const ExpenseListContent = ({
     initialExpenses = [],
     initialPagination,
     initialExpenseNumber = '',
     initialErrorMessage = '',
}) => {
     const { enqueueSnackbar } = useSnackbar();
     const handler = useExpenseListHandler({
          initialExpenses,
          initialPagination,
          initialExpenseNumber,
          initialErrorMessage,
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
                    onOpenAddDialog={handler.openAddDialog}
                    onPageChange={handler.handlePageChange}
                    onPageSizeChange={handler.handlePageSizeChange}
                    onSortRequest={handler.handleSortRequest}
                    onSearchInputChange={handler.setSearchTerm}
                    onDelete={handler.handleDelete}
                    onView={handler.openViewDialog}
                    onEdit={handler.openEditDialog}
               />

               <AddExpenseDialog
                    open={handler.dialogState.addOpen}
                    onClose={handler.closeAddDialog}
                    onSave={handler.handleAddExpense}
                    expenseNumber={handler.expenseNumber}
               />

               <EditExpenseDialog
                    open={handler.dialogState.editOpen}
                    expenseData={handler.dialogState.selectedExpenseData}
                    loading={handler.dialogState.detailsLoading}
                    error={handler.dialogState.detailsError}
                    onRetry={handler.retryDetailsFetch}
                    onClose={handler.closeEditDialog}
                    onSave={handler.handleUpdateExpense}
               />

               <ViewExpenseDialog
                    open={handler.dialogState.viewOpen}
                    expenseData={handler.dialogState.selectedExpenseData}
                    loading={handler.dialogState.detailsLoading}
                    error={handler.dialogState.detailsError}
                    onRetry={handler.retryDetailsFetch}
                    onClose={handler.closeViewDialog}
                    onEdit={handler.openEditFromView}
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
