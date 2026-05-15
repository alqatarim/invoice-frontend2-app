'use client';

import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { Icon } from '@iconify/react';
import {
  Button,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { usePermission } from '@/Auth/usePermission';

import VendorHead from '@/views/vendors/vendorList/vendorHead';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useVendorListHandler } from './handler';
import { getVendorColumns } from './vendorColumns';
import AddVendorDialog from '@/views/vendors/addVendor/AddVendor';
import EditVendorDialog from '@/views/vendors/editVendor/EditVendor';
import ViewVendorDialog from '@/views/vendors/viewVendor/ViewVendor';
import LedgerList from '@/views/vendors/vendorList/ledger';

/**
 * Simplified VendorList Component - eliminates redundant state and complexity
 */
const VendorList = ({
  initialVendors,
  initialPagination,
  initialErrorMessage = ''
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  // Permissions
  const permissions = {
    canCreate: usePermission('vendor', 'create'),
    canUpdate: usePermission('vendor', 'update'),
    canView: usePermission('vendor', 'view'),
    canDelete: usePermission('vendor', 'delete'),
  };

  const ledgerPermissions = {
    canCreate: usePermission('ledger', 'create'),
    canUpdate: usePermission('ledger', 'update'),
    canDelete: usePermission('ledger', 'delete'),
    canView: usePermission('ledger', 'view'),
    canAll: usePermission('ledger', 'all'),
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
  const handlers = useVendorListHandler({
    initialVendors,
    initialPagination,
    onError,
    onInfo,
    onSuccess,
  });

  const columns = useMemo(() => {
    if (!theme || !permissions) return [];
    return getVendorColumns({
      theme,
      permissions,
      ledgerPermissions,
      formatVendorDate: handlers.formatVendorDate,
    });
  }, [theme, permissions, ledgerPermissions, handlers.formatVendorDate]);

  // Table columns
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleDelete: handlers.handleDelete,
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
      handleLedger: handlers.handleLedger,
      permissions,
      ledgerPermissions,
      pagination: handlers.pagination,
    };

    return columns
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ? (row, index) => col.renderCell(row, cellHandlers, index) : undefined
      }));
  }, [columns, handlers, permissions, ledgerPermissions]);

  const tablePagination = useMemo(() => ({
    page: handlers.pagination.current - 1,
    pageSize: handlers.pagination.pageSize,
    total: handlers.pagination.total
  }), [handlers.pagination]);

  return (
    <div className='flex flex-col gap-5'>
      <VendorHead
        vendorListData={handlers.vendors}
        isLoading={handlers.loading}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions.canCreate && (
                <Button
                  onClick={handlers.handleOpenAddDialog}
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Vendor
                </Button>
              )
            }
            columns={tableColumns}
            rows={handlers.vendors}
            loading={handlers.loading}
            pagination={tablePagination}
            onPageChange={(page) => handlers.handlePageChange(page)}
            onRowsPerPageChange={(size) => handlers.handlePageSizeChange(size)}
            onSort={(key, direction) => handlers.handleSortRequest(key, direction)}
            sortBy={handlers.sortBy}
            sortDirection={handlers.sortDirection}
            noDataText="No vendors found"
            rowKey={(row) => row._id || row.id}
            showSearch={true}
            searchValue={handlers.searchTerm || ''}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search vendors..."
            onRowClick={
              permissions.canView
                ? (row) => handlers.handleView(row._id)
                : undefined
            }
            enableHover
          />
        </Grid>
      </Grid>

      {/* Vendor Dialogs */}
      <AddVendorDialog
        open={handlers.dialogStates.add}
        onClose={handlers.handleCloseAddDialog}
        onSave={handlers.handleAddVendor}
        onError={onError}
      />

      <EditVendorDialog
        open={handlers.dialogStates.edit}
        vendorId={handlers.dialogStates.editVendorId}
        onClose={handlers.handleCloseEditDialog}
        onSave={handlers.handleUpdateVendor}
        onError={onError}
      />

      <ViewVendorDialog
        open={handlers.dialogStates.view}
        vendorId={handlers.dialogStates.viewVendorId}
        onClose={handlers.handleCloseViewDialog}
        onEdit={handlers.handleOpenEditDialog}
        onError={onError}
        onSuccess={onSuccess}
      />

      <LedgerList
        open={handlers.dialogStates.ledger}
        vendorId={handlers.dialogStates.ledgerVendorId}
        permissions={ledgerPermissions}
        onClose={handlers.handleCloseLedgerDialog}
        onChanged={handlers.refreshData}
        onError={onError}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default memo(VendorList);