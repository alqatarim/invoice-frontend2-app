// app/vendors/vendor-list/page.jsx

import React from 'react';
import VendorListIndex from '@/views/vendors/vendorList/index';
import { getInitialVendorData } from '@/app/(dashboard)/vendors/actions';

/**
 * VendorsPage Component - Optimized to prevent race conditions
 */
const VendorsPage = async () => {
  let initialVendors = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialErrorMessage = '';

  try {
    const initialData = await getInitialVendorData();
    initialVendors = initialData?.vendors || [];
    initialPagination = initialData?.pagination || initialPagination;
  } catch (error) {
    console.error('VendorsPage: Error fetching data:', error);
    initialErrorMessage = error?.message || 'Failed to load vendor data.';
  }

  return (
    <VendorListIndex
      initialVendors={initialVendors}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default VendorsPage;