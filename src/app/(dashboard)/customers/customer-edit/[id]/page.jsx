import React from 'react'
import { getCustomerById } from '../../actions'
import ProtectedComponent from '@/components/ProtectedComponent'
import EditCustomerIndex from '@/views/customers/editCustomer/index'

export default async function EditCustomerPage({ params }) {
  const { id } = params
  
  try {
    // Fetch customer data
    const customerData = await getCustomerById(id)
    
    if (!customerData) {
      return (
        <ProtectedComponent>
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
        </ProtectedComponent>
      )
    }

    return (
      <ProtectedComponent>
        <EditCustomerIndex customerData={customerData} customerId={id} />
      </ProtectedComponent>
    )
  } catch (error) {
    console.error('Error loading customer data:', error)
    return (
      <ProtectedComponent>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Customer
            </h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'Failed to load customer data'}
            </p>
          </div>
        </div>
      </ProtectedComponent>
    )
  }
}