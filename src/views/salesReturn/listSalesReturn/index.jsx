'use client'

import React from 'react'
import SalesReturnList from './SalesReturnList'

const SalesReturnListIndex = ({ initialData, initialSalesReturns }) => {
  // Extract and pass initial data as props
  const initialSalesReturnList = initialData?.salesReturns || initialSalesReturns || [];
  const pagination = initialData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };

  return (
    <SalesReturnList
      initialSalesReturns={initialSalesReturnList}
      pagination={pagination}
    />
  );
};

export default SalesReturnListIndex;