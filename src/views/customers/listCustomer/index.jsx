'use client'

import React from 'react'
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider'
import CustomerList from './CustomerList'

const CustomerListIndex = ({ initialListData }) => {
  const initialCustomers = initialListData?.customers || []
  const pagination = initialListData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  }
  const cardCounts = initialListData?.cardCounts

  return (
    <AppSnackbarProvider maxSnack={7}>
      <CustomerList
        initialCustomers={initialCustomers}
        initialPagination={pagination}
        initialCardCounts={cardCounts}
      />
    </AppSnackbarProvider>
  );
};

export default CustomerListIndex;