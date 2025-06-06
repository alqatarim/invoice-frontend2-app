import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import OptionMenu from '@core/components/option-menu';

/**
 * Sales Return table column definitions
 */
export const getSalesReturnColumns = ({ theme, permissions }) => [
  {
    key: 'salesReturnId',
    visible: true,
    label: 'Sales Return ID',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/sales-return/sales-return-view/${row._id}`} passHref>
        <Typography
          className="cursor-pointer text-primary hover:underline"
          align='center'
        >
          {row.credit_note_id || 'N/A'}
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
        {row.createdAt ? moment(row.createdAt).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'customer',
    visible: true,
    label: 'Customer',
    sortable: true,
    renderCell: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Icon icon="tabler:user" width="1rem" color={theme.palette.warning.main} />
        </div>
        <div className="flex flex-col">
          <Link href={`/customers/customer-view/${row.customerId?._id}`} passHref>
            <Typography
              variant="body1"
              className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline font-medium'
            >
              {row.customerId?.name || 'Deleted Customer'}
            </Typography>
          </Link>
          <Typography variant="caption" color="textSecondary">
            {row.customerId?.phone || ''}
          </Typography>
        </div>
      </div>
    ),
  },
  {
    key: 'amounts',
    label: 'Refund Amount',
    visible: true,
    align: 'center',
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;
      
      return (
        <div className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-red-50">
          <Icon icon="tabler:minus" width="0.75rem" color={theme.palette.error.main} />
          <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.error.main} />
          <Typography color="error.main" className='text-[0.9rem] font-medium'>
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
    key: 'paymentMode',
    visible: true,
    label: 'Payment Mode',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.paymentMode || '-'}
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
      const getStatusColor = (status) => {
        switch (status) {
          case 'Paid':
            return 'success';
          case 'Pending':
            return 'warning';
          case 'Cancelled':
            return 'error';
          case 'Refunded':
            return 'info';
          default:
            return 'default';
        }
      };

      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={row.status || 'Pending'}
          color={getStatusColor(row.status)}
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
          href: `/sales-return/sales-return-view/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          href: `/sales-return/sales-return-edit/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
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
          text: 'Process Refund',
          icon: <Icon icon="mdi:cash-refund" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleProcessRefund && handlers.handleProcessRefund(row._id)
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