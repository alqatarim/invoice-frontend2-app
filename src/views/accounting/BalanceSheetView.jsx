'use client';

import React, { useMemo, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

import { usePermission } from '@/Auth/usePermission';
import AppSnackbar from '@/components/shared/AppSnackbar';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { getBalanceSheet } from '@/app/(dashboard)/accounting/actions';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import AccountingPageHeader from './components/AccountingPageHeader';
import AccountingReportTable from './components/AccountingReportTable';
import { formatCurrency } from './utils';

const BalanceSheetView = ({
  initialReport = { sections: {}, totals: {} },
  initialFilters = {},
}) => {
  const router = useRouter();
  const canView = usePermission('balanceSheetReport', 'view');
  const {
    storeBranches,
    primaryStore,
    hasStoreScope,
    isRestrictedToAssignedStores,
  } = useAccessibleStoreScope();

  const [report, setReport] = useState(initialReport);
  const [asOfDate, setAsOfDate] = useState(initialFilters.asOfDate || '');
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
      return `Refresh to review the balance sheet for ${selectedStore.name} only.`;
    }

    if (isRestrictedToAssignedStores) {
      if (!hasStoreScope) {
        return 'This report is limited to assigned stores, but none are assigned to this account.';
      }

      if (primaryStore?.name) {
        return `Blank store scope keeps the balance sheet limited to your assigned stores. Primary store: ${primaryStore.name}.`;
      }

      return 'Blank store scope keeps the balance sheet limited to your assigned stores.';
    }

    return 'Choose a store to inspect one location without losing the accounting drilldown.';
  }, [
    hasStoreScope,
    isRestrictedToAssignedStores,
    primaryStore?.name,
    selectedStore?.name,
  ]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const nextReport = await getBalanceSheet({ asOfDate, branchId });
      setReport(nextReport);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to load balance sheet.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return <div>You do not have permission to view the balance sheet.</div>;
  }

  const navigateToLedger = row => {
    const searchParams = new URLSearchParams({ accountId: row.accountId });
    if (asOfDate) searchParams.set('endDate', asOfDate);
    if (branchId) searchParams.set('branchId', branchId);
    router.push(`/general-ledger?${searchParams.toString()}`);
  };

  return (
    <div className='flex flex-col gap-5'>
      <AccountingPageHeader
        icon='tabler:building-bank'
        title='Balance Sheet'
        description='View assets, liabilities, and equity as of a selected date, with direct drilldowns into ledger accounts.'
      />

      <div className='flex flex-wrap gap-4 items-end'>
        <TextField
          type='date'
          label='As Of Date'
          value={asOfDate}
          onChange={event => setAsOfDate(event.target.value)}
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
        title='Assets'
        rows={report?.sections?.assets || []}
        onAccountClick={navigateToLedger}
      />
      <AccountingReportTable
        title='Liabilities'
        rows={report?.sections?.liabilities || []}
        onAccountClick={navigateToLedger}
      />
      <AccountingReportTable
        title='Equity'
        rows={report?.sections?.equity || []}
        onAccountClick={row => {
          if (!row.accountId) return;
          navigateToLedger(row);
        }}
      />

      <div className='rounded border p-4 flex flex-wrap gap-6'>
        <Typography variant='body1'><strong>Assets:</strong> {formatCurrency(report?.totals?.assetTotal)}</Typography>
        <Typography variant='body1'><strong>Liabilities:</strong> {formatCurrency(report?.totals?.liabilityTotal)}</Typography>
        <Typography variant='body1'><strong>Equity:</strong> {formatCurrency(report?.totals?.equityTotal)}</Typography>
        <Typography variant='body1' color={report?.totals?.difference === 0 ? 'success.main' : 'error.main'}>
          <strong>Difference:</strong> {formatCurrency(report?.totals?.difference)}
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

export default BalanceSheetView;
