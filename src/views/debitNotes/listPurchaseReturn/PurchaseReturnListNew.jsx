'use client';

import React, { useState, useMemo } from 'react';
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
  DialogContentText,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { usePurchaseReturnListHandlers } from '@/handlers/purchaseReturn/list/usePurchaseReturnListHandlers';
import PurchaseReturnFilterNew from './PurchaseReturnFilterNew';
import { formatCurrency } from '@/utils/currencyUtils';

/**
 * Enhanced Purchase Return List Component with column management
 */
const PurchaseReturnListNew = ({
  debitNoteList,
  totalCount,
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  setFilterCriteria,
  vendors,
  resetAllFilters,
  onListUpdate
}) => {
  const theme = useTheme();
  
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

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [cloneDialog, setCloneDialog] = useState({ open: false, item: null });

  // Initialize handlers following invoice patterns
  const handlers = usePurchaseReturnListHandlers({ 
    initialPurchaseReturns: debitNoteList,
    initialPagination: { current: page, pageSize, total: totalCount },
    setPage, 
    onListUpdate,
    onError,
    onSuccess,
  });

  // Enhanced action handlers with dialogs
  const handleDeleteClick = (debitNoteId) => {
    const debitNote = debitNoteList.find(item => item._id === debitNoteId);
    setDeleteDialog({ open: true, item: debitNote });
  };

  const handleCloneClick = (debitNoteId) => {
    const debitNote = debitNoteList.find(item => item._id === debitNoteId);
    setCloneDialog({ open: true, item: debitNote });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.item) {
      await handlers.handleDelete(deleteDialog.item._id);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const handleCloneConfirm = async () => {
    if (cloneDialog.item) {
      await handlers.handleClone(cloneDialog.item._id);
      setCloneDialog({ open: false, item: null });
    }
  };

  // Table columns with enhanced handlers
  const tableColumns = useMemo(() =>
    handlers.columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ?
          (row) => col.renderCell(row, {
            ...handlers,
            handleDelete: handleDeleteClick,
            handleClone: handleCloneClick,
            permissions: handlers.permissions,
          }) : undefined
      })),
    [handlers.columnsState, handlers, debitNoteList]
  );

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
  };

  // No filter dialog handlers needed - using inline filter

  // Calculate statistics
  const stats = useMemo(() => {
    const total = debitNoteList.length;
    const pending = debitNoteList.filter(item => item.status?.toLowerCase() === 'pending').length;
    const processed = debitNoteList.filter(item => item.status?.toLowerCase() === 'processed').length;
    const totalAmount = debitNoteList.reduce((sum, item) => sum + (Number(item.TotalAmount) || 0), 0);
    
    return { total, pending, processed, totalAmount };
  }, [debitNoteList]);

  return (
    <div className='flex flex-col gap-5'>
      {/* Statistics Header */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon icon="tabler:package-import" width="1.5rem" color={theme.palette.success.main} />
              </div>
              <div>
                <Typography variant="h6" className="font-semibold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Returns
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Icon icon="tabler:clock" width="1.5rem" color={theme.palette.warning.main} />
              </div>
              <div>
                <Typography variant="h6" className="font-semibold">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon icon="tabler:check-circle" width="1.5rem" color={theme.palette.info.main} />
              </div>
              <div>
                <Typography variant="h6" className="font-semibold">
                  {stats.processed}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Processed
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="p-4 h-full">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <Icon icon="lucide:saudi-riyal" width="1.5rem" color={theme.palette.error.main} />
              </div>
              <div>
                <Typography variant="h6" className="font-semibold">
                  {stats.totalAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Amount
                </Typography>
              </div>
            </div>
          </Card>
        </Grid>
      </Grid>

      {/* Action Header */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Typography variant="h5" color="primary" className="font-semibold">
                Purchase Returns
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage vendor purchase returns and debit notes
              </Typography>
            </div>
            <Box className="flex gap-2">
              {permissions.canCreate && (
                <Button
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                  component={Link}
                  href="/debitNotes/purchaseReturn-add"
                  sx={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #388e3c 0%, #1b5e20 100%)',
                    }
                  }}
                >
                  Add Purchase Return
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Filter Component */}
        <Grid item xs={12}>
          <PurchaseReturnFilterNew
            setFilterCriteria={setFilterCriteria}
            vendors={vendors}
            resetAllFilters={resetAllFilters}
            values={{}}
            onManageColumns={handlers.handleManageColumnsOpen}
          />
        </Grid>

        {/* Purchase Return Table */}
        <Grid item xs={12}>
          <Card className="shadow-lg">
            <CustomListTable
              columns={tableColumns}
              rows={debitNoteList}
              loading={loading}
              pagination={{
                page: Math.max(0, (page || 1) - 1),
                pageSize: pageSize || 10,
                total: totalCount || 0
              }}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
              noDataText="No purchase returns found."
              rowKey={(row) => row._id || row.id}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Manage Columns Dialog */}
      <Dialog open={handlers.manageColumnsOpen} onClose={handlers.handleManageColumnsClose}>
        <DialogTitle className="flex items-center gap-2">
          <Icon icon="tabler:columns" />
          Select Columns
        </DialogTitle>
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
          <Button onClick={handlers.handleManageColumnsClose}>Cancel</Button>
          <Button 
            onClick={() => handlers.handleManageColumnsSave(handlers.setColumnsState)} 
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2 text-error">
          <Icon icon="tabler:alert-triangle" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete purchase return "{deleteDialog.item?.debit_note_id}"?
            This action cannot be undone and will permanently remove this purchase return from the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Confirmation Dialog */}
      <Dialog
        open={cloneDialog.open}
        onClose={() => setCloneDialog({ open: false, item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2 text-info">
          <Icon icon="tabler:copy" />
          Clone Purchase Return
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clone purchase return "{cloneDialog.item?.debit_note_id}"?
            This will create an exact copy that you can modify as needed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleCloneConfirm} color="info" variant="contained">
            Clone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

    </div>
  );
};

export default PurchaseReturnListNew;