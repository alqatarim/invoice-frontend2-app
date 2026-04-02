'use client';

import React from "react";
import ListQuotation from "@/views/quotations/listQuotation/listQuotation";

const QuotationListIndex = ({
  initialQuotations = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCustomers = [],
  initialErrorMessage = ''
}) => {
  return (
    <ListQuotation
      initialQuotations={initialQuotations}
      initialPagination={initialPagination}
      initialCustomers={initialCustomers}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default QuotationListIndex;