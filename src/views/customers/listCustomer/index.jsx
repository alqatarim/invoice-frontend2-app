'use client'

import React from 'react'
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider'
import CustomerList from './CustomerList'
import { getDefaultCustomerSummary } from './customerSummary'

const CustomerListIndex = ({
  initialCustomers = [],
  initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0
  },
  initialSummary = getDefaultCustomerSummary()
}) => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <CustomerList
        initialCustomers={initialCustomers}
        initialPagination={initialPagination}
        initialSummary={initialSummary}
      />
    </AppSnackbarProvider>
  );
};

export default CustomerListIndex;