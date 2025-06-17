import React from 'react'
import { getCustomerWithInvoices } from '../../actions'
import ProtectedComponent from '@/components/ProtectedComponent'
import ViewCustomerIndex from '@/views/customers/viewCustomer/index'

export default async function ViewCustomerPage({ params }) {
  const { id } = params
  
  // Fetch customer data with invoices
  const formData = new FormData()
  formData.append('id', id)
  
  const result = await getCustomerWithInvoices(formData)
  
  if (!result.success) {
    return (
      <ProtectedComponent>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Customer Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {result.error || 'The customer you are looking for does not exist.'}
            </p>
          </div>
        </div>
      </ProtectedComponent>
    )
  }

  return (
    <ProtectedComponent>
      <ViewCustomerIndex customerData={result.data} customerId={id} />
    </ProtectedComponent>
  )
}