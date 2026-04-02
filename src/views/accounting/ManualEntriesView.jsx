'use client';

import React, { useMemo } from 'react';
import { Button, Chip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

import CustomListTable from '@/components/custom-components/CustomListTable';
import AccountingPageHeader from './components/AccountingPageHeader';
import AccountingEntryDetailsDialog from './components/AccountingEntryDetailsDialog';
import JournalEntryFormDialog from './components/JournalEntryFormDialog';
import { formatCurrency, formatDate } from './utils';

const ManualEntriesView = ({
  type = 'journal',
  accountOptions = [],
  entries = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  loading = false,
  canView = false,
  canCreate = false,
  canUpdate = false,
  dialogOpen = false,
  detailsEntry = null,
  onSearch,
  onCreate,
  onReverse,
  onOpenDialog,
  onCloseDialog,
  onOpenEntry,
  onCloseEntry,
}) => {
  const columns = useMemo(() => [
    {
      key: 'entryNumber',
      label: 'Entry No',
    },
    {
      key: 'entryDate',
      label: 'Date',
      renderCell: row => formatDate(row.entryDate),
    },
    {
      key: 'narration',
      label: 'Narration',
    },
    {
      key: 'totalDebit',
      label: 'Debit',
      align: 'right',
      renderCell: row => formatCurrency(row.totalDebit),
    },
    {
      key: 'totalCredit',
      label: 'Credit',
      align: 'right',
      renderCell: row => formatCurrency(row.totalCredit),
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: row => (
        <Chip
          size='small'
          color={row.status === 'POSTED' ? 'success' : row.status === 'REVERSED' ? 'default' : 'warning'}
          label={row.status}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      renderCell: row => (
        canUpdate && row.status === 'POSTED' ? (
          <IconButton
            onClick={event => {
              event.stopPropagation();
              onReverse(row);
            }}
          >
            <Icon icon='tabler:rotate-clockwise-2' />
          </IconButton>
        ) : null
      ),
    },
  ], [canUpdate]);

  if (!canView) {
    return <div>You do not have permission to view this module.</div>;
  }

  return (
    <div className='flex flex-col gap-5'>
      <AccountingPageHeader
        icon={type === 'voucher' ? 'tabler:file-dollar' : 'tabler:book-2'}
        title={type === 'voucher' ? 'Vouchers' : 'Journals'}
        description={type === 'voucher'
          ? 'Create manual vouchers and review posted voucher history.'
          : 'Create manual journals and review posted journal history.'}
      />

      <CustomListTable
        title={type === 'voucher' ? 'Voucher List' : 'Journal List'}
        columns={columns}
        rows={entries}
        rowKey={row => row._id}
        showSearch
        onSearchChange={value => fetchEntries({ search: value, page: 1 })}
        searchPlaceholder={type === 'voucher' ? 'Search vouchers...' : 'Search journals...'}
        addRowButton={canCreate ? (
          <Button
            variant='contained'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={onOpenDialog}
          >
            {type === 'voucher' ? 'New Voucher' : 'New Journal'}
          </Button>
        ) : null}
        loading={loading}
        noDataText={type === 'voucher' ? 'No vouchers found.' : 'No journals found.'}
        pagination={{
          page: Math.max(0, (pagination.current || 1) - 1),
          pageSize: pagination.pageSize || 10,
          total: pagination.total || 0,
        }}
        onPageChange={nextPage => onSearch({ page: nextPage + 1, pageSize: pagination.pageSize || 10 })}
        onRowsPerPageChange={nextPageSize => onSearch({ page: 1, pageSize: nextPageSize })}
        onRowClick={row => onOpenEntry(row)}
      />

      <JournalEntryFormDialog
        open={dialogOpen}
        onClose={onCloseDialog}
        onSubmit={onCreate}
        accounts={accountOptions}
        type={type}
        loading={loading}
      />

      <AccountingEntryDetailsDialog
        open={Boolean(detailsEntry)}
        onClose={onCloseEntry}
        entry={detailsEntry}
      />
    </div>
  );
};

export default ManualEntriesView;
