'use client';

import React from 'react';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AddExpenseDialog from '@/views/expenses/addExpense/AddExpenseDialog';
import EditExpenseDialog from '@/views/expenses/editExpense/EditExpenseDialog';
import ViewExpenseDialog from '@/views/expenses/viewExpense/ViewExpenseDialog';
import ExpenseList from './ExpenseList';
import { useExpenseListHandler } from './handler';

const ExpenseListIndex = ({
     initialExpenses = [],
     initialPagination,
     initialExpenseNumber = '',
     initialErrorMessage = '',
}) => {
     const handler = useExpenseListHandler({
          initialExpenses,
          initialPagination,
          initialExpenseNumber,
          initialErrorMessage,
     });

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

               <AppSnackbar
                    open={handler.snackbar.open}
                    message={handler.snackbar.message}
                    severity={handler.snackbar.severity}
                    onClose={handler.closeSnackbar}
                    autoHideDuration={6000}
               />
          </>
     );
};

export default ExpenseListIndex;
