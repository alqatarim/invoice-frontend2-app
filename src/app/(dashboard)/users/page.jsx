import React from 'react';
import UsersListIndex from '@/views/users/usersList/index';
import { getInitialUsersData, getRoles } from '@/app/(dashboard)/users/actions';

/**
 * UsersPage Component
 * Fetches initial users data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const UsersPage = async () => {
     // Fetch initial users data on the server
     const [initialData, initialRoles] = await Promise.all([
          getInitialUsersData(),
          getRoles(),
     ]);



     return (
          <UsersListIndex
               initialData={initialData}
               initialRoles={initialRoles}
          />
     );
};

export default UsersPage;
