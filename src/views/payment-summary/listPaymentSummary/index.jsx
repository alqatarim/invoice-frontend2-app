'use client';

import React from "react";
import ListPaymentSummary from "@/views/payment-summary/listPaymentSummary/listPaymentSummary";

const PaymentSummaryListIndex = ({ initialData, customers }) => {
     return (
          <ListPaymentSummary
               initialData={initialData}
               customers={customers}
          />
     );
};

export default PaymentSummaryListIndex;