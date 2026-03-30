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
      initialCustomers={initialCustomerData?.customers || []}
      initialPagination={initialCustomerData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      initialCardCounts={
        initialCustomerData?.cardCounts || {
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0
        }
      }
    />
  );
};

export default CustomersPage;