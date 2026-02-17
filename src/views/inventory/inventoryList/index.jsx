'use client';

import React from "react";
import InventoryList from "@/views/inventory/inventoryList/InventoryList";

const InventoryListIndex = ({ initialData }) => {
  // Only extract and pass initial data as props
  const initialInventory = initialData?.inventory || [];
  const pagination = initialData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const cardCounts = initialData?.cardCounts || {};
  const initialBranchInventory = initialData?.branchInventory || [];
  const branchPagination = initialData?.branchPagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const branches = initialData?.branches || [];
  const provincesCities = initialData?.provincesCities || [];

  return (
    <InventoryList
      initialInventory={initialInventory}
      pagination={pagination}
      cardCounts={cardCounts}
      initialBranchInventory={initialBranchInventory}
      initialBranchPagination={branchPagination}
      initialBranches={branches}
      initialProvincesCities={provincesCities}
    />
  );
};

export default InventoryListIndex;