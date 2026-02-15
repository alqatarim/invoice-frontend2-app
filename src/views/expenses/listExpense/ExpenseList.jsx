import React, { useState, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
     Card,
     Button,
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     FormControlLabel,
     Checkbox,
     FormGroup,
     Grid,
     ButtonGroup,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { useSearchParams } from 'next/navigation';

import ExpenseHead from '@/views/expenses/listExpense/expenseHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useExpenseListHandlers } from '@/handlers/expenses/list/useExpenseListHandlers';
import { getExpenseColumns } from './expenseColumns';
import AddExpenseDialog from '@/views/expenses/addExpense/AddExpenseDialog';
import EditExpenseDialog from '@/views/expenses/editExpense/EditExpenseDialog';
import ViewExpenseDialog from '@/views/expenses/viewExpense/ViewExpenseDialog';
import { addExpense, updateExpense } from '@/app/(dashboard)/expenses/actions';
import AppSnackbar from '@/components/shared/AppSnackbar';

/**
 * Simplified ExpenseList Component - matches purchase list structure
 */
const ExpenseList = ({ initialExpenses, initialPagination }) => {
     const theme = useTheme();
     const { data: session } = useSession();
     const searchParams = useSearchParams();

     // Permissions
     const permissions = {
          canCreate: usePermission('expense', 'create'),
          canUpdate: usePermission('expense', 'update'),
          canView: usePermission('expense', 'view'),
          canDelete: usePermission('expense', 'delete'),
     };

     // Snackbar state
     const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success',
     });

     // Dialog states
     const [dialogStates, setDialogStates] = useState({
          add: false,
          edit: false,
          view: false,
          editExpenseId: null,
          viewExpenseId: null,
     });

     // Notification handlers
     const onError = useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'error' });
     }, []);

     const onSuccess = useCallback(msg => {
          setSnackbar({ open: true, message: msg, severity: 'success' });
     }, []);

     // Dialog handlers
     const handleOpenAddDialog = useCallback(() => {
          setDialogStates(prev => ({ ...prev, add: true }));
     }, []);

     const handleCloseAddDialog = useCallback(() => {
          setDialogStates(prev => ({ ...prev, add: false }));
     }, []);

     const handleOpenEditDialog = useCallback((expenseId) => {
          setDialogStates(prev => ({ ...prev, edit: true, editExpenseId: expenseId }));
     }, []);

     const handleCloseEditDialog = useCallback(() => {
          setDialogStates(prev => ({ ...prev, edit: false, editExpenseId: null }));
     }, []);

     const handleOpenViewDialog = useCallback((expenseId) => {
          setDialogStates(prev => ({ ...prev, view: true, viewExpenseId: expenseId }));
     }, []);

     const handleCloseViewDialog = useCallback(() => {
          setDialogStates(prev => ({ ...prev, view: false, viewExpenseId: null }));
     }, []);

     // CRUD operation handlers
     const handleAddExpense = useCallback(async (formData, preparedAttachment) => {
          try {
               onSuccess('Adding expense...');

               const response = await addExpense(formData, preparedAttachment);

               if (!response.success) {
                    const errorMessage = response.error?.message || response.message || 'Failed to add expense';
                    onError(errorMessage);
                    return { success: false, message: errorMessage };
               }

               onSuccess('Expense added successfully!');
               // Refresh the list to show the new expense
               try {
                    await handlers.refreshData();
               } catch (refreshError) {
                    console.warn('Failed to refresh expense list after add:', refreshError);
                    // Continue anyway - the operation was successful
               }
               return response;
          } catch (error) {
               const errorMessage = error.message || 'Failed to add expense';
               onError(errorMessage);
               return { success: false, message: errorMessage };
          }
     }, [onSuccess, onError]);

     const handleUpdateExpense = useCallback(async (expenseId, formData, preparedAttachment) => {
          try {
               onSuccess('Updating expense...');

               const response = await updateExpense(expenseId, formData, preparedAttachment);

               if (!response.success) {
                    const errorMessage = response.error?.message || response.message || 'Failed to update expense';
                    onError(errorMessage);
                    return { success: false, message: errorMessage };
               }

               onSuccess('Expense updated successfully!');
               // Refresh the list to show the updated expense
               try {
                    await handlers.refreshData();
               } catch (refreshError) {
                    console.warn('Failed to refresh expense list after update:', refreshError);
                    // Continue anyway - the operation was successful
               }
               return response;
          } catch (error) {
               const errorMessage = error.message || 'Failed to update expense';
               onError(errorMessage);
               return { success: false, message: errorMessage };
          }
     }, [onSuccess, onError]);

     // Initialize simplified handlers
     const handlers = useExpenseListHandlers({
          initialExpenses,
          initialPagination,
          onError,
          onSuccess,
          // Pass dialog handlers for actions
          onView: handleOpenViewDialog,
          onEdit: handleOpenEditDialog,
     });

     // Column management
     const columns = useMemo(() => {
          if (!theme || !permissions) return [];
          return getExpenseColumns({ theme, permissions });
     }, [theme, permissions]);

     const [columnsState, setColumns] = useState(() => {
          if (typeof window !== 'undefined' && columns.length > 0) {
               const saved = localStorage.getItem('expenseVisibleColumns');
               if (saved) {
                    try {
                         const parsed = JSON.parse(saved);
                         return Array.isArray(parsed) ? parsed : columns;
                    } catch (e) {
                         console.warn('Failed to parse saved column preferences:', e);
                    }
               }
          }
          return columns;
     });

     const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

     React.useEffect(() => {
          if (columns.length > 0 && columnsState.length === 0) {
               setColumns(columns);
          }
     }, [columns, columnsState.length]);

     const handleColumnCheckboxChange = React.useCallback((columnKey, checked) => {
          setColumns(prev => prev.map(col =>
               col.key === columnKey ? { ...col, visible: checked } : col
          ));
     }, []);

     const handleSaveColumns = React.useCallback(() => {
          setManageColumnsOpen(false);
          if (typeof window !== 'undefined') {
               localStorage.setItem('expenseVisibleColumns', JSON.stringify(columnsState));
          }
     }, [columnsState]);

     // Table columns
     const tableColumns = useMemo(() => {
          const cellHandlers = {
               handleDelete: handlers.handleDelete,
               handleView: handlers.handleView,
               handleEdit: handlers.handleEdit,
               handlePrintDownload: handlers.handlePrintDownload,
               permissions,
               pagination: handlers.pagination,
          };

          return columnsState
               .filter(col => col.visible)
               .map(col => ({
                    ...col,
                    renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
               }));
     }, [columnsState, handlers, permissions]);

     const tablePagination = useMemo(() => ({
          page: handlers.pagination.current - 1,
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total
     }), [handlers.pagination]);

     return (
          <div className='flex flex-col gap-5'>
               <ExpenseHead
                    expenseListData={handlers.expenses}
                    isLoading={handlers.loading}
               />

               <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              addRowButton={
                                   permissions.canCreate && (
                                        <Button
                                             onClick={handleOpenAddDialog}
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             Add Expense
                                        </Button>
                                   )
                              }
                              columns={tableColumns}
                              rows={handlers.expenses}
                              loading={handlers.loading}
                              pagination={tablePagination}
                              onPageChange={(page) => handlers.handlePageChange(page)}
                              onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
                              onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
                              sortBy={handlers.sortBy}
                              sortDirection={handlers.sortDirection}
                              noDataText="No expenses found"
                              rowKey={(row) => row._id || row.id}
                              showSearch={true}
                              searchValue={handlers.searchTerm || ''}
                              onSearchChange={handlers.handleSearchInputChange}
                              searchPlaceholder="Search expenses..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => handlers.handleView(row._id)
                                        : undefined
                              }
                              enableHover
                         />
                    </Grid>
               </Grid>

               <Dialog
                    open={manageColumnsOpen}
                    onClose={() => setManageColumnsOpen(false)}
                    maxWidth="sm"
                    fullWidth
               >
                    <DialogTitle>Manage Columns</DialogTitle>
                    <DialogContent>
                         <FormGroup>
                              {columnsState.map((column) => (
                                   <FormControlLabel
                                        key={column.key}
                                        control={
                                             <Checkbox
                                                  checked={column.visible}
                                                  onChange={(e) => handleColumnCheckboxChange(column.key, e.target.checked)}
                                             />
                                        }
                                        label={column.label}
                                   />
                              ))}
                         </FormGroup>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={() => setManageColumnsOpen(false)} color="secondary">
                              Cancel
                         </Button>
                         <Button onClick={handleSaveColumns} color="primary" variant="contained">
                              Save
                         </Button>
                    </DialogActions>
               </Dialog>

               {/* Add Expense Dialog */}
               <AddExpenseDialog
                    open={dialogStates.add}
                    onClose={handleCloseAddDialog}
                    onSave={handleAddExpense}
                    expenseNumber={"EXP-" + Date.now()} // Generate expense number
               />

               {/* Edit Expense Dialog */}
               <EditExpenseDialog
                    open={dialogStates.edit}
                    expenseId={dialogStates.editExpenseId}
                    onClose={handleCloseEditDialog}
                    onSave={handleUpdateExpense}
               />

               {/* View Expense Dialog */}
               <ViewExpenseDialog
                    open={dialogStates.view}
                    expenseId={dialogStates.viewExpenseId}
                    onClose={handleCloseViewDialog}
                    onEdit={handleOpenEditDialog}
                    onError={onError}
                    onSuccess={onSuccess}
               />

               <AppSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
                    autoHideDuration={6000}
               />

          </div>
     );
};

export default ExpenseList;