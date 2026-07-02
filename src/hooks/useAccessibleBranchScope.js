'use client';

import { useMemo } from 'react';
import { useSession } from '@/Auth/SessionContext';

import {
  findBranchByIdentifier,
  mergeAccessibleBranches,
  resolveBranchId,
  shouldRestrictToAssignedBranches,
} from '@/utils/branchAccess';

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
  const isRestrictedToAssignedBranches = shouldRestrictToAssignedBranches({
    hasAssignedScope: hasAssignedBranchScope,
    orgRole: companyMembership?.orgRole,
  });

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
