import React from 'react';
import UsersListIndex from '@/views/users/usersList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialUsersData } from '@/app/(dashboard)/users/actions';

/**
 * UsersPage Component
 * Fetches initial users data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const UsersPage = async () => {
     // Fetch initial users data on the server


     const initialData = await getInitialUsersData();



     return (
          <ProtectedComponent>
               <UsersListIndex
                    initialData={initialData}
               />
          </ProtectedComponent>
     );
};

export default UsersPage;
