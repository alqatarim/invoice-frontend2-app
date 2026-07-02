'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import { useModulePermissions } from '@/Auth/usePermission';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AddWarrantyIndex from '../addWarranty';
import { useWarrantyListHandler } from './handler';
import WarrantyHead from './WarrantyHead';
import WarrantyNavigationButtons from './WarrantyNavigationButtons';
import { getWarrantyColumns } from './warrantyColumns';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const WarrantyList = ({
  initialRecords = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const permissions = useModulePermissions('warranty');

  const onError = useCallback(msg => {
    enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true });
  }, [enqueueSnackbar]);

  const onSuccess = useCallback(msg => {
    enqueueSnackbar(msg, { variant: 'success', autoHideDuration: 3000 });
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (initialErrorMessage) onError(initialErrorMessage);
  }, [initialErrorMessage, onError]);

  const handlers = useWarrantyListHandler({
    initialRecords,
    initialPagination,
    initialSummary,
    onError,
    onSuccess,
  });

  const columns = useMemo(() => getWarrantyColumns({ permissions }), [permissions]);
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      handleView: handlers.handleView,
      handleEdit: handlers.handleEdit,
    };

    return columns
      .filter(column => column.visible !== false)
      .map(column => ({
        ...column,
        renderCell: column.renderCell
          ? (row, index) => column.renderCell(row, cellHandlers, index)
          : undefined,
      }));
  }, [columns, handlers.handleEdit, handlers.handleView]);

  return (
    <div className="flex flex-col gap-0">
      <WarrantyHead summary={handlers.summary} />
      <WarrantyNavigationButtons />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions.canCreate ? <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={handlers.handleAdd}>
                Manual Warranty
              </Button> : null
            }
            columns={tableColumns}
            rows={handlers.records}
            loading={handlers.loading}
            pagination={handlers.tablePagination}
            onPageChange={handlers.handlePageChange}
            onRowsPerPageChange={handlers.handlePageSizeChange}
            rowKey={row => row._id}
            showSearch
            searchValue={handlers.searchTerm}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search warranty, customer, product, source..."
            noDataText="No warranties found"
            onRowClick={handlers.handleRowClick}
            enableHover
          />
        </Grid>
      </Grid>

      {permissions.canCreate ? (
        <AddWarrantyIndex
          open={handlers.addDialogOpen}
          onClose={handlers.closeAddDialog}
          onCreated={handlers.handleWarrantyCreated}
        />
      ) : null}
    </div>
  );
};

export default WarrantyList;
