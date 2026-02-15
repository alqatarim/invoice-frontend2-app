import React, { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { usePermission } from '@/Auth/usePermission';
import { buildProductDescription, parseProductDescription } from '@/utils/productMeta';

import ProductHead from '@/views/products/listProduct/ProductHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useProductListHandlers } from '@/handlers/products/useProductListHandlers';
import { getProductColumns } from './productColumns';
import ProductVariantsTable from './ProductVariantsTable';
import { updateProduct } from '@/app/(dashboard)/products/actions';
import AppSnackbar from '@/components/shared/AppSnackbar';

/**
 * Simplified ProductList Component - eliminates redundant state and complexity
 */
const ProductList = ({ initialProducts, initialPagination }) => {
  const theme = useTheme();
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

  // Notification handlers
  const onError = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'error' });
  }, []);

  const onSuccess = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
  }, []);

  const handleOpenViewPage = useCallback((productId) => {
    router.push(`/products/product-view/${productId}`);
  }, [router]);

  const handleOpenEditPage = useCallback((productId) => {
    router.push(`/products/product-edit/${productId}`);
  }, [router]);


  // Initialize simplified handlers
  const handlers = useProductListHandlers({
    initialProducts,
    initialPagination,
    onError,
    onSuccess,
    // Override handlers to use dialogs instead of navigation
    onView: handleOpenViewPage,
    onEdit: handleOpenEditPage,
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
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  const handleRowClick = useCallback((row) => {
    const { meta } = parseProductDescription(row.productDescription);
    const variantsCount = Array.isArray(meta?.variants) ? meta.variants.length : 0;
    if (!variantsCount) return;
    toggleRow(row._id);
  }, [toggleRow]);

  const handleSaveVariants = useCallback(async (product, nextVariants) => {
    try {
      const { description, meta } = parseProductDescription(product.productDescription);
      const updatedMeta = { ...meta, variants: nextVariants };
      const updatedDescription = buildProductDescription(description, updatedMeta);

      const payload = {
        name: product.name || '',
        type: product.type || 'product',
        sku: product.sku || '',
        discountValue: product.discountValue || 0,
        barcode: product.barcode || '',
        units: product.units?._id || product.units || '',
        category: product.category?._id || product.category || '',
        sellingPrice: product.sellingPrice || '',
        purchasePrice: product.purchasePrice || '',
        discountType: product.discountType || '',
        alertQuantity: product.alertQuantity || '',
        tax: product.tax?._id || product.tax || '',
        productDescription: updatedDescription,
      };

      onSuccess('Updating variant details...');
      const response = await updateProduct(product._id, payload);
      if (!response.success) {
        const errorMessage = response.message || 'Failed to update variants';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }
      onSuccess('Variants updated successfully!');
      await handlers.refreshData();
      return response;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update variants';
      onError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [handlers, onError, onSuccess]);

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
      expandedRows,
      toggleRow,
    };

    return columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
      }));
  }, [columnsState, handlers, permissions, expandedRows, toggleRow]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total
  }), [handlers.pagination]);

  const renderVariantsRow = useCallback((row) => {
    const { meta } = parseProductDescription(row.productDescription);
    const variants = Array.isArray(meta?.variants) ? meta.variants : [];
    if (!variants.length) return null;
    return (
      <ProductVariantsTable
        product={row}
        variants={variants}
        canEdit={permissions.canUpdate}
        onSaveVariants={handleSaveVariants}
      />
    );
  }, [handleSaveVariants, permissions.canUpdate]);

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
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions.canCreate && (
                <Button
                  component={Link}
                  href="/products/product-add"
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Product
                </Button>
              )
            }
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
            searchPlaceholder="Search products..."
            onRowClick={handleRowClick}
            expandedRows={expandedRows}
            expandableRowRender={renderVariantsRow}
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

    </div>
  );
};

export default memo(ProductList);
