'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import CustomListTable from '@/components/custom-components/CustomListTable';
import PolicyHead from './PolicyHead';
import PolicyNavigationButtons from './PolicyNavigationButtons';
import AddPolicy from '../addPolicy/AddPolicy';
import EditPolicy from '../editPolicy/EditPolicy';
import ViewPolicy from '../viewPolicy/ViewPolicy';
import { usePolicyListHandler } from './handler';
import { getPolicyColumns } from './policyColumns';

const DEFAULT_PAGINATION = { current: 1, pageSize: 10, total: 0 };

const PolicyList = ({
  initialPolicies = [],
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

  const handlers = usePolicyListHandler({
    initialPolicies,
    initialPagination,
    initialSummary,
    onError,
    onSuccess,
  });

  const columns = useMemo(() => getPolicyColumns(), []);
  const tableColumns = useMemo(() => {
    const cellHandlers = {
      openPolicy: handlers.openPolicy,
      handleDelete: handlers.handleDelete,
    };

    return columns
      .filter(column => column.visible !== false)
      .map(column => ({
        ...column,
        renderCell: column.renderCell
          ? (row, index) => column.renderCell(row, cellHandlers, index)
          : undefined,
      }));
  }, [columns, handlers.handleDelete, handlers.openPolicy]);

  const dialogProps = {
    open: Boolean(handlers.dialogMode),
    form: handlers.form,
    onChange: handlers.setForm,
    onClose: handlers.closeDialog,
    onSubmit: handlers.handleSubmit,
    saving: handlers.saving,
  };

  return (
    <div className="flex flex-col gap-0">
      <PolicyHead summary={handlers.summary} />
      <PolicyNavigationButtons />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={handlers.openAdd}>
                Add Policy
              </Button>
            }
            columns={tableColumns}
            rows={handlers.policies}
            loading={handlers.loading}
            pagination={handlers.tablePagination}
            onPageChange={handlers.handlePageChange}
            onRowsPerPageChange={handlers.handlePageSizeChange}
            rowKey={row => row._id}
            showSearch
            searchValue={handlers.searchTerm}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search policies..."
            noDataText="No warranty policies found"
            onRowClick={row => handlers.openPolicy(row, 'view')}
            enableHover
          />
        </Grid>
      </Grid>

      {handlers.dialogMode === 'add' ? <AddPolicy {...dialogProps} /> : null}
      {handlers.dialogMode === 'edit' ? <EditPolicy {...dialogProps} /> : null}
      {handlers.dialogMode === 'view' ? <ViewPolicy {...dialogProps} /> : null}
    </div>
  );
};

export default PolicyList;
