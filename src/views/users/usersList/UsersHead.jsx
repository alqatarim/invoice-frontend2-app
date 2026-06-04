'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { orgRoleOptions } from '@/data/dataSets';
/**
 * UsersHead — reads list summary card counts (same pattern as InvoiceHead / CustomerHead).
 */
const UsersHead = ({ userListData = {} }) => {
  const cardCounts = useMemo(
    () => ({
      totalUsers: Number(userListData?.totalUsers || 0),
      companyAdmins: Number(userListData?.companyAdmins || 0),
      storeAdmins: Number(userListData?.storeAdmins || 0),
      storeMembers: Number(userListData?.storeMembers || 0),
    }),
    [userListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total',
        value: cardCounts.totalUsers,
        icon: orgRoleOptions.find(opt => opt.value === 'ALL')?.icon || 'mdi:users-group-outline',
        color: orgRoleOptions.find(opt => opt.value === 'ALL')?.color || 'primary',
      },
      {
        title: 'Company Admins',
        value: cardCounts.companyAdmins,
        icon: orgRoleOptions.find(opt => opt.value === 'COMPANY_ADMIN')?.icon || 'mdi:shield-account-outline',
        color: orgRoleOptions.find(opt => opt.value === 'COMPANY_ADMIN')?.color || 'info',
      },
      {
        title: 'Store Admins',
        value: cardCounts.storeAdmins,
        icon: orgRoleOptions.find(opt => opt.value === 'STORE_ADMIN')?.icon || 'mdi:store-cog-outline',
        color: orgRoleOptions.find(opt => opt.value === 'STORE_ADMIN')?.color || 'warning',
      },
      {
        title: 'Store Members',
        value: cardCounts.storeMembers,
        icon: orgRoleOptions.find(opt => opt.value === 'STORE_MEMBER')?.icon || 'mdi:account-outline',
        color: 'success',
      },
    ],
    [cardCounts]
  );

  return (
    <>
      <PageIconHeader title="Team" icon="mdi:users-group-outline" />

      <div className="mb-2">
        <Grid container className="flex flex-wrap justify-between gap-0">
          {statCards.map(card => (
            <Grid key={card.title}>
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default UsersHead;
