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
import { useRouter } from 'next/navigation';

import ProductHead from '@/views/products/listProduct/ProductHead';
import ProductFilter from '@/views/products/listProduct/ProductFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useProductListHandlers } from '@/handlers/products/useProductListHandlersVendorStyle';
import { getProductColumns } from './productColumns';
import { addProduct, updateProduct } from '@/app/(dashboard)/products/actions';
import AddProductDialog from '@/views/products/addProduct/AddProductDialog';
import EditProductDialog from '@/views/products/editProduct/EditProductDialog';
import ViewProductDialog from '@/views/products/viewProduct/ViewProductDialog';

/**
 * ProductList Component - Following vendors design pattern exactly
 */
const ProductList = ({ initialProducts, initialPagination }) => {
  const theme = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

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
  const handleAddProduct = useCallback(async (formData) => {
    try {
      onSuccess('Adding product...');
      
      const response = await addProduct(formData);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to add product';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Product added successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError]);

  const handleUpdateProduct = useCallback(async (productId, formData) => {
    try {
      onSuccess('Updating product...');
      
      const response = await updateProduct(productId, formData);
      
      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update product';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }

      onSuccess('Product updated successfully!');
      return response;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [onSuccess, onError]);

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

  // Column management - memoize permissions object
  const memoizedPermissions = useMemo(() => permissions, [
    permissions.canCreate,
    permissions.canUpdate,
    permissions.canView,
    permissions.canDelete
  ]);

  const columns = useMemo(() => {
    if (!theme || !memoizedPermissions) return [];
    return getProductColumns({ theme, permissions: memoizedPermissions });
  }, [theme, memoizedPermissions]);

  const [columnsState, setColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productVisibleColumns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn('Failed to parse saved column preferences:', e);
        }
      }
    }
    return [];
  });

  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);

  // Initialize columns state when columns are available
  React.useEffect(() => {
    if (columns.length > 0 && columnsState.length === 0) {
      setColumns(columns);
    }
  }, [columns.length, columnsState.length]); // Use length instead of full arrays

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

  // Table columns - memoize cell handlers
  const cellHandlers = useMemo(() => ({
    handleDelete: handlers.handleDelete,
    handleView: handlers.handleView,
    handleEdit: handlers.handleEdit,
    permissions: memoizedPermissions,
    pagination: handlers.pagination,
  }), [
    handlers.handleDelete,
    handlers.handleView, 
    handlers.handleEdit,
    memoizedPermissions,
    handlers.pagination.current,
    handlers.pagination.pageSize,
    handlers.pagination.total
  ]);

  const tableColumns = useMemo(() => {
    return columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
      }));
  }, [columnsState, cellHandlers]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total
  }), [
    handlers.pagination.current,
    handlers.pagination.pageSize,
    handlers.pagination.total
  ]);

  return (
    <div className='flex flex-col gap-5'>
      <ProductHead
        productListData={handlers.products}
        isLoading={handlers.loading}
      />

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