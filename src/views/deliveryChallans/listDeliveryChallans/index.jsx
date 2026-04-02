'use client';

import React from "react";
import ListDeliveryChallans from "@/views/deliveryChallans/listDeliveryChallans/listDeliveryChallans";
import AppSnackbar from '@/components/shared/AppSnackbar';
import { useDeliveryChallanListHandler } from './handler';

const DeliveryChallanListIndex = ({
     initialDeliveryChallans = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialErrorMessage = '',
}) => {
     const handler = useDeliveryChallanListHandler({
          initialDeliveryChallans,
          initialPagination,
          initialErrorMessage,
     });

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
                    onSearchChange={handler.setSearchTerm}
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

               <AppSnackbar
                    open={handler.snackbar.open}
                    message={handler.snackbar.message}
                    severity={handler.snackbar.severity}
                    onClose={handler.closeSnackbar}
                    autoHideDuration={6000}
               />
          </>
     );
};

export default DeliveryChallanListIndex;