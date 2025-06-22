'use client'

import React from 'react'
import ViewCustomer from './ViewCustomer'

const ViewCustomerIndex = ({ customerId, customerData }) => {
  return <ViewCustomer customerId={customerId} customerData={customerData} />
}

export default ViewCustomerIndex