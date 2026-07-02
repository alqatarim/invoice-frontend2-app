'use client';

import { useMemo } from 'react';
import { useSession } from '@/Auth/SessionContext';

import {
  getPrimaryStoreBranch,
  mergeAccessibleStoreBranches,
  resolveBranchId,
  shouldRestrictToAssignedBranches,
} from '@/utils/branchAccess';

export default function useAccessibleStoreScope() {
  const { data: session } = useSession();
  const companyMembership = session?.user?.companyMembership || {};

  const storeBranches = useMemo(
    () => mergeAccessibleStoreBranches({ companyMembership }),
    [companyMembership]
  );

  const primaryStore = useMemo(
    () => getPrimaryStoreBranch(storeBranches, companyMembership?.primaryBranchId),
    [companyMembership?.primaryBranchId, storeBranches]
  );

  const defaultBranchId = resolveBranchId(primaryStore) || '';
  const hasStoreScope = storeBranches.length > 0;
  const isRestrictedToAssignedStores = shouldRestrictToAssignedBranches({
    hasAssignedScope: hasStoreScope,
    orgRole: companyMembership?.orgRole,
  });

  return {
    companyMembership,
    storeBranches,
    primaryStore,
    defaultBranchId,
    hasStoreScope,
    isRestrictedToAssignedStores,
  };
}
