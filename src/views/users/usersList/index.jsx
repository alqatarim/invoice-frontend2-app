'use client';

import React from 'react';
import UsersList from './UsersList';

const UsersListIndex = ({
     initialUsers = [],
     initialPagination = {
          current: 1,
          pageSize: 10,
          total: 0,
     },
     initialRoles = [],
     initialBranches = [],
     initialErrorMessage = '',
}) => {
     return (
          <UsersList
               initialUsers={initialUsers}
               pagination={initialPagination}
               initialRoles={initialRoles}
               initialBranches={initialBranches}
               initialErrorMessage={initialErrorMessage}
          />
     );
};

export default UsersListIndex;
