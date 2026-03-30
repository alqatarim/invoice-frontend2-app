'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

import {
  getPrimaryStoreBranch,
  mergeAccessibleStoreBranches,
  resolveBranchId,
} from '@/utils/branchAccess';

const ELEVATED_ORG_ROLES = new Set(['OWNER', 'COMPANY_ADMIN']);

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
  const isRestrictedToAssignedStores =
    hasStoreScope && !ELEVATED_ORG_ROLES.has(String(companyMembership?.orgRole || '').trim());

  return {
    companyMembership,
    storeBranches,
    primaryStore,
    defaultBranchId,
    hasStoreScope,
    isRestrictedToAssignedStores,
  };
}
