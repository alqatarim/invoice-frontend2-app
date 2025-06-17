import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Card,
  Button,
  Snackbar,
  Alert,
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

import DebitNoteHead from '@/views/debitNotes/listPurchaseReturn/debitNoteHead';
import DebitNoteFilter from '@/views/debitNotes/listPurchaseReturn/debitNoteFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useDebitNoteListHandlers } from '@/handlers/debitNotes/useDebitNoteListHandlers';
import { formatCurrency } from '@/utils/currencyUtils';
import { getDebitNoteColumns } from './debitNoteColumns';

/**
 * DebitNoteList Component
 */
const DebitNoteList = ({
  initialDebitNotes = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  tab: initialTab = 'ALL',
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
  initialVendors = [],
}) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Permissions
  const permissions = {
    canCreate: usePermission('debitNote', 'create'),
    canUpdate: usePermission('debitNote', 'update'),
    canView: usePermission('debitNote', 'view'),
    canDelete: usePermission('debitNote', 'delete'),
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
  const columns = useMemo(() => getDebitNoteColumns({ theme, permissions }), [theme, permissions]);

  const handlers = useDebitNoteListHandlers({
    initialDebitNotes,
    initialPagination,
    initialTab,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    initialColumns: columns,
    initialVendors,
    onError,
    onSuccess,
  });

  // Column state management
  const [columnsState, setColumns] = useState(columns);

  // Column actions
  const columnActions = {
    open: () => handlers.handleManageColumnsOpen(),
    close: () => handlers.handleManageColumnsClose(),
    save: () => handlers.handleManageColumnsSave(setColumns),
  };

  // Build table columns with action handlers
  const tableColumns = useMemo(() =>
    columnsState.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row) => col.renderCell(row, {
          ...handlers,
          permissions,
        }) : undefined
    })),
    [columnsState, handlers, permissions]
  );

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <DebitNoteHead
        debitNoteListData={initialCardCounts}
        currencyData={formatCurrency(0).replace(/\d|\.|,/g, '').trim()}
        isLoading={handlers.loading}
      />

      <Grid container spacing={3}>
        {/* New Debit Note Button */}
        {permissions.canCreate && (
          <Grid item xs={12}>
            <div className="flex justify-end">
              <Button
                component={Link}
                href="/debitNotes/purchaseReturn-add"
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
              >
                New Debit Note
              </Button>
            </div>
          </Grid>
        )}

        {/* Filter Component */}
        <Grid item xs={12}>
          <DebitNoteFilter
            onChange={handlers.handleFilterValueChange}
            onApply={handlers.handleFilterApply}
            onReset={handlers.handleFilterReset}
            vendorOptions={handlers.vendorOptions}
            debitNoteOptions={handlers.debitNoteOptions}
            values={handlers.filterValues}
            tab={handlers.filterValues.status || []}
            onTabChange={handlers.handleTabChange}
            onManageColumns={columnActions.open}
          />
        </Grid>

        {/* Debit Note Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={handlers.debitNotes}
              loading={handlers.loading}
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
              noDataText="No debit notes found."
              rowKey={(row) => row._id || row.id}
            />
          </Card>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="w-full">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={handlers.deleteDialogOpen}
        onClose={handlers.closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Debit Note</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this debit note?
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
    </div>
  );
};

export default DebitNoteList;