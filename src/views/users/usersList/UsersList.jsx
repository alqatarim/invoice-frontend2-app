import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import { useSearchParams } from 'next/navigation';

import UsersHead from './UsersHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import UserDialog from '@/components/dialogs/user-dialog';
import UserViewDialog from '@/components/dialogs/user-view-dialog';
import { useUsersListHandlers } from '@/handlers/users/useUsersListHandlers';
import { userTabs, userTableColumns } from '@/data/dataSets';
import AppSnackbar from '@/components/shared/AppSnackbar';

/**
 * UsersList Component
 */
const UsersList = ({
     initialUsers = [],
     pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
     tab: initialTab = 'ALL',
     filters: initialFilters = {},
     sortBy: initialSortBy = '',
     sortDirection: initialSortDirection = 'asc',
}) => {
     const theme = useTheme();
     const { data: session } = useSession();
     const searchParams = useSearchParams();

     // Permissions
     const permissions = {
          canCreate: usePermission('user', 'create'),
          canUpdate: usePermission('user', 'update'),
          canView: usePermission('user', 'view'),
          canDelete: usePermission('user', 'delete'),
     };

     // Snackbar state
     const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success',
     });

     const handleSnackbarClose = (event, reason) => {
          if (reason === 'clickaway') return;
          setSnackbar(prev => ({ ...prev, open: false }));
     };

     // Notification handlers
     const onError = msg => setSnackbar({ open: true, message: msg, severity: 'error' });
     const onSuccess = msg => setSnackbar({ open: true, message: msg, severity: 'success' });

     // Initialize handlers with column definitions
     const columns = useMemo(() => userTableColumns, []);

     const handlers = useUsersListHandlers({
          initialUsers,
          initialPagination,
          initialTab,
          initialFilters,
          initialSortBy,
          initialSortDirection,
          initialColumns: userTableColumns,
          onError,
          onSuccess,
     });

     // Show loading when actively fetching data (handler manages this state)
     const showLoading = handlers.loading;

     // Column state management - use handlers.columns which have proper renderCell functions
     const [columnsState, setColumns] = useState(handlers.columns);

     // Column actions
     const columnActions = {
          open: () => handlers.handleManageColumnsOpen(),
          close: () => handlers.handleManageColumnsClose(),
          save: () => handlers.handleManageColumnsSave(setColumns),
     };

     // Use the sophisticated columns from handlers directly
     const tableColumns = useMemo(() => handlers.columns, [handlers.columns]);

     return (
          <div className='flex flex-col gap-5'>
               {/* Header and Stats */}
               <UsersHead users={handlers.users} />

               <Grid container spacing={3}>
                    {/* Users Table */}
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              title="Users"
                              addRowButton={
                                   permissions.canCreate && (
                                        <Button
                                             onClick={handlers.handleAdd}
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             New User
                                        </Button>
                                   )
                              }
                              columns={tableColumns}
                              rows={handlers.users}
                              loading={showLoading}
                              pagination={{
                                   page: handlers.pagination.current - 1,
                                   pageSize: handlers.pagination.pageSize,
                                   total: handlers.pagination.total
                              }}
                              onPageChange={handlers.handlePageChange}
                              onRowsPerPageChange={handlers.handlePageSizeChange}
                              onSort={handlers.handleSortRequest}
                              sortBy={handlers.sortBy}
                              sortDirection={handlers.sortDirection}
                              noDataText="No users found."
                              rowKey={(row) => row._id || row.id}
                              showSearch
                              searchValue={handlers.searchTerm || ''}
                              onSearchChange={handlers.handleSearchInputChange}
                              searchPlaceholder="Search users..."
                              onRowClick={
                                   permissions.canView
                                        ? (row) => handlers.handleView(row._id)
                                        : undefined
                              }
                              enableHover
                         />
                    </Grid>
               </Grid>

               {/* Manage Columns Dialog */}
               <Dialog open={handlers.manageColumnsOpen} onClose={columnActions.close}>
                    <DialogTitle>Select Columns</DialogTitle>
                    <DialogContent>
                         <FormGroup>
                              {handlers.availableColumns.map((column) => (
                                   <FormControlLabel
                                        key={column.key}
                                        control={
                                             <Checkbox
                                                  checked={column.visible}
                                                  onChange={(e) => handlers.handleColumnCheckboxChange(column.key, e.target.checked)}
                                             />
                                        }
                                        label={column.label}
                                   />
                              ))}
                         </FormGroup>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={columnActions.close}>Cancel</Button>
                         <Button onClick={columnActions.save} color="primary">
                              Save
                         </Button>
                    </DialogActions>
               </Dialog>

               <AppSnackbar
                    open={snackbar.open}
                    message={snackbar.message}
                    severity={snackbar.severity}
                    onClose={handleSnackbarClose}
                    autoHideDuration={6000}
               />

               {/* Delete Confirmation Dialog */}
               <Dialog
                    open={handlers.deleteDialogOpen}
                    onClose={handlers.closeDeleteDialog}
                    aria-labelledby="delete-dialog-title"
               >
                    <DialogTitle id="delete-dialog-title">Delete User</DialogTitle>
                    <DialogContent>
                         Are you sure you want to delete this user? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handlers.closeDeleteDialog} color="primary">
                              Cancel
                         </Button>
                         <Button onClick={handlers.confirmDelete} color="error" autoFocus>
                              Delete
                         </Button>
                    </DialogActions>
               </Dialog>

               {/* User Dialog (Add/Edit) */}
               <UserDialog
                    open={handlers.userDialogOpen}
                    onClose={handlers.handleCloseUserDialog}
                    data={handlers.userDialogData}
                    onSubmit={handlers.handleSubmitUser}
                    loading={handlers.userDialogLoading}
                    roles={handlers.roles}
               />

               {/* User View Dialog */}
               <UserViewDialog
                    open={handlers.viewDialogOpen}
                    onClose={handlers.handleCloseViewDialog}
                    userId={handlers.selectedUserId}
               />
          </div>
     );
};

export default UsersList;
