'use client'

import React from "react";
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';
import VendorList from "@/views/vendors/vendorList/VendorList";

const VendorListIndex = ({
  initialVendors = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  return (
    <AppSnackbarProvider maxSnack={7}>
      <VendorList
        initialVendors={initialVendors}
        initialPagination={initialPagination}
        initialErrorMessage={initialErrorMessage}
      />
    </AppSnackbarProvider>
  );
};

export default VendorListIndex;