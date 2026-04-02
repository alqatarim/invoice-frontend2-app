'use client'

import React from 'react'
import SalesReturnList from './SalesReturnList'

const SalesReturnListIndex = ({
  initialSalesReturns = [],
  initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0
  },
  initialErrorMessage = ''
}) => {
  return (
    <SalesReturnList
      initialSalesReturns={initialSalesReturns}
      pagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default SalesReturnListIndex;