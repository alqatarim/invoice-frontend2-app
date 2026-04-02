'use client'

import React from "react";
import VendorList from "@/views/vendors/vendorList/VendorList";

const VendorListIndex = ({
  initialVendors = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  return (
    <VendorList
      initialVendors={initialVendors}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default VendorListIndex;