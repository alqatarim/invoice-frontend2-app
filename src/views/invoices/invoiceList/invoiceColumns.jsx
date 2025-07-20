import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, LinearProgress, IconButton, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { statusOptions } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { actionButtons } from '@/data/dataSets';

/**
 * Invoice table column definitions
 */
export const getInvoiceColumns = ({ theme, permissions }) => [
  {
    key: 'invoiceNumber',
    visible: true,
    label: 'Invoice No',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/invoices/invoice-view/${row._id}`} passHref>
        <Typography
          className="cursor-pointer text-primary hover:underline"
          align='center'
        >
          {row.invoiceNumber || 'N/A'}
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
        {row.invoiceDate ? moment(row.invoiceDate).format('DD MMM YY') : 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'invoiceTo',
    visible: true,
    label: 'Invoice To',
    sortable: true,
    renderCell: (row) => (
      <Link href={`/invoices/invoice-list/invoice-view/${row.customerId?._id}`} passHref>
        <Typography
          variant="body1"
          className='text-[0.9rem] text-start cursor-pointer text-primary hover:underline'
        >
          {row.customerId?.name || 'Deleted Customer'}
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

      const menuOptions = [];

      // Add additional menu options (not view/edit)
      if (permissions.canCreate) {
        menuOptions.push({
          text: actionButtons.find(action => action.id === 'clone').label,
          icon: <Icon icon={actionButtons.find(action => action.id === 'clone').icon} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleClone(row.id || row._id)
          }
        });

        menuOptions.push({
          text: actionButtons.find(action => action.id === 'send').label,
          icon: <Icon icon={actionButtons.find(action => action.id === 'send').icon} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleSend(row.id || row._id)
          }
        });
      }

      if (permissions.canUpdate) {
        menuOptions.push({
          text: 'Convert to Sales Return',
          icon: <Icon icon="mdi:invoice-export-outline" style={{ transform: 'scaleX(-1)' }} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.openConvertDialog(row)
          }
        });

        menuOptions.push({
          text: actionButtons.find(action => action.id === 'print').label,
          icon: <Icon icon={actionButtons.find(action => action.id === 'print').icon} />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handlePrintDownload(row._id)
          }
        });
      }

      if (permissions.canCreate) {
        menuOptions.push({
          text: 'Send Payment Link',
          icon: <Icon icon="mdi:link-variant" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.handleSendPaymentLink(row._id)
          }
        });
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Direct action buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {permissions.canView && (
              <IconButton
                size="small"
                component={Link}
                href={`/invoices/invoice-view/${row._id}`}
                title={actionButtons.find(action => action.id === 'view').title}
              >
                <Icon icon={actionButtons.find(action => action.id === 'view').icon} />
              </IconButton>
            )}
            {permissions.canUpdate && (
              <IconButton
                size="small"
                component={Link}
                href={`/invoices/edit/${row._id}`}
                title={actionButtons.find(action => action.id === 'edit').title}
              >
                <Icon icon={actionButtons.find(action => action.id === 'edit').icon} />
              </IconButton>
            )}
          </Box>

          {/* Menu for additional actions */}
          {menuOptions.length > 0 && (
            <OptionMenu
              icon={<MoreVertIcon />}
              iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
              options={menuOptions}
            />
          )}
        </Box>
      );
    },
  },
];