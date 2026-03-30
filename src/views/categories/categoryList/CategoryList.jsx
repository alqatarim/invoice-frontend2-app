'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button, ButtonGroup, Grid, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import CategoryHead from '@/views/categories/categoryList/CategoryHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AddCategoryDialog from '@/views/categories/addCategory';
import EditCategoryDialog from '@/views/categories/editCategory';
import ViewCategoryDialog from '@/views/categories/viewCategory';
import { addCategory, updateCategory } from '@/app/(dashboard)/categories/actions';
import { getCategoryColumns } from './categoryColumns';
import { useCategoryListHandler } from './handler';

const DEFAULT_DIALOG_STATE = {
  add: false,
  edit: false,
  view: false,
  editCategoryId: null,
  viewCategoryId: null,
};

const CategoryList = ({
  initialCategories = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
}) => {
  const theme = useTheme();

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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [dialogStates, setDialogStates] = useState(DEFAULT_DIALOG_STATE);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const onErrorRef = useRef();
  const onSuccessRef = useRef();
  onErrorRef.current = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' });
  onSuccessRef.current = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' });

  const onError = useCallback((msg) => onErrorRef.current(msg), []);
  const onSuccess = useCallback((msg) => onSuccessRef.current(msg), []);

  const handleOpenAddDialog = useCallback(() => {
    setDialogStates({
      ...DEFAULT_DIALOG_STATE,
      add: true,
    });
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setDialogStates(DEFAULT_DIALOG_STATE);
  }, []);

  const handleOpenEditDialog = useCallback(categoryId => {
    setDialogStates({
      ...DEFAULT_DIALOG_STATE,
      edit: true,
      editCategoryId: categoryId,
    });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setDialogStates(DEFAULT_DIALOG_STATE);
  }, []);

  const handleOpenViewDialog = useCallback(categoryId => {
    setDialogStates({
      ...DEFAULT_DIALOG_STATE,
      view: true,
      viewCategoryId: categoryId,
    });
  }, []);

  const handleCloseViewDialog = useCallback(() => {
    setDialogStates(DEFAULT_DIALOG_STATE);
  }, []);

  const handleViewEdit = useCallback(categoryId => {
    setDialogStates({
      ...DEFAULT_DIALOG_STATE,
      edit: true,
      editCategoryId: categoryId,
    });
  }, []);

  const columns = useMemo(
    () => getCategoryColumns({ theme, permissions: stablePermissions }),
    [theme, stablePermissions]
  );

  const handlers = useCategoryListHandler({
    initialCategories,
    initialPagination,
    onError,
    onSuccess,
    onEdit: handleOpenEditDialog,
    onView: handleOpenViewDialog,
  });

  const handleAddCategory = useCallback(
    async (formData, preparedImage) => {
      try {
        const response = await addCategory(formData, preparedImage);

        if (!response?.success) {
          const errorMessage =
            response?.error?.message || response?.message || 'Failed to add category';
          onError(errorMessage);
          return { success: false, message: errorMessage };
        }

        onSuccess('Category added successfully!');
        await handlers.refreshData();
        return response;
      } catch (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }
    },
    [handlers, onError, onSuccess]
  );

  const handleUpdateCategory = useCallback(
    async (categoryId, formData, preparedImage) => {
      try {
        const response = await updateCategory(categoryId, formData, preparedImage);

        if (!response?.success) {
          const errorMessage =
            response?.error?.message || response?.message || 'Failed to update category';
          onError(errorMessage);
          return { success: false, message: errorMessage };
        }

        onSuccess('Category updated successfully!');
        await handlers.refreshData();
        return response;
      } catch (error) {
        const errorMessage = error.message || 'An unexpected error occurred';
        onError(errorMessage);
        return { success: false, message: errorMessage };
      }
    },
    [handlers, onError, onSuccess]
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
    <div className='flex flex-col gap-5'>
      <CategoryHead categoryListData={handlers.categories} isLoading={handlers.loading} />

      <div className='mb-4 flex justify-center'>
        <ButtonGroup variant='outlined' color='primary'>
          <Button component={Link} href='/products/product-list' startIcon={<Icon icon='mdi:package-variant' />}>
            Products
          </Button>
          <Button variant='contained' startIcon={<Icon icon='mdi:shape' />}>
            Categories
          </Button>
          <Button component={Link} href='/units/unit-list' startIcon={<Icon icon='mdi:ruler' />}>
            Units
          </Button>
        </ButtonGroup>
      </div>

      <Box>
        <CustomListTable
          addRowButton={
            stablePermissions.canCreate && (
              <Button onClick={handleOpenAddDialog} variant='contained' startIcon={<Icon icon='tabler:plus' />}>
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
          onRowClick={stablePermissions.canView ? row => handlers.handleView(row._id || row.id) : undefined}
          enableHover
        />
      </Box>


      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
      />

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

      <ViewCategoryDialog
        open={dialogStates.view}
        categoryId={dialogStates.viewCategoryId}
        onClose={handleCloseViewDialog}
        onEdit={stablePermissions.canUpdate ? handleViewEdit : undefined}
      />
    </div>
  );
};

export default CategoryList;
