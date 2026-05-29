'use client';

import React, { useEffect } from "react";
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { SnackbarProvider, closeSnackbar as closeNotistackSnackbar, useSnackbar } from 'notistack';
import ListDeliveryChallans from "@/views/deliveryChallans/listDeliveryChallans/listDeliveryChallans";
import { useDeliveryChallanListHandler } from './handler';

const DeliveryChallanListContent = ({
     initialDeliveryChallans = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialErrorMessage = '',
}) => {
     const { enqueueSnackbar } = useSnackbar();
     const handler = useDeliveryChallanListHandler({
          initialDeliveryChallans,
          initialPagination,
          initialErrorMessage,
     });

     useEffect(() => {
          if (!handler.snackbar.open || !handler.snackbar.message) return;

          enqueueSnackbar(handler.snackbar.message, {
               variant: handler.snackbar.severity || 'info',
          });
          handler.closeSnackbar();
     }, [enqueueSnackbar, handler]);

     return (
          <>
               <ListDeliveryChallans
                    deliveryChallans={handler.deliveryChallans}
                    pagination={handler.pagination}
                    loading={handler.loading}
                    loadingAction={handler.loadingAction}
                    permissions={handler.permissions}
                    searchTerm={handler.searchTerm}
                    cardCounts={handler.cardCounts}
                    deleteDialogOpen={handler.dialogState.deleteOpen}
                    convertDialogOpen={handler.dialogState.convertOpen}
                    onSearchChange={handler.handleSearchInputChange}
                    onPageChange={handler.handlePageChange}
                    onRowsPerPageChange={handler.handlePageSizeChange}
                    onView={handler.handleView}
                    onEdit={handler.handleEdit}
                    onDelete={handler.openDeleteDialog}
                    onConvert={handler.openConvertDialog}
                    onDeleteDialogClose={handler.closeDeleteDialog}
                    onDeleteConfirm={handler.handleDeleteConfirm}
                    onConvertDialogClose={handler.closeConvertDialog}
                    onConvertConfirm={handler.handleConvertConfirm}
               />

          </>
     );
};

const DeliveryChallanListIndex = props => {
     const snackbarAction = snackbarId => (
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