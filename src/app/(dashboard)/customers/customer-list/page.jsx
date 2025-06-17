import React from 'react';
import CustomerListIndex from '@/views/customers/listCustomer/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialCustomerData, searchCustomers } from '@/app/(dashboard)/customers/actions';

/**
 * CustomersPage Component
 * Fetches initial customer data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const CustomersPage = async () => {
  try {
    // Fetch initial customer data and customers list separately on the server
    const [initialData, customers] = await Promise.all([
      getInitialCustomerData(),
      searchCustomers('') // Get all customers by passing empty search term
    ]);

    return (
      <ProtectedComponent>
        <CustomerListIndex
          initialData={initialData}
          initialCustomers={customers}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('CustomersPage: Error fetching data:', error);
    return (
      <ProtectedComponent>
        <div className="text-red-600 p-8">
          Failed to load customer data: {error.message}
        </div>
      </ProtectedComponent>
    );
  }
};

export default CustomersPage;