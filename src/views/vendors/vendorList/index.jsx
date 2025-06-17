'use client'

import React from "react";
import VendorList from "@/views/vendors/vendorList/VendorList";

const VendorListIndex = ({ initialData }) => {
  return (
    <VendorList
      initialVendors={initialData?.vendors || []}
      initialPagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
    />
  );
};

export default VendorListIndex;