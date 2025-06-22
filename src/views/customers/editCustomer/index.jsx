'use client'

import React from 'react'
import EditCustomer from './EditCustomer'

const EditCustomerIndex = ({ customerId, customerData }) => {
  return <EditCustomer customerId={customerId} customerData={customerData} />
}

export default EditCustomerIndex