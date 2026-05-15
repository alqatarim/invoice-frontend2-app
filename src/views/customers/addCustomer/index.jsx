'use client'

import React from 'react'
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider'
import AddCustomer from './AddCustomer'

const AddCustomerIndex = () => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <AddCustomer />
    </AppSnackbarProvider>
  )
}

export default AddCustomerIndex
export { default as AddCustomerDrawer } from './AddCustomerDrawer'