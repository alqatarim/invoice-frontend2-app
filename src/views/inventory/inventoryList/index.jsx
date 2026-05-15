'use client';

import React from "react";
import InventoryList from "@/views/inventory/inventoryList/InventoryList";

const InventoryListIndex = ({
  initialInventory = [],
  initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0
  },
  initialCardCounts = {},
  initialBranchInventory = [],
  initialBranchPagination = {
    current: 1,
    pageSize: 10,
    total: 0
  },
  initialBranches = [],
  initialProvincesCities = [],
  initialErrorMessage = '',
}) => {
  return (
    <InventoryList
      initialInventory={initialInventory}
      initialPagination={initialPagination}
      initialCardCounts={initialCardCounts}
      initialBranchInventory={initialBranchInventory}
      initialBranchPagination={initialBranchPagination}
      initialBranches={initialBranches}
      initialProvincesCities={initialProvincesCities}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default InventoryListIndex;