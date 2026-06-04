import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import {
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

import { usePermission } from '@/Auth/usePermission';

import UsersHead from './UsersHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AddUserDialog from '@/views/users/addUser';
import EditUserDialog from '@/views/users/editUser';
import ViewUserDialog from '@/views/users/viewUser';
import { useUsersListHandlers } from './handler';
import { userTableColumns } from '@/data/dataSets';

/**
 * UsersList Component
 */
const UsersList = ({
     initialUsers = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialRoles = [],
     initialBranches = [],
     initialCardCounts = {},
     initialErrorMessage = '',
     tab: initialTab = 'ALL',
     filters: initialFilters = {},
     sortBy: initialSortBy = '',
     sortDirection: initialSortDirection = 'asc',
}) => {
     const { enqueueSnackbar } = useSnackbar();

     // Permissions
     const permissions = {
          canCreate: usePermission('user', 'create'),
          canUpdate: usePermission('user', 'update'),
          canView: usePermission('user', 'view'),
          canDelete: usePermission('user', 'delete'),
     };

     // Notification handlers
     const onError = useCallback(
          msg => enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true }),
          [enqueueSnackbar]
     );
     const onSuccess = useCallback(
          msg => enqueueSnackbar(msg, { variant: 'success', autoHideDuration: 3000, preventDuplicate: true }),
          [enqueueSnackbar]
     );

     useEffect(() => {
          if (!initialErrorMessage) return;
          onError(initialErrorMessage);
     }, [initialErrorMessage, onError]);

     const handlers = useUsersListHandlers({
          initialUsers,
          initialPagination,
          initialTab,
          initialFilters,
          initialSortBy,
          initialSortDirection,
          initialRoles,
          initialCardCounts,
          initialColumns: userTableColumns,
          onError,
          onSuccess,
     });

     // Show loading when actively fetching data (handler manages this state)
     const showLoading = handlers.loading;

     const [, setColumns] = useState(handlers.columns);

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
               <UsersHead userListData={initialCardCounts} />

               <Grid container spacing={3}>
                    {/* Users Table */}
                    <Grid size={{ xs: 12 }}>
                         <CustomListTable
                              // title="Team Members"
                              addRowButton={
                                   permissions.canCreate && (
                                        <Button
                                             onClick={handlers.handleAdd}
                                             variant="contained"
                                             startIcon={<Icon icon="tabler:plus" />}
                                        >
                                             Add Member
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
                              noDataText="No team members found."
                              rowKey={(row) => row._id || row.id}
                              showSearch
                              searchValue={handlers.searchTerm || ''}
                              onSearchChange={handlers.handleSearchInputChange}
                              searchPlaceholder="Search team members..."
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

               {handlers.userDialogOpen && !handlers.userDialogData ? (
                    <AddUserDialog
                         open
                         onClose={handlers.handleCloseUserDialog}
                         onSave={handlers.handleSubmitUser}
                         loading={handlers.userDialogLoading}
                         roles={handlers.roles}
                         branches={initialBranches}
                    />
               ) : null}

               {handlers.userDialogOpen && handlers.userDialogData ? (
                    <EditUserDialog
                         open
                         onClose={handlers.handleCloseUserDialog}
                         onSave={handlers.handleSubmitUser}
                         loading={handlers.userDialogLoading}
                         userId={handlers.userDialogData?._id}
                         initialUserData={handlers.userDialogData}
                         roles={handlers.roles}
                         branches={initialBranches}
                    />
               ) : null}

               {handlers.viewDialogOpen && handlers.selectedUserId ? (
                    <ViewUserDialog
                         open
                         onClose={handlers.handleCloseViewDialog}
                         userId={handlers.selectedUserId}
                         roles={handlers.roles}
                         branches={initialBranches}
                    />
               ) : null}
          </div>
     );
};

export default UsersList;
