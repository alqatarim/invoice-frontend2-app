'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Grid, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import CustomListTable from '@/components/custom-components/CustomListTable';
import CustomDatePicker from '@/components/datePicker/CustomDatePicker';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import PageIconHeader from '@components/headers/PageIconHeader';
import { formatCurrency, formatDate, getSourceHref } from '../utils';

const GeneralLedger = ({
  accountOptions = [],
  accountId = '',
  startDate = '',
  endDate = '',
  branchId = '',
  report = null,
  loading = false,
  storeBranches = [],
  hasStoreScope = false,
  isRestrictedToAssignedStores = false,
  selectedStore = null,
  storeScopeHelperText = '',
  onAccountChange,
  onStartDateChange,
  onEndDateChange,
  onBranchChange,
  onRefresh,
  onReset,
  onOpenEntry,
}) => {
  const columns = [
    {
      key: 'entryNumber',
      label: 'Entry No',
    },
    {
      key: 'entryDate',
      label: 'Date',
      renderCell: (row) => formatDate(row.entryDate),
    },
    {
      key: 'narration',
      label: 'Narration',
    },
    {
      key: 'branchId',
      label: 'Store',
      renderCell: (row) => row.branchId || 'Company',
    },
    {
      key: 'debit',
      label: 'Debit',
      align: 'right',
      renderCell: (row) => formatCurrency(row.debit),
    },
    {
      key: 'credit',
      label: 'Credit',
      align: 'right',
      renderCell: (row) => formatCurrency(row.credit),
    },
    {
      key: 'runningBalance',
      label: 'Running Balance',
      align: 'right',
      renderCell: (row) =>
        `${formatCurrency(row.runningBalance)} ${row.runningBalanceSide || ''}`,
    },
    {
      key: 'source',
      label: 'Source',
      renderCell: (row) => {
        const href = getSourceHref({
          sourceType: row.sourceType,
          sourceId: row.sourceId,
        });

        if (!href) return row.sourceType || '-';

        return (
          <Button component={Link} href={href} size='small'>
            {row.sourceType}
          </Button>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      renderCell: (row) => (
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onOpenEntry(row);
          }}
        >
          <Icon icon='tabler:eye' />
        </IconButton>
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-5'>
      <PageIconHeader
        className=''
        icon='tabler:book'
        title='General Ledger'
      />

      <Grid container spacing={2.5} className='flex flex-row justify-start items-end'>
        <Grid size={{ xs: 12, md: 3 }}>
          <CustomDatePicker
            mode='range'
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            label='Date Range'
            disabled={loading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size='small'
            select
            label='Account'
            value={accountId}
            onChange={(event) => onAccountChange(event.target.value)}
          >
            {accountOptions.map((option) => (
              <MenuItem key={option._id} value={option._id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          {hasStoreScope ? (
            <StoreScopeSelect
              fullWidth
              size='small'
              value={branchId}
              onChange={onBranchChange}
              branches={storeBranches}
              disabled={loading}
              allLabel={isRestrictedToAssignedStores ? 'All assigned stores' : 'All Stores'}
            />
          ) : null}
        </Grid>

        <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Button fullWidth variant='contained' onClick={onRefresh} disabled={loading}>
            Apply
          </Button>
          <Button fullWidth variant='outlined' onClick={onReset} disabled={loading}>
            Reset
          </Button>
        </Grid>
      </Grid>


      {report?.account ? (
        <div className='flex flex-wrap gap-6 rounded border p-4'>
          <Typography variant='body1'>
            <strong>Account:</strong> {report.account.code} - {report.account.name}
          </Typography>
          <Typography variant='body1'>
            <strong>Store Scope:</strong>{' '}
            {selectedStore?.name ||
              (isRestrictedToAssignedStores ? 'Assigned stores' : 'All Stores')}
          </Typography>
          <Typography variant='body1'>
            <strong>Total Debit:</strong> {formatCurrency(report?.totals?.totalDebit)}
          </Typography>
          <Typography variant='body1'>
            <strong>Total Credit:</strong> {formatCurrency(report?.totals?.totalCredit)}
          </Typography>
          <Typography variant='body1'>
            <strong>Closing:</strong> {formatCurrency(report?.totals?.closingBalance)}{' '}
            {report?.totals?.closingBalanceSide || ''}
          </Typography>
        </div>
      ) : null}

      <CustomListTable
        title='Ledger Rows'
        columns={columns}
        rows={report?.rows || []}
        rowKey={(row) => `${row.entryId}-${row.entryNumber}`}
        noDataText={accountId ? 'No ledger rows found.' : 'Choose an account to load the ledger.'}
        loading={loading}
        pagination={{
          page: 0,
          pageSize: report?.rows?.length || 10,
          total: report?.rows?.length || 0,
        }}
      />
    </div>
  );
};

export default GeneralLedger;
