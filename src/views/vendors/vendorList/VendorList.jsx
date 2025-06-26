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

  // Notification handlers
  const onError = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'error' });
  }, []);

  const onSuccess = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
  }, []);

  // Initialize simplified handlers
  const handlers = useVendorListHandlers({
    initialVendors,
    initialPagination,
    onError,
    onSuccess,
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
        <Grid item xs={12}>
          <VendorFilter
            onApplyFilters={handlers.handleFilterApply}
            onResetFilters={handlers.handleFilterReset}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomListTable
            columns={tableColumns}
            rows={handlers.vendors}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={handlers.handlePageChange}
            onRowsPerPageChange={handlers.handlePageSizeChange}
            onSort={handlers.handleSortRequest}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No vendors found"
            rowKey={(row) => row._id || row.id}
            showSearch={false}
            headerActions={
              permissions.canCreate && (
                <Button
                  component={Link}
                  href="/vendors/add"
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
    </div>
  );
};

export default memo(VendorList);