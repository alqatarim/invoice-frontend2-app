'use client';

import React from 'react';
import UsersList from './UsersList';

const UsersListIndex = ({ initialData }) => {
     // Only extract and pass initial data as props
     const initialUsers = initialData?.users || initialData?.data || [];
     const pagination = initialData?.pagination || {
          current: 1,
          pageSize: 10,
          total: 0,
     };

     console.log('initialData');
     console.log(initialData);

     return (
          <UsersList
               initialUsers={initialUsers}
               pagination={pagination}
          />
     );
};

export default UsersListIndex;
