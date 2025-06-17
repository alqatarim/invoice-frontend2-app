'use client'

import React from "react";
import CustomerList from "@/views/customers/listCustomer/CustomerList";

const CustomerListIndex = ({ initialData, initialCustomers }) => {
  // Extract and pass initial data as props - Fix the data path
  const initialCustomerList = initialData?.data?.customers || [];
  const pagination = initialData?.data?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const cardCounts = initialData?.data?.cardCounts || {
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0
  };

  return (
    <CustomerList
      initialCustomers={initialCustomerList}
      pagination={pagination}
      cardCounts={cardCounts}
      initialCustomerOptions={initialCustomers || []}
    />
  );
};

export default CustomerListIndex;