import React, { useState, useMemo, useCallback, memo } from 'react';
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

import VendorHead from '@/views/vendors/vendorList/vendorHead';
import VendorFilter from '@/views/vendors/vendorList/vendorFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useVendorListHandlers } from '@/handlers/vendors/useVendorListHandlers';
import { getVendorColumns } from './vendorColumns';
import AddVendorDialog from '@/views/vendors/addVendor';
import EditVendorDialog from '@/views/vendors/editVendor';
import ViewVendorDialog from '@/views/vendors/viewVendor';
import { addVendor, updateVendor } from '@/app/(dashboard)/vendors/actions';

/**
 * Simplified VendorList Component - eliminates redundant state and complexity
 */
const VendorList = ({ initialVendors, initialPagination }) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Permissions
  const permissions = {
    canCreate: usePermission('vendor', 'create'),
    canUpdate: usePermission('vendor', 'update'),
    canView: usePermission('vendor', 'view'),
    canDelete: usePermission('vendor', 'delete'),
  };

  const ledgerPermissions = {
    canCreate: usePermission('ledger', 'create'),
    canView: usePermission('ledger', 'view'),
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
    editVendorId: null,
    viewVendorId: null,
    viewTab: 'details',
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

  const handleOpenEditDialog = useCallback((vendorId) => {
    setDialogStates(prev => ({ ...prev, edit: true, editVendorId: vendorId }));
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, edit: false, editVendorId: null }));
  }, []);

  const handleOpenViewDialog = useCallback((vendorId, tab = 'details') => {
    setDialogStates(prev => ({ ...prev, view: true, viewVendorId: vendorId, viewTab: tab }));
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, view: false, viewVendorId: null, viewTab: 'details' }));
  }, []);

  // CRUD operation handlers
  const handleAddVendor = useCallback(async (formData) => {
    try {
      const loadingKey = 'adding-vendor';
      onSuccess('Adding vendor...');
      
      const response = await addVendor(formData);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add vendor';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Vendor added successfully!');
      // Refresh the vendor list
      handlers.fetchData();
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError, handlers]);

  const handleUpdateVendor = useCallback(async (vendorId, formData) => {
    try {
      const loadingKey = 'updating-vendor';
      onSuccess('Updating vendor...');
      
      const response = await updateVendor(vendorId, formData);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update vendor';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Vendor updated successfully!');
      // Refresh the vendor list
      handlers.fetchData();
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError, handlers]);

  // Initialize simplified handlers
  const handlers = useVendorListHandlers({
    initialVendors,
    initialPagination,
    onError,
    onSuccess,
    // Override handlers to use dialogs instead of navigation
    onView: handleOpenViewDialog,
    onEdit: handleOpenEditDialog,
  });

  // Column management
  const columns = useMemo(() => {
    if (!theme || !permissions) return [];
    return getVendorColumns({ theme, permissions, ledgerPermissions });
  }, [theme, permissions, ledgerPermissions]);

  const [columnsState, setColumns] = useState(() => {
    if (typeof window !== 'undefined' && columns.length > 0) {
      const saved = localStorage.getItem('vendorVisibleColumns');
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

  const handleColumnCheckboxChange = useCallback((columnKey, checked) => {
    setColumns(prev => prev.map(col =>
      col.key === columnKey ? { ...col, visible: checked } : col
    ));
  }, []);

  const handleSaveColumns = useCallback(() => {
    setManageColumnsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vendorVisibleColumns', JSON.stringify(columnsState));
    }
  }, [columnsState]);

  // Table columns
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      permissions,
      ledgerPermissions,
      pagination: handlers.pagination,
    };

    return columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
      }));
  }, [columnsState, handlers, permissions, ledgerPermissions]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total
  }), [handlers.pagination]);

  return (
    <div className='flex flex-col gap-5'>
      <VendorHead
        vendorListData={handlers.vendors}
        isLoading={handlers.loading}
      />

      <Grid container spacing={3}>
        {/* <Grid size={{xs:12}}>
          <VendorFilter
            onApplyFilters={handlers.handleFilterApply}
            onResetFilters={handlers.handleFilterReset}
            onOpenColumns={() => setManageColumnsOpen(true)}
          />
        </Grid> */}

        <Grid size={{xs:12}}>
          <CustomListTable
            columns={tableColumns}
            rows={handlers.vendors}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No vendors found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            headerActions={
              permissions.canCreate && (
                <Button
                  onClick={handleOpenAddDialog}
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Vendor
                </Button>
              )
            }
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Vendor Dialogs */}
      <AddVendorDialog
        open={dialogStates.add}
        onClose={handleCloseAddDialog}
        onSave={handleAddVendor}
      />

      <EditVendorDialog
        open={dialogStates.edit}
        vendorId={dialogStates.editVendorId}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateVendor}
      />

      <ViewVendorDialog
        open={dialogStates.view}
        vendorId={dialogStates.viewVendorId}
        defaultTab={dialogStates.viewTab}
        onClose={handleCloseViewDialog}
        onEdit={handleOpenEditDialog}
        onError={onError}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default memo(VendorList);