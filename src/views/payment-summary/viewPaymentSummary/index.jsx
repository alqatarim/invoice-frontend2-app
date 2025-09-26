'use client';

import React from "react";
import ViewPaymentSummary from "@/views/payment-summary/viewPaymentSummary/ViewPaymentSummary";

const PaymentSummaryListIndex = ({ paymentData, paymentId }) => {

     return (
          <ViewPaymentSummary
               paymentData={paymentData}
               paymentId={paymentId}
          />

     );
};

export default PaymentSummaryListIndex;