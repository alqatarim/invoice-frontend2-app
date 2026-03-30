'use client'

import React from 'react'
import CustomerList from './CustomerList'

const CustomerListIndex = ({
  initialCustomers = [],
  initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0
  },
  initialCardCounts = {
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0
  }
}) => {
  return (
    <CustomerList
      initialCustomers={initialCustomers}
      initialPagination={initialPagination}
      initialCardCounts={initialCardCounts}
    />
  );
};

export default CustomerListIndex;