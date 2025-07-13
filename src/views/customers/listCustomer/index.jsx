'use client'

import React from 'react'
import CustomerList from './CustomerList'

const CustomerListIndex = ({ initialData, initialCustomers }) => {
  // Extract and pass initial data as props
  const initialCustomerList = initialData?.customers || [];
  const pagination = initialData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const cardCounts = initialData?.cardCounts || {
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0
  };

  return (
    <CustomerList
      initialCustomers={initialCustomerList}
      pagination={pagination}
      cardCounts={cardCounts}
    />
  );
};

export default CustomerListIndex;