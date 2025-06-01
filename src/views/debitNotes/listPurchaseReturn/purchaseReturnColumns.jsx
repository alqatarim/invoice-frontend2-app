import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import dayjs from 'dayjs';
import OptionMenu from '@core/components/option-menu';

/**
 * Purchase Return table column definitions
 */
export const getPurchaseReturnColumns = ({ theme, permissions }) => [
  {
    key: 'debitNoteId',
    visible: true,
    label: 'Return ID',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/debitNotes/purchaseReturn-view/${row._id}`} passHref>
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium"
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
        {row.purchaseOrderDate ? dayjs(row.purchaseOrderDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'vendor',
    visible: true,
    label: 'Vendor',
    sortable: true,
    renderCell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Icon icon="tabler:building-warehouse" width="1rem" color={theme.palette.success.main} />
        </div>
        <div className="flex flex-col">
          <Link href={`/vendors/vendor-view/${row.vendorId?._id}`} passHref>
            <Typography
              variant="body1"
              className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline font-medium'
            >
              {row.vendorId?.vendor_name || 'Deleted Vendor'}
            </Typography>
          </Link>
          <Typography variant="caption" color="textSecondary">
            {row.vendorId?.vendor_phone || ''}
          </Typography>
        </div>
      </div>
    ),
  },
  {
    key: 'amounts',
    label: 'Return Amount',
    visible: true,
    align: 'center',
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;
      
      return (
        <div className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-green-50">
          <Icon icon="tabler:arrow-back-up" width="0.75rem" color={theme.palette.success.main} />
          <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.success.main} />
          <Typography color="success.main" className='text-[0.9rem] font-medium'>
            {total.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
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
    renderCell: (row) => {
      const today = dayjs();
      const dueDate = dayjs(row.dueDate);
      const daysUntilDue = dueDate.diff(today, 'day');
      
      let colorClass = 'text-inherit';
      let iconColor = theme.palette.text.secondary;
      let icon = 'tabler:calendar';
      
      if (daysUntilDue < 0) {
        colorClass = 'text-error';
        iconColor = theme.palette.error.main;
        icon = 'tabler:alert-circle';
      } else if (daysUntilDue <= 7) {
        colorClass = 'text-warning';
        iconColor = theme.palette.warning.main;
        icon = 'tabler:clock-hour-4';
      }

      return (
        <Box className="flex items-center justify-center gap-1">
          <Icon icon={icon} width="0.75rem" color={iconColor} />
          <Typography 
            variant="body1" 
            className={`text-[0.9rem] whitespace-nowrap ${colorClass}`}
          >
            {row.dueDate ? dayjs(row.dueDate).format('DD MMM YY') : 'N/A'}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      // For purchase returns, we can have statuses like Pending, Processed, Approved, Rejected
      const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
          case 'processed':
          case 'approved':
            return 'success';
          case 'pending':
            return 'warning';
          case 'rejected':
          case 'cancelled':
            return 'error';
          case 'draft':
            return 'info';
          default:
            return 'default';
        }
      };

      const status = row.status || 'Pending';

      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={status}
          color={getStatusColor(status)}
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
            onClick: () => handlers.handleClone(row._id)
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

        options.push({
          text: 'Process Return',
          icon: <Icon icon="tabler:package-import" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleProcessReturn && handlers.handleProcessReturn(row._id)
          }
        });

        options.push({
          text: 'Email to Vendor',
          icon: <Icon icon="mdi:email-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleEmailVendor && handlers.handleEmailVendor(row._id, row.vendorId)
          }
        });
      }

      if (permissions.canDelete) {
        options.push({
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleDelete(row._id)
          }
        });
      }

      return options.length ? (
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
          options={options}
        />
      ) : null;
    },
  },
];