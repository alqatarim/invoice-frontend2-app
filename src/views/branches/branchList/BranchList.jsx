"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { usePermission } from '@/Auth/usePermission';

import CustomListTable from '@/components/custom-components/CustomListTable';
import BranchHead from './BranchHead';
import BranchDialog from './BranchDialog';
import { getBranchColumns } from './branchColumns';
import {
  addBranch,
  getBranchById,
  updateBranch,
} from '@/app/(dashboard)/branches/actions';
import { resolveProvinceDisplayName } from '@/utils/normalizeBranchFormValues';
import { useBranchListHandler } from './handler';

const BranchList = ({
  initialBranches = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialProvincesCities = [],
  initialUsers = [],
  initialFilters = {},
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const permissions = {
    canCreate: usePermission('branch', 'create'),
    canUpdate: usePermission('branch', 'update'),
    canView: usePermission('branch', 'view'),
    canDelete: usePermission('branch', 'delete'),
  };

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'add',
    branchId: null,
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    branchId: null,
  });

  const [provincesCities] = useState(Array.isArray(initialProvincesCities) ? initialProvincesCities : []);
  const teamUsers = Array.isArray(initialUsers) ? initialUsers : [];

  const onError = useCallback(
    msg => {
      closeSnackbar();
      enqueueSnackbar(msg, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
    },
    [closeSnackbar, enqueueSnackbar]
  );

  const onSuccess = useCallback(
    msg => {
      enqueueSnackbar(msg, {
        variant: 'success',
        autoHideDuration: 3000,
      });
    },
    [enqueueSnackbar]
  );

  const openBranchDialog = useCallback((mode, branchId) => {
    setDialogBranch(null);
    setLoadingBranch(mode !== 'add');
    setDialogState({
      open: true,
      mode,
      branchId: branchId ? String(branchId) : null,
    });
  }, []);

  const handlers = useBranchListHandler({
    initialBranches,
    initialPagination,
    initialSummary,
    onError,
    onSuccess,
    onEdit: id => openBranchDialog('edit', id),
    onView: id => openBranchDialog('view', id),
    initialFilters,
  });

  const provinceFilterValue = handlers.filters?.province || '';
  const cityFilterValue = handlers.filters?.city || '';

  const cityFilterOptions = useMemo(() => {
    const province = provincesCities.find(item => item.province === provinceFilterValue);
    const cities = [...(province?.cities || [])];

    if (cityFilterValue && !cities.some(city => city.name === cityFilterValue)) {
      cities.push({ name: cityFilterValue, districts: [] });
    }

    return cities;
  }, [cityFilterValue, provinceFilterValue, provincesCities]);

  const locationFilterControls = (
    <div className="flex items-center gap-2 max-sm:flex-col max-sm:is-full">
      <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
        <InputLabel id="stores-province-filter-label">Province</InputLabel>
        <Select
          labelId="stores-province-filter-label"
          value={provinceFilterValue}
          label="Province"
          onChange={event => handlers.handleProvinceFilterChange(event.target.value)}
        >
          <MenuItem value="">All provinces</MenuItem>
          {provincesCities.map(item => (
            <MenuItem key={item.province} value={item.province}>
              {resolveProvinceDisplayName(item.province, provincesCities)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        size="small"
        disabled={!provinceFilterValue}
        sx={{ minWidth: { xs: '100%', sm: 170 } }}
      >
        <InputLabel id="stores-city-filter-label">City</InputLabel>
        <Select
          labelId="stores-city-filter-label"
          value={cityFilterValue}
          label="City"
          onChange={event => handlers.handleCityFilterChange(event.target.value)}
        >
          <MenuItem value="">All cities</MenuItem>
          {cityFilterOptions.map(city => (
            <MenuItem key={city.name} value={city.name}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );

  const columns = useMemo(
    () => getBranchColumns({ permissions, provincesCities }),
    [permissions, provincesCities]
  );

  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: id => setDeleteDialog({ open: true, branchId: String(id || '') }),
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

  const [dialogBranch, setDialogBranch] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(false);

  const resetDialogState = useCallback(() => {
    setDialogState({ open: false, mode: 'add', branchId: null });
    setDialogBranch(null);
    setLoadingBranch(false);
  }, []);

  const showBranchDialog =
    dialogState.open &&
    (dialogState.mode === 'add' || (!loadingBranch && Boolean(dialogBranch)));

  const isLoadingBranchDetails =
    dialogState.open && dialogState.mode !== 'add' && loadingBranch;

  useEffect(() => {
    if (!dialogState.open) return;

    if (dialogState.mode === 'add') {
      setDialogBranch(null);
      setLoadingBranch(false);
      return;
    }

    if (!dialogState.branchId) {
      setDialogBranch(null);
      setLoadingBranch(false);
      return;
    }

    const branchId = dialogState.branchId;
    let cancelled = false;

    setDialogBranch(null);
    setLoadingBranch(true);

    (async () => {
      const response = await getBranchById(branchId);

      if (cancelled) return;

      if (response.success && response.data) {
        setDialogBranch(response.data);
        setLoadingBranch(false);
      } else {
        onError(response.message || 'Failed to load location details');
        resetDialogState();
      }
    })();

    return () => {
      cancelled = true;
      setLoadingBranch(false);
    };
  }, [dialogState.open, dialogState.mode, dialogState.branchId, onError, resetDialogState]);

  const handleDialogClose = () => {
    resetDialogState();
  };

  const handleAddBranch = useCallback(
    async formData => {
      const loadingKey = enqueueSnackbar('Creating location...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      try {
        const response = await addBranch(formData);
        closeSnackbar(loadingKey);

        if (!response.success) {
          onError(response.message || 'Failed to create location');
          return;
        }

        onSuccess('Location created successfully!');
        handleDialogClose();
        await handlers.refreshData();
      } catch (error) {
        closeSnackbar(loadingKey);
        onError(error.message || 'Failed to create location');
      }
    },
    [closeSnackbar, enqueueSnackbar, handlers, onError, onSuccess]
  );

  const handleUpdateBranch = useCallback(
    async formData => {
      const branchId = String(dialogBranch?._id || dialogBranch?.id || dialogState.branchId || '').trim();
      if (!branchId) {
        onError('Location not found. Close the dialog and open it again.');
        return;
      }

      const loadingKey = enqueueSnackbar('Updating location...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      });

      try {
        const response = await updateBranch(branchId, formData);
        closeSnackbar(loadingKey);

        if (!response.success) {
          onError(response.message || 'Failed to update location');
          return;
        }

        onSuccess('Location updated successfully!');
        handleDialogClose();
        await handlers.refreshData();
      } catch (error) {
        closeSnackbar(loadingKey);
        onError(error.message || 'Failed to update location');
      }
    },
    [closeSnackbar, dialogBranch, dialogState.branchId, enqueueSnackbar, handlers, onError, onSuccess]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.branchId) return;
    await handlers.handleDelete(deleteDialog.branchId);
    setDeleteDialog({ open: false, branchId: null });
  };

  return (
    <div className='flex flex-col gap-5'>
      <BranchHead summary={handlers.summary} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>

          <CustomListTable

            addRowButton={
              permissions.canCreate && (
                <Button
                  onClick={() => openBranchDialog('add', null)}
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Store / Warehouse
                </Button>
              )
            }
            columns={tableColumns}
            rows={handlers.branches}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No stores or warehouses found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search stores, warehouses, or default admins..."
            searchControls={locationFilterControls}
            enableHover
          />
        </Grid>
      </Grid>

      <Backdrop open={isLoadingBranchDetails} sx={{ zIndex: theme => theme.zIndex.modal - 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {showBranchDialog ? (
        <BranchDialog
          key={`${dialogState.mode}-${dialogState.branchId || 'add'}`}
          open
          mode={dialogState.mode}
          branch={dialogBranch}
          users={teamUsers}
          provincesCities={provincesCities}
          onClose={handleDialogClose}
          onSave={dialogState.mode === 'edit' ? handleUpdateBranch : handleAddBranch}
        />
      ) : null}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, branchId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Store / Warehouse</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this location? This action cannot be undone.
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
    </div>
  );
};

export default BranchList;
