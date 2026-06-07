'use client';

import React, { useMemo, useState } from 'react';
import { Button, Typography, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';

import { usePermission } from '@/Auth/usePermission';
import AppSnackbar from '@/components/shared/AppSnackbar';
import CustomDatePicker from '@/components/datePicker/CustomDatePicker';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { getBalanceSheet } from '@/app/(dashboard)/accounting/actions';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import PageIconHeader from '@components/headers/PageIconHeader';
import AccountingReportTable from './AccountingReportTable';
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

  const handleReset = async () => {
    setAsOfDate('');
    setBranchId('');
    setLoading(true);
    try {
      const nextReport = await getBalanceSheet({ asOfDate: '', branchId: '' });
      setReport(nextReport);
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to reset balance sheet.', severity: 'error' });
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
      <PageIconHeader
        className=''
        icon='tabler:building-bank'
        title='Balance Sheet'
      // description='View assets, liabilities, and equity as of a selected date, with direct drilldowns into ledger accounts.'
      />

      <Grid container spacing={2.5} className='flex flex-row justify-start items-end'>
        <Grid size={{ xs: 12, md: 4 }}>
          <CustomDatePicker
            mode='single'
            value={asOfDate}
            onChange={setAsOfDate}
            label='As Of Date'
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
