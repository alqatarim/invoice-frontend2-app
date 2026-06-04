'use client';

import React from 'react';
import UsersList from './UsersList';
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider';

const UsersListIndex = ({
  initialListData,
  initialRoles = [],
  initialBranches = [],
  initialErrorMessage = '',
}) => {
  const initialUsers = initialListData?.users || [];
  const pagination = initialListData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  const cardCounts = initialListData?.cardCounts || {};

  return (
    <AppSnackbarProvider maxSnack={7}>
      <UsersList
        initialUsers={initialUsers}
        initialPagination={pagination}
        initialCardCounts={cardCounts}
        initialRoles={initialRoles}
        initialBranches={initialBranches}
        initialErrorMessage={initialErrorMessage}
      />
    </AppSnackbarProvider>
  );
};

export default UsersListIndex;
