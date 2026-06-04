import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import OptionMenu from '@core/components/option-menu';
import { getDeliveryChallanStatusOption } from '@/data/dataSets';

export const getDeliveryChallanColumns = ({ theme = {}, permissions = {} } = {}) => [
  {
    key: 'challanNumber',
    visible: true,
    label: 'Challan No',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/deliveryChallans/deliveryChallans-view/${row._id}`} passHref>
        <Typography className="cursor-pointer text-primary hover:underline" align="center">
          {row.deliveryChallanNumber || row.challanNumber || 'N/A'}
        </Typography>
      </Link>
    ),
  },
  {
    key: 'deliveryChallanDate',
    visible: true,
    label: 'Delivery Date',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
        {row.deliveryChallanDate ? moment(row.deliveryChallanDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'customer',
    visible: true,
    label: 'Customer',
    sortable: true,
    renderCell: (row) => {
      const customerId = row.customerId?._id || row.customerId;

      return (
        <div className="flex flex-col">
          <Link href={`/customers/customer-view/${customerId}`} passHref>
            <Typography
              variant="body1"
              className="text-[0.9rem] text-start cursor-pointer text-primary hover:underline font-medium"
            >
              {row.customerId?.name || 'Deleted Customer'}
            </Typography>
          </Link>
          <Typography variant="body2" color="text.secondary" fontWeight={500} className="tabular-nums">
            {row.customerId?.phone || ''}
          </Typography>
        </div>
      );
    },
  },
  {
    key: 'amount',
    label: 'Amount',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;

      return (
        <div className="flex items-end justify-start gap-0">
          <Icon icon="lucide:saudi-riyal" width="0.75rem" color={theme.vars.palette.text.primary} />
          <Typography color="text.primary" lineHeight={1} className="font-medium">
            {total.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </div>
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
      const statusOption = getDeliveryChallanStatusOption(row.status);

      return (
        <Chip size="small" variant="tonal" label={statusOption.label} color={statusOption.color} />
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
      const rowId = row._id;
      const isConverted = String(row.status || '').toUpperCase() === 'CONVERTED';

      if (permissions.canView) {
        options.push({
          text: 'View',
          icon: <Icon icon="mdi:eye-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleView?.(rowId),
          },
        });
      }

      if (permissions.canUpdate && !isConverted) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleEdit?.(rowId),
          },
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Convert to Invoice',
          icon: <Icon icon="mdi:arrow-right" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            disabled: isConverted,
            onClick: (event) => {
              event?.preventDefault?.();
              event?.stopPropagation?.();
              if (!isConverted) {
                handlers.handleConvertClick?.(row);
              }
            },
          },
        });
      }

      if (permissions.canDelete) {
        options.push({
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: (event) => {
              event?.preventDefault?.();
              event?.stopPropagation?.();
              handlers.handleDeleteClick?.(row);
            },
          },
        });
      }

      return options.length ? (
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'delivery challan actions' }}
          options={options}
        />
      ) : null;
    },
  },
];
