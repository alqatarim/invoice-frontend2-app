'use client';

import React, { useCallback } from 'react';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import ListDeliveryChallans from '@/views/deliveryChallans/listDeliveryChallans/listDeliveryChallans';
import { useDeliveryChallanListHandler } from './handler';

const DeliveryChallanListContent = ({
  initialDeliveryChallans = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const onError = useCallback(
    (message) => enqueueSnackbar(message, { variant: 'error' }),
    [enqueueSnackbar]
  );

  const onSuccess = useCallback(
    (message) => enqueueSnackbar(message, { variant: 'success' }),
    [enqueueSnackbar]
  );

  const handler = useDeliveryChallanListHandler({
    initialDeliveryChallans,
    initialPagination,
    initialSummary,
    initialErrorMessage,
    onError,
    onSuccess,
  });

  return (
    <ListDeliveryChallans
      deliveryChallans={handler.deliveryChallans}
      pagination={handler.pagination}
      loading={handler.loading}
      loadingAction={handler.loadingAction}
      permissions={handler.permissions}
      searchTerm={handler.searchTerm}
      summary={handler.summary}
      tableColumns={handler.tableColumns}
      deleteDialogOpen={handler.deleteDialogOpen}
      convertDialogOpen={handler.convertDialogOpen}
      selectedDeliveryChallan={handler.selectedDeliveryChallan}
      onSearchChange={handler.handleSearchInputChange}
      onPageChange={handler.handlePageChange}
      onRowsPerPageChange={handler.handlePageSizeChange}
      onView={handler.handleView}
      onDeleteCancel={handler.handleDeleteCancel}
      onDeleteConfirm={handler.handleDeleteConfirm}
      onConvertDialogClose={handler.closeConvertDialog}
      onConvertConfirm={handler.handleConvertConfirm}
    />
  );
};

const DeliveryChallanListIndex = (props) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeNotistackSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <DeliveryChallanListContent {...props} />
    </SnackbarProvider>
  );
};

export default DeliveryChallanListIndex;
