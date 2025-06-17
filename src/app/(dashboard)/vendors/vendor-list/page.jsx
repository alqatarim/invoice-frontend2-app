// app/vendors/vendor-list/page.jsx

import React from 'react';
import VendorListIndex from '@/views/vendors/vendorList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialVendorData } from '@/app/(dashboard)/vendors/actions';

/**
 * VendorsPage Component - Optimized to prevent race conditions
 */
const VendorsPage = async () => {
  try {
    // Single server-side data fetch
    const initialData = await getInitialVendorData();

    return (
      <ProtectedComponent>
        <VendorListIndex initialData={initialData} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('VendorsPage: Error fetching data:', error);
    return (
      <ProtectedComponent>
        <div className="text-red-600 p-8">
          Failed to load vendor data: {error.message}
        </div>
      </ProtectedComponent>
    );
  }
};

export default VendorsPage;