import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import {
  getQuotationStatusOption,
} from '@/data/dataSets';
import { getQuotationConvertEligibility } from '@/utils/quotationListUtils';
import OptionMenu from '@core/components/option-menu';

/**
 * Quotation table column definitions
 */
export const getQuotationColumns = ({ theme, permissions }) => [
  {
    key: 'quotationNumber',
    visible: true,
    label: 'Quotation No',
    sortable: true,
    renderCell: row => (
      <Link href={`/quotations/quotation-view/${row._id}`} passHref>
        <Typography className="cursor-pointer text-primary hover:underline" align="center">
          {row.quotation_id || 'N/A'}
        </Typography>
      </Link>
    ),
  },
  {
    key: 'quotationDate',
    visible: true,
    label: 'Quotation Date',
    sortable: true,
    renderCell: row => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
        {row.quotation_date ? moment(row.quotation_date).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'customer',
    visible: true,
    label: 'Customer',
    sortable: true,
    renderCell: row => {
      const customerId = row.customerId?._id || row.customerId;

      return (
        <div className="flex flex-col">
          <Link href={`/customers/customer-view/${customerId}`} passHref>
            <Typography
              variant="body1"
              className="text-[0.9rem] text-start cursor-pointer text-primary hover:underline font-medium"
            >
              {row.customerId?.name || 'N/A'}
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
    key: 'dueDate',
    label: 'Expiry Date',
    visible: true,
    sortable: true,
    renderCell: row => (
      <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
        {row.due_date ? moment(row.due_date).format('DD MMM YY') : 'N/A'}
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
      const statusOption = getQuotationStatusOption(row.status);

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
      const convertCheck = getQuotationConvertEligibility(row);

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

      if (permissions.canUpdate) {
        options.push({
          text: convertCheck.canConvert ? 'Convert to Invoice' : convertCheck.reason,
          icon: <Icon icon="mdi:invoice-export-outline" style={{ transform: 'scaleX(-1)' }} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            disabled: !convertCheck.canConvert,
            onClick: convertCheck.canConvert ? () => handlers.openConvertDialog?.(row) : undefined,
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
          iconButtonProps={{ size: 'small', 'aria-label': 'quotation actions' }}
          options={options}
        />
      ) : null;
    },
  },
];
