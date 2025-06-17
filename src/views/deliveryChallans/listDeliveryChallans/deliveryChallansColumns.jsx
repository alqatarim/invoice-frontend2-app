import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Avatar } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';
import { getInitials } from '@/utils/string';

/**
 * Delivery challan table column definitions
 */
export const getDeliveryChallanColumns = ({ theme, permissions }) => [
  {
    key: 'deliveryChallanNumber',
    visible: true,
    label: 'Challan ID',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/deliveryChallans/deliveryChallans-view/${row._id}`} passHref>
        <Typography
          className="cursor-pointer text-primary hover:underline"
          align='center'
        >
          {row.deliveryChallanNumber || 'N/A'}
        </Typography>
      </Link>
    ),
  },
    {
    key: 'customerName',
    visible: true,
    label: 'Customer Name',
    sortable: true,
    renderCell: (row) => {
      const customer = row.customerId || {};
      const customerName = customer.name || 'Deleted Customer';
      const customerImage = customer.image || '';

      return (
        <div className="flex items-center gap-3">
          {customerImage ? (
            <Avatar
              src={customerImage}
              alt={customerName}
              sx={{ width: 32, height: 32 }}
            />
          ) : (
            <CustomAvatar skin='light' size={32}>
              {getInitials(customerName)}
            </CustomAvatar>
          )}
          {customer._id ? (
            <Link href={`/customers/customer-view/${customer._id}`} passHref>
              <Typography
                variant="body1"
                className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline'
              >
                {customerName}
              </Typography>
            </Link>
          ) : (
            <Typography
              variant="body1"
              className='text-[0.9rem] text-start text-textPrimary'
            >
              {customerName}
            </Typography>
          )}
        </div>
      );
    },
  },
  {
    key: 'customerPhone',
    visible: true,
    label: 'Phone',
    sortable: true,
    renderCell: (row) => {
      const customer = row.customerId || {};
      const customerPhone = customer.phone || '';

      return (
        <Typography
          variant="body1"
          className='text-[0.9rem] text-start text-textPrimary'
        >
          {customerPhone || 'N/A'}
        </Typography>
      );
    },
  },
  {
    key: 'amount',
    label: 'Amount',
    visible: true,
    align: 'center',
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;

      return (
        <div className="flex items-center gap-1 justify-center">
          <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
          <Typography color="text.primary" className='text-[0.9rem] font-medium'>{total}</Typography>
        </div>
      );
    },
  },
  {
    key: 'createdOn',
    visible: true,
    label: 'Created',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
        {row.deliveryChallanDate ? moment(row.deliveryChallanDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'action',
    label: 'Action',
    visible: true,
    align: 'center',
    renderCell: (row, handlers) => {
      const options = [];

      if (permissions.canView) {
        options.push({
          text: 'View',
          icon: <Icon icon="mdi:eye-outline" />,
          href: `/deliveryChallans/deliveryChallans-view/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
          }
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          href: `/deliveryChallans/deliveryChallans-edit/${row._id}`,
          linkProps: {
            className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
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

      if (permissions.canCreate) {
        options.push({
          text: 'Clone',
          icon: <Icon icon="mdi:content-duplicate" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleClone(row._id)
          }
        });

        options.push({
          text: 'Convert to Invoice',
          icon: <Icon icon="mdi:file-export-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleConvertToInvoice({ _id: row._id })
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