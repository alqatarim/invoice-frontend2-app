import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import OptionMenu from '@core/components/option-menu';
import { formatDate } from '@/utils/dateUtils';
import { salesReturnStatuses } from '@/data/dataSets';
import { paymentMethods } from '@/data/dataSets';
/**
 * Sales Return table column definitions
 */
export const getSalesReturnColumns = ({ theme, permissions }) => [
  {
    key: 'salesReturnNo',
    visible: true,
    label: 'Sales Return No',
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
    key: 'invoiceNo',
    visible: true,
    label: 'Invoice No',
    sortable: true,
    renderCell: (row) => {
      const invoice = row.invoiceInfo;

      if (!invoice?._id || !invoice?.invoiceNumber) {
        return (
          <>
          </>
        );
      }

      return (
        <Link href={`/invoices/invoice-view/${invoice._id}`} passHref>
          <Typography
            className="cursor-pointer text-primary hover:underline"
            align='center'
          >
            {invoice.invoiceNumber}
          </Typography>
        </Link>
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
        {row.credit_note_date ? moment(row.credit_note_date).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'customer',
    visible: true,
    label: 'Customer',
    sortable: true,
    renderCell: (row) => (

      <div className="flex flex-col">
        <Link href={`/customers/customer-view/${row.customerInfo?._id}`} passHref>
          <Typography
            variant="body1"
            className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline font-medium'
          >
            {row.customerInfo?.name || 'Deleted Customer'}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary" fontWeight={500} className='tabular-nums'>
          {row.customerInfo?.phone || ''}
        </Typography>
      </div>

    ),
  },
  {
    key: 'Refund',
    label: 'Refund',
    visible: true,
    align: 'center',
    renderCell: (row) => {
      const total = Number(row.TotalAmount) || 0;

      return (
        <div className="flex items-end justify-start gap-0">

          <Icon icon="lucide:saudi-riyal" width="0.75rem" color={theme.palette.text.primary} />
          <Typography color="text.primary" lineHeight={1} className='font-medium'>
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
    renderCell: (row) => {


      return (
        <Box className="flex items-center gap-1.5">
          <Icon icon={(paymentMethods.find((item) => item.value === row.paymentMode))?.icon || 'mdi:cash-multiple'} fontSize={18} color={theme.palette.text.secondary} />
          <Typography color='text.primary' >{row.paymentMode || '-'}</Typography>
        </Box >
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
      const statusOption = salesReturnStatuses.find((item) => item.value === row.status);

      return (
        <Chip
          size='small'
          variant='tonal'
          label={statusOption?.label || row.status || 'Pending'}
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

      if (permissions.canUpdate && row.status === salesReturnStatuses.find((item) => item.summaryKey === 'draft')?.value) {
        options.push({
          text: 'Set as Pending',
          icon: <Icon icon="mdi:clock-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleSetAsPending?.(row._id)
          }
        });
      }

      if (permissions.canUpdate && row.status === salesReturnStatuses.find((item) => item.summaryKey === 'pending')?.value) {
        options.push({
          text: 'Process Refund',
          icon: <Icon icon="mdi:cash-refund" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleProcessRefund?.(row._id)
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
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleDeleteClick(row)
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