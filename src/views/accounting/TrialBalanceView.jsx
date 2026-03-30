'use client';

import React, { useMemo, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

import { usePermission } from '@/Auth/usePermission';
import AppSnackbar from '@/components/shared/AppSnackbar';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { getTrialBalance } from '@/app/(dashboard)/accounting/actions';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import AccountingPageHeader from './components/AccountingPageHeader';
import AccountingReportTable from './components/AccountingReportTable';
import { formatCurrency } from './utils';

const TrialBalanceView = ({
  initialReport = { rows: [], totals: {} },
  initialFilters = {},
}) => {
  const router = useRouter();
  const canView = usePermission('trialBalanceReport', 'view');
  const {
    storeBranches,
    primaryStore,
    hasStoreScope,
    isRestrictedToAssignedStores,
  } = useAccessibleStoreScope();

  const [report, setReport] = useState(initialReport);
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [branchId, setBranchId] = useState(initialFilters.branchId || '');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedStore = useMemo(
    () => findBranchByIdentifier(storeBranches, branchId),
    [branchId, storeBranches]
  );

  const storeScopeHelperText = useMemo(() => {
    if (selectedStore?.name) {
      return `Refresh to review balances for ${selectedStore.name} only.`;
    }

    if (isRestrictedToAssignedStores) {
      if (!hasStoreScope) {
        return 'This report is limited to assigned stores, but none are assigned to this account.';
      }

      if (primaryStore?.name) {
        return `Leaving store scope blank keeps the report limited to your assigned stores. Primary store: ${primaryStore.name}.`;
      }

      return 'Leaving store scope blank keeps the report limited to your assigned stores.';
    }

    return 'Choose a store to narrow the trial balance to one location.';
  }, [
    hasStoreScope,
    isRestrictedToAssignedStores,
    primaryStore?.name,
    selectedStore?.name,
  ]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const nextReport = await getTrialBalance({ startDate, endDate, branchId });
      setReport(nextReport);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to load trial balance.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return <div>You do not have permission to view the trial balance.</div>;
  }

  return (
    <div className='flex flex-col gap-5'>
      <AccountingPageHeader
        icon='tabler:scale'
        title='Trial Balance'
        description='Review posted debits and credits by account and drill into the general ledger.'
      />

      <div className='flex flex-wrap gap-4 items-end'>
        <TextField
          type='date'
          label='Start Date'
          value={startDate}
          onChange={event => setStartDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type='date'
          label='End Date'
          value={endDate}
          onChange={event => setEndDate(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        {hasStoreScope ? (
          <StoreScopeSelect
            value={branchId}
            onChange={setBranchId}
            branches={storeBranches}
            disabled={loading}
            allLabel={isRestrictedToAssignedStores ? 'All assigned stores' : 'All stores'}
          />
        ) : null}
        <Button variant='contained' startIcon={<Icon icon='tabler:filter' />} onClick={loadReport} disabled={loading}>
          Refresh
        </Button>
      </div>
      <Typography variant='caption' color='text.secondary'>
        {storeScopeHelperText}
      </Typography>

      <AccountingReportTable
        title='Trial Balance Rows'
        rows={report?.rows || []}
        onAccountClick={row => {
          const searchParams = new URLSearchParams({ accountId: row.accountId });
          if (startDate) searchParams.set('startDate', startDate);
          if (endDate) searchParams.set('endDate', endDate);
          if (branchId) searchParams.set('branchId', branchId);
          router.push(`/general-ledger?${searchParams.toString()}`);
        }}
      />

      <div className='rounded border p-4 flex flex-wrap gap-6'>
        <Typography variant='body1'><strong>Total Debit:</strong> {formatCurrency(report?.totals?.totalDebit)}</Typography>
        <Typography variant='body1'><strong>Total Credit:</strong> {formatCurrency(report?.totals?.totalCredit)}</Typography>
        <Typography variant='body1' color={report?.totals?.isBalanced ? 'success.main' : 'error.main'}>
          <strong>Status:</strong> {report?.totals?.isBalanced ? 'Balanced' : 'Out of balance'}
        </Typography>
      </div>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default TrialBalanceView;
