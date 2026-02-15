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

import CategoryHead from '@/views/categories/categoryList/CategoryHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useCategoryListHandlers } from '@/handlers/categories/useCategoryListHandlers';
import { getCategoryColumns } from './categoryColumns';
import AddCategoryDialog from '@/views/categories/addCategory';
import EditCategoryDialog from '@/views/categories/editCategory';
import { addCategory, updateCategory } from '@/app/(dashboard)/categories/actions';
import AppSnackbar from '@/components/shared/AppSnackbar';

/**
 * Simplified CategoryList Component - eliminates redundant state and complexity
 */
const CategoryList = ({ initialCategories, initialPagination }) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Permissions
  const permissions = {
    canCreate: usePermission('category', 'create'),
    canUpdate: usePermission('category', 'update'),
    canView: usePermission('category', 'view'),
    canDelete: usePermission('category', 'delete'),
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
    editCategoryId: null,
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

  const handleOpenEditDialog = useCallback((categoryId) => {
    setDialogStates(prev => ({ ...prev, edit: true, editCategoryId: categoryId }));
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, edit: false, editCategoryId: null }));
  }, []);

  // CRUD operation handlers
  const handleAddCategory = useCallback(async (formData, preparedImage) => {
    try {
      onSuccess('Adding category...');

      const response = await addCategory(formData, preparedImage);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add category';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Category added successfully!');
      // Refresh the list to show the new category
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh category list after add:', refreshError);
        // Continue anyway - the operation was successful
      }
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError, handlers]);

  const handleUpdateCategory = useCallback(async (categoryId, formData, preparedImage) => {
    try {
      onSuccess('Updating category...');

      const response = await updateCategory(categoryId, formData, preparedImage);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update category';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Category updated successfully!');
      // Refresh the list to show the updated category
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh category list after update:', refreshError);
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
  const handlers = useCategoryListHandlers({
    initialCategories,
    initialPagination,
    onError,
    onSuccess,
    // Override handlers to use dialogs instead of navigation
    onEdit: handleOpenEditDialog,
  });

  // Column management
  const columns = useMemo(() => {
    if (!theme || !permissions) return [];
    return getCategoryColumns({ theme, permissions });
  }, [theme, permissions]);

  const [columnsState, setColumns] = useState(() => {
    if (typeof window !== 'undefined' && columns.length > 0) {
      const saved = localStorage.getItem('categoryVisibleColumns');
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
      localStorage.setItem('categoryVisibleColumns', JSON.stringify(columnsState));
    }
  }, [columnsState]);

  // Table columns
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleEdit: handlers.handleEdit,
      permissions,
      pagination: handlers.pagination,
    }

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
      <CategoryHead
        categoryListData={handlers.categories}
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
            variant="contained"
            startIcon={<Icon icon="mdi:shape" />}
          >
            Categories
          </Button>
          <Button
            component={Link}
            href="/units/unit-list"
            startIcon={<Icon icon="mdi:ruler" />}
          >
            Units
          </Button>
        </ButtonGroup>
      </div>

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
                  New Category
                </Button>
              )
            }
            columns={tableColumns}
            rows={handlers.categories}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No categories found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search categories..."
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

      {/* Category Dialogs */}
      <AddCategoryDialog
        open={dialogStates.add}
        onClose={handleCloseAddDialog}
        onSave={handleAddCategory}
      />

      <EditCategoryDialog
        open={dialogStates.edit}
        categoryId={dialogStates.editCategoryId}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateCategory}
      />
    </div>
  );
};

export default memo(CategoryList);
