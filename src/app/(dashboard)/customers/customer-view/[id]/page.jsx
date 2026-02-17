import React from 'react'
import { getCustomerWithInvoices } from '../../actions'
import ViewCustomerIndex from '@/views/customers/viewCustomer/index'

export default async function ViewCustomerPage({ params }) {
  const { id } = params
  
  try {
    // Fetch customer data with invoices
    const customerData = await getCustomerWithInvoices(id)
    
    if (!customerData) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Customer Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The customer you are looking for does not exist.
            </p>
          </div>
        </div>
      )
    }

    return (
      <ViewCustomerIndex customerData={customerData} customerId={id} />
    )
  } catch (error) {
    console.error('Error loading customer data:', error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Customer
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'Failed to load customer data with invoices'}
          </p>
        </div>
      </div>
    )
  }
}