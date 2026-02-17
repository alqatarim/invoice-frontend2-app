import React from 'react';
import CustomerListIndex from '@/views/customers/listCustomer/index';
import { getInitialCustomerData, searchCustomers } from '@/app/(dashboard)/customers/actions';

/**
 * CustomersPage Component
 * Fetches initial customer data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const CustomersPage = async () => {
  // Fetch initial customer data on the server
  const initialData = await getInitialCustomerData();

  return (
    <CustomerListIndex 
      initialData={initialData} 
      initialCustomers={initialData.customers || []}
    />
  );
};

export default CustomersPage;