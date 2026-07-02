'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AddClaimDialog from '../addClaim/AddClaimDialog';
import ClaimHead from './ClaimHead';
import ClaimNavigationButtons from './ClaimNavigationButtons';
import { useClaimListHandler } from './handler';
import { getClaimColumns } from './claimColumns';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const ClaimList = ({
  initialClaims = [],
  initialPagination = DEFAULT_PAGINATION,
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const onError = useCallback(msg => {
    enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 5000, preventDuplicate: true });
  }, [enqueueSnackbar]);

  const onSuccess = useCallback(msg => {
    enqueueSnackbar(msg, { variant: 'success', autoHideDuration: 3000 });
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (initialErrorMessage) onError(initialErrorMessage);
  }, [initialErrorMessage, onError]);

  const handlers = useClaimListHandler({
    initialClaims,
    initialPagination,
    initialSummary,
    onError,
    onSuccess,
  });

  const columns = useMemo(() => getClaimColumns(), []);
  const tableColumns = useMemo(() => {
    const cellHandlers = { handleView: handlers.handleView };

    return columns
      .filter(column => column.visible !== false)
      .map(column => ({
        ...column,
        renderCell: column.renderCell
          ? (row, index) => column.renderCell(row, cellHandlers, index)
          : undefined,
      }));
  }, [columns, handlers.handleView]);

  return (
    <div className="flex flex-col gap-0">
      <ClaimHead summary={handlers.summary} />
      <ClaimNavigationButtons />

      <CustomListTable
        addRowButton={
          <Button variant="contained" onClick={handlers.openDialog} startIcon={<Icon icon="mdi:plus" />}>
            Create Claim
          </Button>
        }
        columns={tableColumns}
        rows={handlers.claims}
        loading={handlers.loading}
        pagination={handlers.tablePagination}
        onPageChange={handlers.handlePageChange}
        onRowsPerPageChange={handlers.handlePageSizeChange}
        rowKey={row => row._id}
        showSearch
        searchValue={handlers.searchTerm}
        onSearchChange={handlers.handleSearchInputChange}
        searchPlaceholder="Search claims..."
        noDataText="No warranty claims found"
        onRowClick={handlers.handleRowClick}
        enableHover
      />

      <AddClaimDialog
        open={handlers.dialogOpen}
        form={handlers.form}
        onChange={handlers.setForm}
        onClose={handlers.closeDialog}
        onSubmit={handlers.handleCreate}
        saving={handlers.saving}
      />
    </div>
  );
};

export default ClaimList;
