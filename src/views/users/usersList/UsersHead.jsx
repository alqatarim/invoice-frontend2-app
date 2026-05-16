'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * UsersHead Component - Displays users statistics header
 */
const UsersHead = ({ users = [] }) => {
     // Calculate statistics based on actual users data
     const statsData = useMemo(() => {
          const totalUsers = users.length;
          const companyAdmins = users.filter(user =>
               ['OWNER', 'COMPANY_ADMIN'].includes(user.companyRole || user.orgRole)
          ).length;
          const storeScopedUsers = users.filter(
               user => Array.isArray(user.assignedBranchIds) && user.assignedBranchIds.length > 0
          ).length;

          return {
               totalUsers: { count: totalUsers, amount: totalUsers },
               companyAdmins: { count: companyAdmins, amount: companyAdmins },
               storeScopedUsers: { count: storeScopedUsers, amount: storeScopedUsers },
          };
     }, [users]);

     const statCards = useMemo(
          () => [
               {
                    title: 'Total Members',
                    value: statsData.totalUsers.count,
                    subtitle: 'Company And Store Team',
                    icon: 'mdi:account-group',
                    color: 'primary',
               },
               {
                    title: 'Company Admins',
                    value: statsData.companyAdmins.count,
                    subtitle: 'Owner And Company Admin',
                    icon: 'mdi:shield-account-outline',
                    color: 'info',
               },
               {
                    title: 'Store Members',
                    value: statsData.storeScopedUsers.count,
                    subtitle: 'Assigned To Stores',
                    icon: 'mdi:store-cog-outline',
                    color: 'success',
               },
          ],
          [statsData]
     );

     return (
          <>
               <PageIconHeader title='Team' icon='mdi:account-group' />

               <div className="mb-2">
                    <Grid container className='flex flex-wrap justify-between gap-0'>
                         {statCards.map((card) => (
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
