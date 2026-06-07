'use client';

import React, { useMemo, useState } from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

import { usePermission } from '@/Auth/usePermission';
import AppSnackbar from '@/components/shared/AppSnackbar';
import CustomDatePicker from '@/components/datePicker/CustomDatePicker';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { getTrialBalance } from '@/app/(dashboard)/accounting/actions';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import PageIconHeader from '@components/headers/PageIconHeader';
import AccountingReportTable from './AccountingReportTable';
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

  const handleReset = async () => {
    setStartDate('');
    setEndDate('');
    setBranchId('');
    setLoading(true);
    try {
      const nextReport = await getTrialBalance({ startDate: '', endDate: '', branchId: '' });
      setReport(nextReport);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to reset trial balance.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return <div>You do not have permission to view the trial balance.</div>;
  }

  return (
    <div className='flex flex-col gap-5'>
      <PageIconHeader className='' icon='tabler:scale' title='Trial Balance' />

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
