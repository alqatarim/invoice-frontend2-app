'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { usePermission } from '@/Auth/usePermission';
import CategoryHead from '@/views/categories/categoryList/CategoryHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AddCategoryDialog from '@/views/categories/addCategory';
import EditCategoryDialog from '@/views/categories/editCategory';
import ViewCategoryDialog from '@/views/categories/viewCategory';
import ProductNavigationButtons from '@/views/products/listProduct/ProductNavigationButtons';
import { getCategoryColumns } from './categoryColumns';
import { useCategoryListHandler } from './handler';

const CategoryList = ({
  initialCategories = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const canCreate = usePermission('category', 'create');
  const canUpdate = usePermission('category', 'update');
  const canView = usePermission('category', 'view');
  const canDelete = usePermission('category', 'delete');

  const stablePermissions = useMemo(
    () => ({
      canCreate,
      canUpdate,
      canView,
      canDelete,
    }),
    [canCreate, canUpdate, canView, canDelete]
  );

  const onError = useCallback((msg) => {
    enqueueSnackbar(msg, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: true,
    });
  }, [enqueueSnackbar]);

  const onSuccess = useCallback((msg) => {
    enqueueSnackbar(msg, {
      variant: 'success',
      autoHideDuration: 3000,
    });
  }, [enqueueSnackbar]);

  const onInfo = useCallback((msg) => {
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

  const columns = useMemo(
    () => getCategoryColumns({ theme, permissions: stablePermissions }),
    [theme, stablePermissions]
  );

  const handlers = useCategoryListHandler({
    initialCategories,
    initialPagination,
    onError,
    onInfo,
    onSuccess,
  });

  const handleRowClick = useCallback(
    row => {
      if (!stablePermissions.canView) return;
      handlers.handleView(row?._id || row?.id);
    },
    [handlers, stablePermissions.canView]
  );

  const tableColumns = useMemo(
    () =>
      (columns || [])
        .filter(column => column.visible !== false)
        .map(column => ({
          ...column,
          renderCell: column.renderCell
            ? (row, index) =>
              column.renderCell(
                row,
                {
                  ...handlers,
                  permissions: stablePermissions,
                },
                index
              )
            : undefined,
        })),
    [columns, handlers, stablePermissions]
  );

  return (
    <div className='flex flex-col gap-0'>
      <CategoryHead categoryListData={handlers.categories} isLoading={handlers.loading} />

      <ProductNavigationButtons activeTab='categories' />

      <Box>
        <CustomListTable
          addRowButton={
            stablePermissions.canCreate && (
              <Button onClick={handlers.handleOpenAddDialog} variant='contained' startIcon={<Icon icon='tabler:plus' />}>
                New Category
              </Button>
            )
          }
          showSearch
          searchValue={handlers.searchTerm || ''}
          onSearchChange={handlers.handleSearchInputChange}
          searchPlaceholder='Search categories...'
          columns={tableColumns}
          rows={handlers.categories}
          loading={handlers.loading}
          pagination={{
            page: handlers.pagination.current - 1,
            pageSize: handlers.pagination.pageSize,
            total: handlers.pagination.total,
          }}
          onPageChange={handlers.handlePageChange}
          onRowsPerPageChange={handlers.handlePageSizeChange}
          onSort={handlers.handleSortRequest}
          sortBy={handlers.sortBy}
          sortDirection={handlers.sortDirection}
          noDataText='No categories found'
          rowKey={row => row._id || row.id}
          onRowClick={stablePermissions.canView ? handleRowClick : undefined}
          enableHover
        />
      </Box>

      <AddCategoryDialog
        open={handlers.dialogStates.add}
        onClose={handlers.handleCloseAddDialog}
        onSave={handlers.handleAddCategory}
      />

      <EditCategoryDialog
        open={handlers.dialogStates.edit}
        categoryId={handlers.dialogStates.editCategoryId}
        onClose={handlers.handleCloseEditDialog}
        onSave={handlers.handleUpdateCategory}
      />

      <ViewCategoryDialog
        open={handlers.dialogStates.view}
        categoryId={handlers.dialogStates.viewCategoryId}
        onClose={handlers.handleCloseViewDialog}
      />
    </div>
  );
};

export default CategoryList;
