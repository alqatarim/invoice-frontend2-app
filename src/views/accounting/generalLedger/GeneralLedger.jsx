'use client';

import React from 'react';
import Link from 'next/link';
import { Button, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import CustomListTable from '@/components/custom-components/CustomListTable';
import StoreScopeSelect from '@/components/shared/StoreScopeSelect';
import AccountingPageHeader from '../components/AccountingPageHeader';
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
      <AccountingPageHeader
        icon='tabler:book'
        title='General Ledger'
        description='Drill into account activity, inspect journal lines, and open the related source document.'
      />

      <div className='flex flex-wrap items-end gap-4'>
        <TextField
          select
          label='Account'
          value={accountId}
          onChange={(event) => onAccountChange(event.target.value)}
          sx={{ minWidth: 320 }}
        >
          {accountOptions.map((option) => (
            <MenuItem key={option._id} value={option._id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type='date'
          label='Start Date'
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type='date'
          label='End Date'
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        {hasStoreScope ? (
          <StoreScopeSelect
            value={branchId}
            onChange={onBranchChange}
            branches={storeBranches}
            disabled={loading}
            allLabel={isRestrictedToAssignedStores ? 'All assigned stores' : 'All stores'}
          />
        ) : null}

        <Button
          variant='contained'
          startIcon={<Icon icon='tabler:filter' />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <Typography variant='caption' color='text.secondary'>
        {storeScopeHelperText}
      </Typography>

      {report?.account ? (
        <div className='flex flex-wrap gap-6 rounded border p-4'>
          <Typography variant='body1'>
            <strong>Account:</strong> {report.account.code} - {report.account.name}
          </Typography>
          <Typography variant='body1'>
            <strong>Store Scope:</strong>{' '}
            {selectedStore?.name ||
              (isRestrictedToAssignedStores ? 'Assigned stores' : 'All stores')}
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
