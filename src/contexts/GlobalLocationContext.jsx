'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import {
  findBranchByIdentifier,
  isStoreBranch,
  mergeAccessibleBranches,
  resolveBranchId,
} from '@/utils/branchAccess';

const GlobalLocationContext = createContext(null);
const GLOBAL_LOCATION_STORAGE_PREFIX = 'globalLocationSelection';

const getStorageKey = ({ userId = '', companyId = '' } = {}) =>
  `${GLOBAL_LOCATION_STORAGE_PREFIX}.${userId || 'anonymous'}.${companyId || 'default'}`;

const getLocationTypeLabel = (location = null) =>
  String(location?.branchType || location?.kind || '').trim();

const buildStoreOnlyValidationMessage = (location = null) => {
  if (!location) {
    return 'Choose a location from the top bar.';
  }

  if (isStoreBranch(location)) {
    return '';
  }

  const locationType = getLocationTypeLabel(location) || 'location';
  const normalizedType =
    locationType.charAt(0).toLowerCase() + locationType.slice(1);

  return `${
    location?.name || 'The selected location'
  } is a ${normalizedType}. Choose a store from the top bar to continue.`;
};

export function GlobalLocationProvider({ children }) {
  const { data: session } = useSession();
  const companyMembership = session?.user?.companyMembership || {};

  const assignedBranches = useMemo(
    () => mergeAccessibleBranches({ companyMembership }),
    [companyMembership]
  );
  const primaryLocation =
    findBranchByIdentifier(assignedBranches, companyMembership?.primaryBranchId) ||
    assignedBranches[0] ||
    null;
  const storageKey = getStorageKey({
    userId: String(session?.user?.id || session?.user?._id || ''),
    companyId: String(
      companyMembership?.companyId?._id || companyMembership?.companyId || ''
    ),
  });

  const [selectedLocationIdState, setSelectedLocationIdState] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setSelectedLocationIdState(window.localStorage.getItem(storageKey) || '');
  }, [storageKey]);

  const selectedLocation =
    (selectedLocationIdState === null
      ? null
      : findBranchByIdentifier(assignedBranches, selectedLocationIdState)) ||
    primaryLocation ||
    null;
  const selectedLocationId = resolveBranchId(selectedLocation);
  const selectedLocationType = getLocationTypeLabel(selectedLocation);
  const isStoreSelected = isStoreBranch(selectedLocation);
  const storeOnlyValidationMessage =
    buildStoreOnlyValidationMessage(selectedLocation);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      selectedLocationIdState === null ||
      !assignedBranches.length
    ) return;

    const nextLocationId = selectedLocationId || '';

    if (selectedLocationIdState !== nextLocationId) {
      setSelectedLocationIdState(nextLocationId);
    }

    if (!nextLocationId) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, nextLocationId);
  }, [assignedBranches.length, selectedLocationId, selectedLocationIdState, storageKey]);

  const selectLocation = useCallback((locationId) => {
    const nextLocationId = String(locationId || '');

    setSelectedLocationIdState(nextLocationId);

    if (typeof window === 'undefined') return;

    if (!nextLocationId) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, nextLocationId);
  }, [storageKey]);

  const value = useMemo(
    () => ({
      assignedBranches,
      primaryLocation,
      selectedLocation,
      selectedLocationId,
      selectedLocationType,
      isStoreSelected,
      storeOnlyValidationMessage,
      selectLocation,
    }),
    [
      assignedBranches,
      primaryLocation,
      selectedLocation,
      selectedLocationId,
      selectedLocationType,
      isStoreSelected,
      storeOnlyValidationMessage,
      selectLocation,
    ]
  );

  return (
    <GlobalLocationContext.Provider value={value}>
      {children}
    </GlobalLocationContext.Provider>
  );
}

export function useGlobalLocationScope() {
  const context = useContext(GlobalLocationContext);

  if (!context) {
    throw new Error(
      'useGlobalLocationScope must be used within a GlobalLocationProvider.'
    );
  }

  return context;
}
