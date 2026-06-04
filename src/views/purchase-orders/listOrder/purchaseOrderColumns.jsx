import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { paymentMethods } from '@/data/dataSets';
import { getPurchaseOrderStatusOption, normalizePurchaseOrderStatus } from './handler';
import OptionMenu from '@core/components/option-menu';

export const getPurchaseOrderColumns = ({ theme = {}, permissions = {} } = {}) => [
  {
    key: 'purchaseOrderId',
    visible: true,
    label: 'Order No',
    sortable: true,
    renderCell: row => (
      <Link href={`/purchase-orders/order-view/${row._id}`} passHref>
        <Typography className="cursor-pointer text-primary hover:underline" align="center">
          {row.purchaseOrderId || 'N/A'}
        </Typography>
      </Link>
    ),
  },
  {
    key: 'purchaseOrderDate',
    visible: true,
    label: 'Order Date',
    sortable: true,
    renderCell: row => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
        {row.purchaseOrderDate ? moment(row.purchaseOrderDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'vendor',
    visible: true,
    label: 'Vendor',
    sortable: true,
    renderCell: row => {
      const vendorId = row.vendorInfo?._id || row.vendorId?._id || row.vendorId;

      return (
        <div className="flex flex-col">
          <Link href={`/vendors/vendor-view/${vendorId}`} passHref>
            <Typography
              variant="body1"
              className="text-[0.9rem] text-start cursor-pointer text-primary hover:underline font-medium"
            >
              {row.vendorInfo?.vendor_name || row.vendorId?.vendor_name || 'Deleted Vendor'}
            </Typography>
          </Link>
          <Typography variant="body2" color="text.secondary" fontWeight={500} className="tabular-nums">
            {row.vendorInfo?.vendor_phone || row.vendorId?.vendor_phone || ''}
          </Typography>
        </div>
      );
    },
  },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: row => {
      const total = Number(row.TotalAmount) || 0;

      return (
        <div className="flex items-end justify-start gap-0">
          <Icon icon="lucide:saudi-riyal" width="0.75rem" color={theme.palette?.text?.primary} />
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
    key: 'paymentMode',
    visible: true,
    label: 'Payment Mode',
    sortable: true,
    renderCell: row => (
      <Box className="flex items-center gap-1.5">
        <Icon
          icon={(paymentMethods.find(item => item.value === row.paymentMode))?.icon || 'mdi:cash-multiple'}
          fontSize={18}
          color={theme.palette?.text?.secondary}
        />
        <Typography color="text.primary">{row.paymentMode || '-'}</Typography>
      </Box>
    ),
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    visible: true,
    sortable: true,
    renderCell: row => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
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
    renderCell: row => {
      const statusOption = getPurchaseOrderStatusOption(row.status);

      return (
        <Chip
          size="small"
          variant="tonal"
          label={statusOption.label}
          color={statusOption.color}
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
      const status = normalizePurchaseOrderStatus(row.status);
      const rowId = row._id;

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

      if (permissions.canUpdate) {
        options.push({
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleEdit?.(rowId),
          },
        });
      }

      if (permissions.canCreate) {
        options.push({
          text: 'Clone',
          icon: <Icon icon="mdi:content-duplicate" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: event => {
              event?.preventDefault?.();
              event?.stopPropagation?.();
              handlers.handleClone?.(rowId);
            },
          },
        });
      }

      if (permissions.canUpdate && status === 'Draft') {
        options.push({
          text: 'Submit for Approval',
          icon: <Icon icon="mdi:clock-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleSubmitForApproval?.(rowId),
          },
        });
      }

      if (permissions.canUpdate && status === 'PENDING_APPROVAL') {
        options.push({
          text: 'Approve',
          icon: <Icon icon="mdi:check-circle-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleStatusChange?.(rowId, 'APPROVED'),
          },
        });
        options.push({
          text: 'Reject',
          icon: <Icon icon="mdi:close-circle-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleStatusChange?.(rowId, 'REJECTED'),
          },
        });
        options.push({
          text: 'Cancel',
          icon: <Icon icon="mdi:cancel" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleStatusChange?.(rowId, 'CANCELLED'),
          },
        });
      }

      if (permissions.canCreate && status === 'APPROVED') {
        options.push({
          text: 'Convert to Purchase',
          icon: <Icon icon="mdi:invoice-export-outline" style={{ transform: 'scaleX(-1)' }} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.openConvertDialog?.(row),
          },
        });
      }

      if (permissions.canUpdate) {
        options.push({
          text: 'Print & Download',
          icon: <Icon icon="mdi:printer-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handlePrintDownload?.(rowId),
          },
        });
      }

      if (permissions.canDelete) {
        options.push({
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleDeleteClick?.(row),
          },
        });
      }

      return options.length ? (
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'purchase order actions' }}
          options={options}
        />
      ) : null;
    },
  },
];
