'use client';

import React, { useMemo, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

import { usePermission } from '@/Auth/usePermission';
import AppSnackbar from '@/components/shared/AppSnackbar';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { getIncomeStatement } from '@/app/(dashboard)/accounting/actions';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import AccountingPageHeader from './components/AccountingPageHeader';
import AccountingReportTable from './components/AccountingReportTable';
import { formatCurrency } from './utils';

const IncomeStatementView = ({
  initialReport = { sections: {}, totals: {} },
  initialFilters = {},
}) => {
  const router = useRouter();
  const canView = usePermission('incomeStatementReport', 'view');
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
      return `Refresh to review revenue and expenses for ${selectedStore.name} only.`;
    }

    if (isRestrictedToAssignedStores) {
      if (!hasStoreScope) {
        return 'This report is limited to assigned stores, but none are assigned to this account.';
      }

      if (primaryStore?.name) {
        return `Blank store scope keeps the income statement limited to your assigned stores. Primary store: ${primaryStore.name}.`;
      }

      return 'Blank store scope keeps the income statement limited to your assigned stores.';
    }

    return 'Choose a store to compare profitability by location.';
  }, [
    hasStoreScope,
    isRestrictedToAssignedStores,
    primaryStore?.name,
    selectedStore?.name,
  ]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const nextReport = await getIncomeStatement({ startDate, endDate, branchId });
      setReport(nextReport);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to load income statement.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return <div>You do not have permission to view the income statement.</div>;
  }

  const navigateToLedger = row => {
    const searchParams = new URLSearchParams({ accountId: row.accountId });
    if (startDate) searchParams.set('startDate', startDate);
    if (endDate) searchParams.set('endDate', endDate);
    if (branchId) searchParams.set('branchId', branchId);
    router.push(`/general-ledger?${searchParams.toString()}`);
  };

  return (
    <div className='flex flex-col gap-5'>
      <AccountingPageHeader
        icon='tabler:chart-bar'
        title='Income Statement'
        description='Review revenue, contra-revenue, COGS, and expenses for a selected period.'
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
        title='Revenue'
        rows={report?.sections?.revenue || []}
        onAccountClick={navigateToLedger}
      />
      <AccountingReportTable
        title='Contra Revenue'
        rows={report?.sections?.contraRevenue || []}
        onAccountClick={navigateToLedger}
      />
      <AccountingReportTable
        title='Cost Of Goods Sold'
        rows={report?.sections?.cogs || []}
        onAccountClick={navigateToLedger}
      />
      <AccountingReportTable
        title='Operating Expenses'
        rows={report?.sections?.expenses || []}
        onAccountClick={navigateToLedger}
      />

      <div className='rounded border p-4 flex flex-wrap gap-6'>
        <Typography variant='body1'><strong>Net Revenue:</strong> {formatCurrency(report?.totals?.netRevenue)}</Typography>
        <Typography variant='body1'><strong>COGS:</strong> {formatCurrency(report?.totals?.totalCogs)}</Typography>
        <Typography variant='body1'><strong>Gross Profit:</strong> {formatCurrency(report?.totals?.grossProfit)}</Typography>
        <Typography variant='body1'><strong>Expenses:</strong> {formatCurrency(report?.totals?.totalExpenses)}</Typography>
        <Typography variant='body1' color={Number(report?.totals?.netIncome || 0) >= 0 ? 'success.main' : 'error.main'}>
          <strong>Net Income:</strong> {formatCurrency(report?.totals?.netIncome)}
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

export default IncomeStatementView;
