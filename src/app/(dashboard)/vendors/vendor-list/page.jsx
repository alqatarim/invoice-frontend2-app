// app/vendors/vendor-list/page.jsx

import React from 'react';
import VendorListIndex from '@/views/vendors/vendorList/index';
import { getInitialVendorData } from '@/app/(dashboard)/vendors/actions';

/**
 * VendorsPage Component - Optimized to prevent race conditions
 */
const VendorsPage = async () => {
  try {
    // Single server-side data fetch
    const initialData = await getInitialVendorData();

    return (
      <VendorListIndex initialData={initialData} />
    );
  } catch (error) {
    console.error('VendorsPage: Error fetching data:', error);
    return (
      <div className="text-red-600 p-8">
        Failed to load vendor data: {error.message}
      </div>
    );
  }
};

export default VendorsPage;