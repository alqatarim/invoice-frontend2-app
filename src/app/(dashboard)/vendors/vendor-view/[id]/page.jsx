import React from 'react';

import { getVendorById, getVendorLedger } from '@/app/(dashboard)/vendors/actions';
import VendorView from '@/views/vendors/viewVendor/index';
import ProtectedComponent from '@/components/ProtectedComponent';

/**
 * VendorViewPage Component
 * Server-side component to fetch vendor data and render the ViewVendor client component.
 *
 * @param {Object} params - Dynamic route parameters.
 * @param {string} params.id - Vendor ID from the URL.
 * @returns JSX.Element
 */
const VendorViewPage = async ({ params }) => {
  const { id } = params;

  return (
    <ProtectedComponent>
      <VendorView id={params.id} />
    </ProtectedComponent>
  );
}

export default VendorViewPage;