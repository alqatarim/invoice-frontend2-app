import React from 'react'
import ProtectedComponent from '@/components/ProtectedComponent'
import AddCustomerIndex from '@/views/customers/addCustomer/index'

export default function AddCustomerPage() {
  return (
    <ProtectedComponent>
      <AddCustomerIndex />
    </ProtectedComponent>
  )
}