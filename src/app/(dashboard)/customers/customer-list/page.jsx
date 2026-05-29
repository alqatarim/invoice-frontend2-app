import React from 'react';
import CustomerListIndex from '@/views/customers/listCustomer/index';
import { getInitialCustomerData } from '@/app/(dashboard)/customers/actions';

/**
 * CustomersPage Component
 * Fetches initial customer data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const CustomersPage = async () => {
  const initialCustomerData = await getInitialCustomerData();

  return (
    <CustomerListIndex
      initialListData={initialCustomerData}
    />
  );
};

export default CustomersPage;