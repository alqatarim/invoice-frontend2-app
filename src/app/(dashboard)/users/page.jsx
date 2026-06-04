import React from 'react';
import UsersListIndex from '@/views/users/usersList/index';
import { getUsersListPageData, getRoles } from '@/app/(dashboard)/users/actions';
import { getBranchesForDropdown } from '@/app/(dashboard)/branches/actions';

const UsersPage = async () => {
  let initialListData = {
    users: [],
    pagination: { current: 1, pageSize: 10, total: 0 },
    cardCounts: {},
  };
  let initialRoles = [];
  let initialBranches = [];
  let initialErrorMessage = '';

  try {
    initialListData = await getUsersListPageData();
  } catch (error) {
    console.error('Failed to load users data:', error);
    initialErrorMessage = error?.message || 'Failed to load users.';
  }

  const [rolesResult, branchesResult] = await Promise.allSettled([
    getRoles(),
    getBranchesForDropdown(),
  ]);

  if (rolesResult.status === 'fulfilled') {
    initialRoles = rolesResult.value || [];
  } else {
    console.error('Failed to load user roles:', rolesResult.reason);
  }

  if (branchesResult.status === 'fulfilled') {
    initialBranches = branchesResult.value || [];
  } else {
    console.error('Failed to load branches:', branchesResult.reason);
  }

  return (
    <UsersListIndex
      initialListData={initialListData}
      initialRoles={initialRoles}
      initialBranches={initialBranches}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default UsersPage;
