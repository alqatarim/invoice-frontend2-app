'use client';

import React from "react";
import ListPaymentSummary from "@/views/payment-summary/listPaymentSummary/listPaymentSummary";
import AppSnackbar from '@/components/shared/AppSnackbar';
import { usePaymentSummaryListHandler } from './handler';

const PaymentSummaryListIndex = ({
     initialPaymentSummaries = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialErrorMessage = '',
}) => {
     const handler = usePaymentSummaryListHandler({
          initialPaymentSummaries,
          initialPagination,
          initialErrorMessage,
     });

     return (
          <>
               <ListPaymentSummary
                    paymentSummaries={handler.paymentSummaries}
                    pagination={handler.pagination}
                    loading={handler.loading}
                    permissions={handler.permissions}
                    searchTerm={handler.searchTerm}
                    cardCounts={handler.cardCounts}
                    onSearchChange={handler.setSearchTerm}
                    onPageChange={handler.handlePageChange}
                    onRowsPerPageChange={handler.handlePageSizeChange}
                    onView={handler.handleView}
                    onExport={handler.handleExport}
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

export default PaymentSummaryListIndex;