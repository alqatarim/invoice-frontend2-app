import React, { memo, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { usePermission } from '@/Auth/usePermission';
import { parseProductDescription } from '@/utils/productMeta';
import ProductHead from '@/views/products/listProduct/ProductHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import ProductNavigationButtons from './ProductNavigationButtons';
import ProductVariantsTable from './ProductVariantsTable';
import { useProductListHandler } from './handler';
import { getProductColumns } from './productColumns';

const ProductList = ({
  initialProducts = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const permissions = {
    canCreate: usePermission('product', 'create'),
    canUpdate: usePermission('product', 'update'),
    canView: usePermission('product', 'view'),
    canDelete: usePermission('product', 'delete'),
  };

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

  useEffect(() => {
    if (initialErrorMessage) {
      onError(initialErrorMessage);
    }
  }, [initialErrorMessage, onError]);

  const handlers = useProductListHandler({
    initialProducts,
    initialPagination,
    onError,
    onSuccess,
  });

  const columns = useMemo(() => {
    if (!theme || !permissions) return [];
    return getProductColumns({ theme, permissions });
  }, [theme, permissions]);

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      permissions,
      pagination: handlers.pagination,
      expandedRows: handlers.expandedRows,
      toggleRow: handlers.toggleRow,
    };

    return columns
      .filter(col => col.visible !== false)
      .map(col => ({
        ...col,
        renderCell: col.renderCell
          ? (row, index) => col.renderCell(row, cellHandlers, index)
          : undefined,
      }));
  }, [columns, handlers, permissions]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total,
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
        onSaveVariants={handlers.handleSaveVariants}
      />
    );
  }, [handlers.handleSaveVariants, permissions.canUpdate]);

  return (
    <div className='flex flex-col gap-0'>
      <ProductHead productListData={handlers.products} isLoading={handlers.loading} />

      <ProductNavigationButtons />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions.canCreate && (
                <Button
                  component={Link}
                  href='/products/product-add'
                  variant='contained'
                  startIcon={<Icon icon='tabler:plus' />}
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
            noDataText='No products found'
            rowKey={(row) => row._id || row.id}
            showSearch
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder='Search products...'
            onRowClick={handlers.handleRowClick}
            expandedRows={handlers.expandedRows}
            expandableRowRender={renderVariantsRow}
            enableHover
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default memo(ProductList);
