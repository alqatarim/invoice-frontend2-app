'use client';

import React, { useMemo, useState } from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

import { usePermission } from '@/Auth/usePermission';
import AppSnackbar from '@/components/shared/AppSnackbar';
import CustomDatePicker from '@/components/datePicker/CustomDatePicker';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { getIncomeStatement } from '@/app/(dashboard)/accounting/actions';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import PageIconHeader from '@components/headers/PageIconHeader';
import AccountingReportTable from './AccountingReportTable';
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

  const handleReset = async () => {
    setStartDate('');
    setEndDate('');
    setBranchId('');
    setLoading(true);
    try {
      const nextReport = await getIncomeStatement({ startDate: '', endDate: '', branchId: '' });
      setReport(nextReport);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to reset income statement.', severity: 'error' });
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
      <PageIconHeader
        className=''
        icon='tabler:chart-bar'
        title='Income Statement'
      // description='Review revenue, contra-revenue, COGS, and expenses for a selected period.'
      />

      <Grid container spacing={2.5} className='flex flex-row justify-start items-end'>
        <Grid size={{ xs: 12, md: 4 }}>
          <CustomDatePicker
            mode='range'
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            label='Date Range'
            disabled={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {hasStoreScope ? (
            <StoreScopeSelect
              fullWidth
              size='small'
              value={branchId}
              onChange={setBranchId}
              branches={storeBranches}
              disabled={loading}
              allLabel={isRestrictedToAssignedStores ? 'All assigned stores' : 'All Stores'}
            />
          ) : null}
        </Grid>
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button fullWidth variant='contained' onClick={loadReport} disabled={loading}>
            Apply
          </Button>
          <Button fullWidth variant='outlined' onClick={handleReset} disabled={loading}>
            Reset
          </Button>
        </Grid>
      </Grid>


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
