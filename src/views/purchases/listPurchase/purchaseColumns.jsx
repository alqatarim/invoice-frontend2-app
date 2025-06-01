import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, LinearProgress } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import OptionMenu from '@core/components/option-menu';

/**
 * Purchase table column definitions
 */
export const getPurchaseColumns = ({ theme, permissions }) => [
  {
    key: 'purchaseId',
    visible: true,
    label: 'Purchase ID',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/purchases/purchase-view/${row._id}`} passHref>
        <Typography
          className="cursor-pointer text-primary hover:underline"
          align='center'
        >
          {row.purchaseId || 'N/A'}
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
        {row.purchaseDate ? moment(row.purchaseDate).format('DD MMM YY') : 'N/A'}
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Icon icon="tabler:building-store" width="1rem" color={theme.palette.primary.main} />
        </div>
        <div className="flex flex-col">
          <Link href={`/vendor/vendor-view/${row.vendorId?._id}`} passHref>
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
      const getStatusColor = (status) => {
        switch (status) {
          case 'PAID':
            return 'success';
          case 'Pending':
            return 'warning';
          case 'Overdue':
            return 'error';
          case 'Cancelled':
            return 'secondary';
          default:
            return 'default';
        }
      };

      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={row.status || 'N/A'}
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
          href: `/purchases/purchase-view/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          href: `/purchases/purchase-edit/${row._id}`,
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
          iconButtonProps={{ size: 'medium' }}
          iconClassName='text-textSecondary'
          options={options}
        />
      ) : null;
    },
  },
];