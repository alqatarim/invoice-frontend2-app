import React, { useState, useMemo, useCallback, memo } from 'react';
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

import UnitHead from '@/views/units/unitList/UnitHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useUnitListHandlers } from '@/handlers/units/useUnitListHandlers';
import { getUnitColumns } from './unitColumns';
import AddUnitDialog from '@/views/units/addUnit';
import EditUnitDialog from '@/views/units/editUnit';
import { addUnit, updateUnit } from '@/app/(dashboard)/units/actions';
import AppSnackbar from '@/components/shared/AppSnackbar';

/**
 * Simplified UnitList Component - eliminates redundant state and complexity
 */
const UnitList = ({ initialUnits, initialPagination }) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Permissions
  const permissions = {
    canCreate: usePermission('unit', 'create'),
    canUpdate: usePermission('unit', 'update'),
    canView: usePermission('unit', 'view'),
    canDelete: usePermission('unit', 'delete'),
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
    editUnitId: null,
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

  const handleOpenEditDialog = useCallback((unitId) => {
    setDialogStates(prev => ({ ...prev, edit: true, editUnitId: unitId }));
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, edit: false, editUnitId: null }));
  }, []);

  // CRUD operation handlers
  const handleAddUnit = useCallback(async (formData) => {
    try {
      onSuccess('Adding unit...');
      
      const response = await addUnit(formData);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add unit';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Unit added successfully!');
      // Refresh the list to show the new unit
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh unit list after add:', refreshError);
        // Continue anyway - the operation was successful
      }
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError, handlers]);

  const handleUpdateUnit = useCallback(async (unitId, formData) => {
    try {
      onSuccess('Updating unit...');
      
      const response = await updateUnit(unitId, formData);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update unit';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Unit updated successfully!');
      // Refresh the list to show the updated unit
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh unit list after update:', refreshError);
        // Continue anyway - the operation was successful
      }
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError, handlers]);

  // Initialize simplified handlers
  const handlers = useUnitListHandlers({
    initialUnits,
    initialPagination,
    onError,
    onSuccess,
    // Override handlers to use dialogs instead of navigation
    onEdit: handleOpenEditDialog,
  });

  // Column management
  const columns = useMemo(() => {
    if (!theme || !permissions) return [];
    return getUnitColumns({ theme, permissions });
  }, [theme, permissions]);

  const [columnsState, setColumns] = useState(() => {
    if (typeof window !== 'undefined' && columns.length > 0) {
      const saved = localStorage.getItem('unitVisibleColumns');
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
      localStorage.setItem('unitVisibleColumns', JSON.stringify(columnsState));
    }
  }, [columnsState]);

  // Table columns
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleEdit: handlers.handleEdit,
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
      <UnitHead
        unitListData={handlers.units}
        isLoading={handlers.loading}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-center mb-4">
        <ButtonGroup variant="outlined" color="primary">
          <Button
            component={Link}
            href="/products/product-list"
            startIcon={<Icon icon="mdi:package-variant" />}
          >
            Products
          </Button>
          <Button
            component={Link}
            href="/categories/category-list"
            startIcon={<Icon icon="mdi:shape" />}
          >
            Categories
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon icon="mdi:ruler" />}
          >
            Units
          </Button>
        </ButtonGroup>
      </div>

      <Grid container spacing={3}>
        <Grid size={{xs:12}}>
          <CustomListTable
            addRowButton={
              permissions.canCreate && (
                <Button
                  onClick={handleOpenAddDialog}
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Unit
                </Button>
              )
            }
            columns={tableColumns}
            rows={handlers.units}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No units found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search units..."
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

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={(_, reason) => reason !== 'clickaway' && setSnackbar(prev => ({ ...prev, open: false }))}
        autoHideDuration={6000}
      />

      {/* Unit Dialogs */}
      <AddUnitDialog
        open={dialogStates.add}
        onClose={handleCloseAddDialog}
        onSave={handleAddUnit}
      />

      <EditUnitDialog
        open={dialogStates.edit}
        unitId={dialogStates.editUnitId}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateUnit}
      />
    </div>
  );
};

export default memo(UnitList);
