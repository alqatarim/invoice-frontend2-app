import React from 'react';
import InventoryList from '@/views/inventory/inventoryList/index';
import { getInitialInventoryData } from './actions';
import { getBranchInventory, getBranchesForDropdown, getProvincesCities } from '@/app/(dashboard)/branches/actions';

/**
 * InventoryPage Component
 * Server component that fetches initial data and passes to client component.
 *
 * @returns JSX.Element
 */
const InventoryPage = async () => {
  // Fetch initial data on the server
  let initialInventory = [];
  let initialPagination = { current: 1, pageSize: 10, total: 0 };
  let initialCardCounts = {};
  let initialBranchInventory = [];
  let initialBranchPagination = { current: 1, pageSize: 10, total: 0 };
  let initialBranches = [];
  let initialProvincesCities = [];
  let initialErrorMessage = '';

  try {
    const [inventoryData, branchData, branches, provincesCities] = await Promise.all([
      getInitialInventoryData(),
      getBranchInventory(1, 10),
      getBranchesForDropdown(),
      getProvincesCities(),
    ]);

    initialInventory = inventoryData?.inventory || [];
    initialPagination = inventoryData?.pagination || initialPagination;
    initialCardCounts = inventoryData?.cardCounts || {};
    initialBranchInventory = branchData?.branches || [];
    initialBranchPagination = branchData?.pagination || initialBranchPagination;
    initialBranches = Array.isArray(branches) ? branches : [];
    initialProvincesCities = Array.isArray(provincesCities) ? provincesCities : [];
  } catch (error) {
    console.error('Failed to fetch initial inventory data:', error);
    initialErrorMessage = error?.message || 'Failed to fetch initial inventory data.';
  }

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

export default InventoryPage;