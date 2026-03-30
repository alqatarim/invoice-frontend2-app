import React from 'react';

import TrialBalanceView from '@/views/accounting/TrialBalanceView';
import { getTrialBalance } from '@/app/(dashboard)/accounting/actions';

const TrialBalancePage = async ({ searchParams }) => {
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const branchId = searchParams?.branchId || '';
  const report = await getTrialBalance({ startDate, endDate, branchId });

  return (
    <TrialBalanceView
      initialReport={report}
      initialFilters={{ startDate, endDate, branchId }}
    />
  );
};

export default TrialBalancePage;
