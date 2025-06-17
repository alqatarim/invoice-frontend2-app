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
  Typography,
  Avatar,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';

import DebitNoteHead from '@/views/debitNotes/listPurchaseReturn/debitNoteHead';
import DebitNoteFilter from '@/views/debitNotes/listPurchaseReturn/debitNoteFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { formatCurrency } from '@/utils/currencyUtils';
import { getDebitNoteColumns } from './debitNoteColumns';
import { deleteDebitNote, cloneDebitNote } from '@/app/(dashboard)/debitNotes/actions';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * SimpleDebitNoteList Component - Works with existing data flow
 */
const SimpleDebitNoteList = ({
  allDebitNotes = [],
  totalCount = 0,
  page = 1,
  setPage,
  pageSize = 10,
  setPageSize,
  loading = false,
  vendors = [],
}) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

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

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);

  // Filter and column management state
  const [filterValues, setFilterValues] = useState({});
  const [availableColumns, setAvailableColumns] = useState([]);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  // Vendor and debit note options for filters
  const vendorOptions = useMemo(() => 
    vendors?.map(vendor => ({
      value: vendor._id,
      label: vendor.vendor_name
    })) || [], [vendors]);

  const debitNoteOptions = useMemo(() => 
    allDebitNotes?.map(debitNote => ({
      value: debitNote._id,
      label: debitNote.debit_note_id
    })) || [], [allDebitNotes]);

  // Mock card counts (you can replace with real data)
  const cardCounts = {
    totalDebitNote: { total_sum: allDebitNotes.reduce((sum, dn) => sum + (Number(dn.TotalAmount) || 0), 0), count: allDebitNotes.length },
    totalOutstanding: { total_sum: 0, count: 0 },
    totalOverdue: { total_sum: 0, count: 0 },
    totalDrafted: { total_sum: 0, count: 0 }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Notification handlers
  const onError = msg => setSnackbar({ open: true, message: msg, severity: 'error' });
  const onSuccess = msg => setSnackbar({ open: true, message: msg, severity: 'success' });

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
  };

  // Action handlers
  const handleClone = async (id) => {
    try {
      const response = await cloneDebitNote(id);
      if (response.success) {
        onSuccess('Debit note cloned successfully');
        // You might want to refresh the list here
      } else {
        onError(response.message || 'Failed to clone debit note');
      }
    } catch (error) {
      onError(error.message || 'Error cloning debit note');
    }
  };

  const handleSend = async (id) => {
    onSuccess('Send functionality not implemented yet');
  };

  const handlePrintDownload = (id) => {
    router.push(`/debitNotes/purchaseReturn-view/${id}`);
  };

  const handleDelete = (id) => {
    const debitNote = allDebitNotes.find(dn => dn._id === id);
    setSelectedDebitNote(debitNote);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedDebitNote(null);
  };

  const confirmDelete = async () => {
    if (!selectedDebitNote?._id) return;

    try {
      const response = await deleteDebitNote(selectedDebitNote._id);
      if (response.success) {
        onSuccess('Debit note deleted successfully');
        closeDeleteDialog();
        // You might want to refresh the list here
      } else {
        onError(response.message || 'Failed to delete debit note');
      }
    } catch (error) {
      onError(error.message || 'Error deleting debit note');
    }
  };

  // Filter handlers (mock implementations)
  const handleFilterValueChange = (field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterApply = (filters) => {
    setFilterValues(filters);
    onSuccess('Filters applied (mock implementation)');
  };

  const handleFilterReset = () => {
    setFilterValues({});
    onSuccess('Filters reset');
  };

  const handleTabChange = (event, newTab) => {
    setFilterValues(prev => ({ ...prev, status: newTab }));
  };

  // Column management handlers
  const handleManageColumnsOpen = () => {
    setAvailableColumns(columns.map(col => ({ ...col, visible: true })));
    setManageColumnsOpen(true);
  };

  const handleManageColumnsClose = () => {
    setManageColumnsOpen(false);
  };

  const handleColumnCheckboxChange = (columnKey, visible) => {
    setAvailableColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible } : col
      )
    );
  };

  const handleManageColumnsSave = () => {
    onSuccess('Column preferences saved');
    setManageColumnsOpen(false);
  };

  // Create handlers object for columns
  const handlers = {
    handleClone,
    handleSend,
    handlePrintDownload,
    handleDelete,
  };

  // Initialize column definitions with full UI/UX
  const columns = useMemo(() => getDebitNoteColumns({ theme, permissions }), [theme, permissions]);

  // Build table columns with action handlers
  const tableColumns = useMemo(() =>
    columns.map(col => ({
      ...col,
      renderCell: col.renderCell ?
        (row) => col.renderCell(row, {
          ...handlers,
          permissions,
        }) : undefined
    })),
    [columns, handlers, permissions]
  );


  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <DebitNoteHead
        debitNoteListData={{ ...cardCounts, currencySymbol: '$' }}
        currencyData={formatCurrency(0).replace(/\d|\.|,/g, '').trim()}
        isLoading={loading}
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
            onChange={handleFilterValueChange}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
            vendorOptions={vendorOptions}
            debitNoteOptions={debitNoteOptions}
            values={filterValues}
            tab={filterValues.status || []}
            onTabChange={handleTabChange}
            onManageColumns={handleManageColumnsOpen}
          />
        </Grid>


        {/* Debit Note Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={allDebitNotes}
              loading={loading}
              pagination={{
                page: page - 1,
                pageSize: pageSize,
                total: totalCount
              }}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
              noDataText="No debit notes found."
              rowKey={(row) => row._id || row.id}
            />
          </Card>
        </Grid>
      </Grid>

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

      {/* Manage Columns Dialog */}
      <Dialog open={manageColumnsOpen} onClose={handleManageColumnsClose}>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {availableColumns.map((column) => (
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
          <Button onClick={handleManageColumnsClose}>Cancel</Button>
          <Button onClick={handleManageColumnsSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Debit Note</DialogTitle>
        <DialogContent>
          Are you sure you want to delete debit note {selectedDebitNote?.debit_note_id}?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SimpleDebitNoteList;