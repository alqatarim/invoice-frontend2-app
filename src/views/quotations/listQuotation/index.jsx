'use client';

import React from "react";
import ListQuotation from "@/views/quotations/listQuotation/listQuotation";

const QuotationListIndex = ({ initialData, customers }) => {
  // Only extract and pass initial data as props
  const initialQuotations = initialData?.data || [];
  const pagination = initialData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const cardCounts = initialData?.cardCounts || {};

  return (
    <ListQuotation
      initialData={initialData}
      customers={customers}
    />
  );
};

export default QuotationListIndex;