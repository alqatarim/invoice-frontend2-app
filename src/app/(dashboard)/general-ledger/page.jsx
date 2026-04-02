import React from 'react';

import GeneralLedgerIndex from '@/views/accounting/generalLedger';
import {
  getAccountDropdown,
  getGeneralLedger,
} from '@/app/(dashboard)/accounting/actions';

const GeneralLedgerPage = async ({ searchParams }) => {
  const accountId = searchParams?.accountId || '';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const branchId = searchParams?.branchId || '';

  const [accountOptionsResult, reportResult] = await Promise.allSettled([
    getAccountDropdown(),
    accountId
      ? getGeneralLedger({ accountId, startDate, endDate, branchId })
      : Promise.resolve(null),
  ]);

  const initialAccountOptions =
    accountOptionsResult.status === 'fulfilled' ? accountOptionsResult.value || [] : [];
  const initialReport = reportResult.status === 'fulfilled' ? reportResult.value : null;
  const errorMessages = [];

  if (accountOptionsResult.status === 'rejected') {
    errorMessages.push(
      accountOptionsResult.reason?.message || 'Failed to load general ledger account options.'
    );
  }

  if (reportResult.status === 'rejected') {
    errorMessages.push(
      reportResult.reason?.message || 'Failed to load the requested general ledger report.'
    );
  }

  return (
    <GeneralLedgerIndex
      initialReport={initialReport}
      initialAccountOptions={initialAccountOptions}
      initialAccountId={accountId}
      initialStartDate={startDate}
      initialEndDate={endDate}
      initialBranchId={branchId}
      initialErrorMessage={errorMessages.join(' ')}
    />
  );
};

export default GeneralLedgerPage;
