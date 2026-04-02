'use client';

import React from "react";
import InventoryList from "@/views/inventory/inventoryList/InventoryList";
import { useInventoryListViewHandler } from './handler';

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
  const handler = useInventoryListViewHandler({
    initialInventory,
    initialPagination,
    initialBranchInventory,
    initialBranchPagination,
    initialBranches,
    initialProvincesCities,
    initialErrorMessage,
  });

  return (
    <InventoryList
      initialInventory={initialInventory}
      pagination={initialPagination}
      cardCounts={initialCardCounts}
      initialBranchInventory={initialBranchInventory}
      initialBranchPagination={initialBranchPagination}
      permissions={handler.permissions}
      handlers={handler.handlers}
      branchHandlers={handler.branchHandlers}
      branchScope={handler.branchScope}
      branchOptions={handler.branchOptions}
      scopedProvincesCities={handler.scopedProvincesCities}
      scopeHelperText={handler.scopeHelperText}
      onError={handler.onError}
      snackbar={handler.snackbar}
      onSnackbarClose={handler.handleSnackbarClose}
    />
  );
};

export default InventoryListIndex;