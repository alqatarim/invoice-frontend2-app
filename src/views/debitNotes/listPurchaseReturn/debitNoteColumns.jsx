import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, LinearProgress } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { statusOptions } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';

/**
 * Debit Note table column definitions
 */
export const getDebitNoteColumns = ({ theme, permissions }) => [
  {
    key: 'debitNoteNumber',
    visible: true,
    label: 'Debit Note No',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/debitNotes/purchaseReturn-view/${row._id}`} passHref>
        <Typography
          className="cursor-pointer text-primary hover:underline"
          align='center'
        >
          {row.debit_note_id || 'N/A'}
        </Typography>
      </Link>
    ),
  },
  {
    key: 'createdOn',
    visible: true,
    label: 'Created',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
        {row.purchaseOrderDate ? moment(row.purchaseOrderDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'vendorTo',
    visible: true,
    label: 'Vendor',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/vendors/vendor-view/${row.vendorId?._id}`} passHref>
        <Typography
          variant="body1"
          className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline'
        >
          {row.vendorId?.vendor_name || 'Deleted Vendor'}
        </Typography>
      </Link>
    ),
  },
  {
    key: 'amounts',
    label: 'Amount',
    visible: true,
    align: 'center',
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;
      const paid = Number(row.paidAmount) || 0;
      const percentPaid = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

      return (
        <div className="flex flex-col min-w-[130px] w-full">
          <div className="flex flex-row justify-between items-center mb-0.5 w-full">
            <Typography color="text.primary" className='text-[0.9rem]'>{paid}</Typography>
            <div className="flex items-center gap-1 min-w-[48px] justify-end">
              <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
              <Typography color="text.primary" className='text-[0.9rem] font-medium'>{total}</Typography>
            </div>
          </div>
          <div className="flex-1 w-full">
            <LinearProgress variant="determinate" color='info' value={percentPaid} />
          </div>
        </div>
      );
    },
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
        {row.dueDate ? moment(row.dueDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      const statusOption = statusOptions.find(opt => opt.value === row.status);
      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={statusOption?.label || ''}
          color={statusOption?.color || 'default'}
        />
      );
    },
  },
  {
    key: 'action',
    label: '',
    visible: true,
    align: 'right',
    renderCell: (row, handlers) => {
      const options = [];

      if (permissions.canView) {
        options.push({
          text: 'View',
          icon: <Icon icon="mdi:eye-outline" />,
          href: `/debitNotes/purchaseReturn-view/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          href: `/debitNotes/purchaseReturn-edit/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canCreate) {
        options.push({
          text: 'Clone',
          icon: <Icon icon="mdi:content-duplicate" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleClone(row.id || row._id)
          }
        });

        options.push({
          text: 'Send',
          icon: <Icon icon="mdi:invoice-send-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleSend(row.id || row._id)
          }
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Print & Download',
          icon: <Icon icon="mdi:printer-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handlePrintDownload(row._id)
          }
        });
      }

      if (permissions.canDelete) {
        options.push({
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-error',
            onClick: () => handlers.handleDelete(row._id)
          }
        });
      }

      return (
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
          options={options}
        />
      );
    },
  },
];