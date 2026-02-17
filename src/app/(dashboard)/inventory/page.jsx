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
  let initialData = {
    inventory: [],
    pagination: { current: 1, pageSize: 10, total: 0 },
    cardCounts: {},
    branchInventory: [],
    branchPagination: { current: 1, pageSize: 10, total: 0 },
    branches: [],
    provincesCities: [],
  };

  try {
    const [inventoryData, branchData, branches, provincesCities] = await Promise.all([
      getInitialInventoryData(),
      getBranchInventory(1, 10),
      getBranchesForDropdown(),
      getProvincesCities(),
    ]);

    initialData = {
      ...initialData,
      ...(inventoryData || {}),
      branchInventory: branchData?.branches || [],
      branchPagination: branchData?.pagination || initialData.branchPagination,
      branches: Array.isArray(branches) ? branches : [],
      provincesCities: Array.isArray(provincesCities) ? provincesCities : [],
    };
  } catch (error) {
    console.error('Failed to fetch initial inventory data:', error);
  }

  return (
    <InventoryList initialData={initialData} />
  );
};

export default InventoryPage;