import React from 'react';
import UsersListIndex from '@/views/users/usersList/index';
import { getInitialUsersData, getRoles } from '@/app/(dashboard)/users/actions';
import { getBranchesForDropdown } from '@/app/(dashboard)/branches/actions';

/**
 * UsersPage Component
 * Fetches initial users data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const UsersPage = async () => {
     let initialUsers = [];
     let initialPagination = {
          current: 1,
          pageSize: 10,
          total: 0,
     };
     let initialRoles = [];
     let initialBranches = [];
     let initialErrorMessage = '';

     try {
          const [initialUsersData, roles, branches] = await Promise.all([
               getInitialUsersData(),
               getRoles(),
               getBranchesForDropdown(),
          ]);

          initialUsers = initialUsersData?.users || [];
          initialPagination = initialUsersData?.pagination || initialPagination;
          initialRoles = roles || [];
          initialBranches = branches || [];
     } catch (error) {
          console.error('Failed to load users data:', error);
          initialErrorMessage = error?.message || 'Failed to load users.';
     }

     return (
          <UsersListIndex
               initialUsers={initialUsers}
               initialPagination={initialPagination}
               initialRoles={initialRoles}
               initialBranches={initialBranches}
               initialErrorMessage={initialErrorMessage}
          />
     );
};

export default UsersPage;
