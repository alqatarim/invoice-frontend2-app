import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Icon } from '@iconify/react';
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
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { usePermission } from '@/Auth/usePermission';

import UnitHead from '@/views/units/unitList/UnitHead';
import ProductNavigationButtons from '@/views/products/listProduct/ProductNavigationButtons';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useUnitListHandler } from './handler';
import { getUnitColumns } from './unitColumns';
import AddUnitDialog from '@/views/units/addUnit/AddUnit';
import EditUnitDialog from '@/views/units/editUnit/EditUnit';
import ViewUnitDialog from '@/views/units/viewUnit';

/**
 * Simplified UnitList Component - eliminates redundant state and complexity
 */
const UnitList = ({
  initialUnits,
  initialPagination,
  initialErrorMessage = ''
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Permissions
  const permissions = {
    canCreate: usePermission('unit', 'create'),
    canUpdate: usePermission('unit', 'update'),
    canView: usePermission('unit', 'view'),
    canDelete: usePermission('unit', 'delete'),
  };

  // Notification handlers
  const onError = useCallback(msg => {
    enqueueSnackbar(msg, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar]);

  const onSuccess = useCallback(msg => {
    enqueueSnackbar(msg, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  }, [enqueueSnackbar]);

  const onInfo = useCallback(msg => {
    enqueueSnackbar(msg, {
      variant: 'info',
      autoHideDuration: 3000,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (initialErrorMessage) {
      onError(initialErrorMessage);
    }
  }, [initialErrorMessage, onError]);

  // Initialize simplified handlers
  const handlers = useUnitListHandler({
    initialUnits,
    initialPagination,
    onError,
    onInfo,
    onSuccess,
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

  const handleRowClick = useCallback(
    row => {
      handlers.handleView(row?._id || row?.id);
    },
    [handlers]
  );

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
      handleView: handlers.handleView,
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
    <div className='flex flex-col gap-0'>
      <UnitHead
        unitListData={handlers.units}
        isLoading={handlers.loading}
      />

      <ProductNavigationButtons activeTab='units' />

      <Grid container spacing={3}>
        <Grid size={{xs:12}}>
          <CustomListTable
            addRowButton={
              permissions.canCreate && (
                <Button
                  onClick={handlers.handleOpenAddDialog}
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
            onRowClick={handleRowClick}
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

      {/* Unit Dialogs */}
      <AddUnitDialog
        open={handlers.dialogStates.add}
        onClose={handlers.handleCloseAddDialog}
        onSave={handlers.handleAddUnit}
      />

      <EditUnitDialog
        open={handlers.dialogStates.edit}
        unitId={handlers.dialogStates.editUnitId}
        onClose={handlers.handleCloseEditDialog}
        onSave={handlers.handleUpdateUnit}
      />

      <ViewUnitDialog
        open={handlers.dialogStates.view}
        unitId={handlers.dialogStates.viewUnitId}
        onClose={handlers.handleCloseViewDialog}
      />
    </div>
  );
};

export default memo(UnitList);
