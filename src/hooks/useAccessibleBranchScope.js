'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';

import {
  findBranchByIdentifier,
  mergeAccessibleBranches,
  resolveBranchId,
} from '@/utils/branchAccess';

const ELEVATED_ORG_ROLES = new Set(['OWNER', 'COMPANY_ADMIN']);

export default function useAccessibleBranchScope({ branchesData = [] } = {}) {
  const { data: session } = useSession();
  const companyMembership = session?.user?.companyMembership || {};

  const assignedBranches = useMemo(
    () => mergeAccessibleBranches({ companyMembership, branchesData }),
    [branchesData, companyMembership]
  );

  const branchOptions = assignedBranches.length
    ? assignedBranches
    : (Array.isArray(branchesData) ? branchesData : []);

  const primaryBranch = useMemo(
    () => findBranchByIdentifier(branchOptions, companyMembership?.primaryBranchId),
    [branchOptions, companyMembership?.primaryBranchId]
  );

  const hasAssignedBranchScope = assignedBranches.length > 0;
  const isRestrictedToAssignedBranches =
    hasAssignedBranchScope && !ELEVATED_ORG_ROLES.has(String(companyMembership?.orgRole || '').trim());

  return {
    companyMembership,
    assignedBranches,
    branchOptions,
    primaryBranch,
    defaultBranchId: resolveBranchId(primaryBranch) || resolveBranchId(branchOptions[0]) || '',
    hasAssignedBranchScope,
    isRestrictedToAssignedBranches,
  };
}
