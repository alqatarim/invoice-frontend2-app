"use client";

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Grid
} from '@mui/material';
import { usePermission } from '@/Auth/usePermission';

import CustomListTable from '@/components/custom-components/CustomListTable';
import BranchHead from './BranchHead';
import BranchDialog from './BranchDialog';
import { getBranchColumns } from './branchColumns';
import { useBranchListHandlers } from '@/handlers/branches/useBranchListHandlers';
import { addBranch, updateBranch, getProvincesCities } from '@/app/(dashboard)/branches/actions';

const BranchList = ({ initialBranches = [], initialPagination = { current: 1, pageSize: 10, total: 0 } }) => {
  const permissions = {
    canCreate: usePermission('branch', 'create'),
    canUpdate: usePermission('branch', 'update'),
    canView: usePermission('branch', 'view'),
    canDelete: usePermission('branch', 'delete'),
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'add',
    branchId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    branchId: null,
  });

  const [provincesCities, setProvincesCities] = useState([]);

  useEffect(() => {
    const loadProvinces = async () => {
      const data = await getProvincesCities();
      setProvincesCities(Array.isArray(data) ? data : []);
    };
    loadProvinces();
  }, []);

  const onError = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'error' });
  }, []);

  const onSuccess = useCallback(msg => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
  }, []);

  const handlers = useBranchListHandlers({
    initialBranches,
    initialPagination,
    onError,
    onSuccess,
    onEdit: (id) => setDialogState({ open: true, mode: 'edit', branchId: id }),
    onView: (id) => setDialogState({ open: true, mode: 'view', branchId: id }),
  });

  const columns = useMemo(() => getBranchColumns({ permissions }), [permissions]);

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: (id) => setDeleteDialog({ open: true, branchId: id }),
      handleEdit: handlers.handleEdit,
      handleView: handlers.handleView,
      pagination: handlers.pagination,
    };

    return columns.map(col => ({
      ...col,
      renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
    }));
  }, [columns, handlers]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total
  }), [handlers.pagination]);

  const selectedBranch = useMemo(() => {
    if (!dialogState.branchId) return null;
    return handlers.branches.find(item => item._id === dialogState.branchId) || null;
  }, [dialogState.branchId, handlers.branches]);

  const handleDialogClose = () => {
    setDialogState({ open: false, mode: 'add', branchId: null });
  };

  const handleAddBranch = async (formData) => {
    onSuccess('Adding branch...');
    const response = await addBranch(formData);
    if (!response.success) {
      onError(response.message || 'Failed to add branch');
      return;
    }
    onSuccess('Branch added successfully!');
    handleDialogClose();
    await handlers.refreshData();
  };

  const handleUpdateBranch = async (formData) => {
    if (!selectedBranch?._id) return;
    onSuccess('Updating branch...');
    const response = await updateBranch(selectedBranch._id, formData);
    if (!response.success) {
      onError(response.message || 'Failed to update branch');
      return;
    }
    onSuccess('Branch updated successfully!');
    handleDialogClose();
    await handlers.refreshData();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.branchId) return;
    await handlers.handleDelete(deleteDialog.branchId);
    setDeleteDialog({ open: false, branchId: null });
  };

  return (
    <div className='flex flex-col gap-5'>
      <BranchHead branches={handlers.branches} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            columns={tableColumns}
            rows={handlers.branches}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No branches found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            headerActions={
              permissions.canCreate && (
                <Button
                  onClick={() => setDialogState({ open: true, mode: 'add', branchId: null })}
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Branch
                </Button>
              )
            }
          />
        </Grid>
      </Grid>

      <BranchDialog
        open={dialogState.open}
        mode={dialogState.mode}
        branch={selectedBranch}
        provincesCities={provincesCities}
        onClose={handleDialogClose}
        onSave={dialogState.mode === 'edit' ? handleUpdateBranch : handleAddBranch}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, branchId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Branch</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this branch? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, branchId: null })} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
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

export default BranchList;
