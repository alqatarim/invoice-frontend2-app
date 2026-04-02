'use client';

import { useMemo, useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import { useInventoryListHandlers } from '@/handlers/inventory/useInventoryListHandlers';
import { useBranchInventoryHandlers } from '@/handlers/inventory/useBranchInventoryHandlers';
import useAccessibleBranchScope from '@/hooks/useAccessibleBranchScope';

const buildLocationTreeFromBranches = (branchList = []) => {
  const provinceMap = new Map();

  (Array.isArray(branchList) ? branchList : []).forEach((branch) => {
    const province = String(branch?.province || '').trim();
    const city = String(branch?.city || '').trim();
    const district = String(branch?.district || '').trim();

    if (!province || !city) {
      return;
    }

    if (!provinceMap.has(province)) {
      provinceMap.set(province, { province, cities: new Map() });
    }

    const provinceEntry = provinceMap.get(province);
    if (!provinceEntry.cities.has(city)) {
      provinceEntry.cities.set(city, { name: city, districts: new Set() });
    }

    if (district) {
      provinceEntry.cities.get(city).districts.add(district);
    }
  });

  return [...provinceMap.values()]
    .sort((left, right) => left.province.localeCompare(right.province))
    .map((provinceEntry) => ({
      province: provinceEntry.province,
      cities: [...provinceEntry.cities.values()]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((cityEntry) => ({
          name: cityEntry.name,
          districts: [...cityEntry.districts].sort((left, right) => left.localeCompare(right)),
        })),
    }));
};

export function useInventoryListViewHandler({
  initialInventory = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialBranchInventory = [],
  initialBranchPagination = { current: 1, pageSize: 10, total: 0 },
  initialBranches = [],
  initialProvincesCities = [],
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialErrorMessage = '',
}) {
  const permissions = {
    canCreate: usePermission('inventory', 'create'),
    canUpdate: usePermission('inventory', 'update'),
    canView: usePermission('inventory', 'view'),
    canDelete: usePermission('inventory', 'delete'),
  };

  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const branches = useMemo(
    () => (Array.isArray(initialBranches) ? initialBranches : []),
    [initialBranches]
  );
  const provincesCities = useMemo(
    () => (Array.isArray(initialProvincesCities) ? initialProvincesCities : []),
    [initialProvincesCities]
  );

  const branchScope = useAccessibleBranchScope({ branchesData: branches });
  const branchOptions = useMemo(
    () => (branchScope.branchOptions.length ? branchScope.branchOptions : branches),
    [branchScope.branchOptions, branches]
  );
  const scopedProvincesCities = useMemo(() => {
    const derivedLocations = buildLocationTreeFromBranches(branchOptions);
    return derivedLocations.length ? derivedLocations : provincesCities;
  }, [branchOptions, provincesCities]);
  const scopeHelperText = useMemo(() => {
    if (branchScope.isRestrictedToAssignedBranches) {
      if (branchScope.primaryBranch?.name) {
        return `Only your assigned branches are visible here. Primary branch: ${branchScope.primaryBranch.name}. Transfers and branch selectors stay inside this scope.`;
      }

      return 'Only your assigned branches are visible here. Transfers and branch selectors stay inside this scope.';
    }

    return 'Inventory actions respect your current company access. Branch selectors only show locations available to your role.';
  }, [branchScope.isRestrictedToAssignedBranches, branchScope.primaryBranch?.name]);

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  };

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  };

  const handlers = useInventoryListHandlers({
    initialInventory,
    initialPagination,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    onError: showError,
    onSuccess: showSuccess,
  });

  const branchHandlers = useBranchInventoryHandlers({
    initialBranches: initialBranchInventory,
    initialPagination: initialBranchPagination,
    onError: showError,
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return {
    permissions,
    handlers,
    branchHandlers,
    branchScope,
    branchOptions,
    scopedProvincesCities,
    scopeHelperText,
    snackbar,
    handleSnackbarClose,
    onError: showError,
  };
}
