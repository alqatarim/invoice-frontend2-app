'use client';

import React from "react";
import { Box, Paper } from '@mui/material';
import ViewPaymentSummary from "@/views/payment-summary/viewPaymentSummary/ViewPaymentSummary";

const PaymentSummaryViewIndex = ({
     initialPaymentData = null,
     initialErrorMessage = '',
}) => {
     if (initialErrorMessage) {
          return (
               <Box className="p-6">
                    <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                         {initialErrorMessage}
                    </Paper>
               </Box>
          );
     }

     return (
          <ViewPaymentSummary
               paymentData={initialPaymentData}
          />

     );
};

export default PaymentSummaryViewIndex;