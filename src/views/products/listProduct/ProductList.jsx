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
  ButtonGroup,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';

import ProductHead from '@/views/products/listProduct/ProductHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useProductListHandlers } from '@/handlers/products/useProductListHandlers';
import { getProductColumns } from './productColumns';
import AddProductDialog from '@/views/products/addProduct';
import EditProductDialog from '@/views/products/editProduct';
import ViewProductDialog from '@/views/products/viewProduct';
import { addProduct, updateProduct } from '@/app/(dashboard)/products/actions';

/**
 * Simplified ProductList Component - eliminates redundant state and complexity
 */
const ProductList = ({ initialProducts, initialPagination }) => {
  const theme = useTheme();
  const { data: session } = useSession();

  // Permissions
  const permissions = {
    canCreate: usePermission('product', 'create'),
    canUpdate: usePermission('product', 'update'),
    canView: usePermission('product', 'view'),
    canDelete: usePermission('product', 'delete'),
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
    editProductId: null,
    viewProductId: null,
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

  const handleOpenEditDialog = useCallback((productId) => {
    setDialogStates(prev => ({ ...prev, edit: true, editProductId: productId }));
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, edit: false, editProductId: null }));
  }, []);

  const handleOpenViewDialog = useCallback((productId) => {
    setDialogStates(prev => ({ ...prev, view: true, viewProductId: productId }));
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, view: false, viewProductId: null }));
  }, []);

  // CRUD operation handlers
  const handleAddProduct = useCallback(async (formData, preparedImage) => {
    try {
      onSuccess('Adding product...');
      
      const response = await addProduct(formData, preparedImage);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add product';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Product added successfully!');
      // Refresh the list to show the new product
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh product list after add:', refreshError);
        // Continue anyway - the operation was successful
      }
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError, handlers]);

  const handleUpdateProduct = useCallback(async (productId, formData, preparedImage) => {
    try {
      onSuccess('Updating product...');
      
      const response = await updateProduct(productId, formData, preparedImage);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update product';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Product updated successfully!');
      // Refresh the list to show the updated product
      try {
        await handlers.refreshData();
      } catch (refreshError) {
        console.warn('Failed to refresh product list after update:', refreshError);
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
  const handlers = useProductListHandlers({
    initialProducts,
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
    return getProductColumns({ theme, permissions });
  }, [theme, permissions]);

  const [columnsState, setColumns] = useState(() => {
    if (typeof window !== 'undefined' && columns.length > 0) {
      const saved = localStorage.getItem('productVisibleColumns');
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
      localStorage.setItem('productVisibleColumns', JSON.stringify(columnsState));
    }
  }, [columnsState]);

  // Table columns
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleView: handlers.handleView,
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
      <ProductHead
        productListData={handlers.products}
        isLoading={handlers.loading}
      />

      {/* Navigation Buttons */}
      <div className="flex justify-center mb-4">
        <ButtonGroup variant="outlined" color="primary">
          <Button
            variant="contained"
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
            component={Link}
            href="/units/unit-list"
            startIcon={<Icon icon="mdi:ruler" />}
          >
            Units
          </Button>
        </ButtonGroup>
      </div>

      <Grid container spacing={3}>
        <Grid size={{xs:12}}>
          <CustomListTable
            columns={tableColumns}
            rows={handlers.products}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No products found"
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
                  New Product
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

      {/* Product Dialogs */}
      <AddProductDialog
        open={dialogStates.add}
        onClose={handleCloseAddDialog}
        onSave={handleAddProduct}
      />

      <EditProductDialog
        open={dialogStates.edit}
        productId={dialogStates.editProductId}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateProduct}
      />

      <ViewProductDialog
        open={dialogStates.view}
        productId={dialogStates.viewProductId}
        onClose={handleCloseViewDialog}
        onEdit={handleOpenEditDialog}
        onError={onError}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default memo(ProductList);
