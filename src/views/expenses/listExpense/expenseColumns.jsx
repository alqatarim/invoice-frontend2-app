import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import OptionMenu from '@core/components/option-menu';
import { formatDate } from '@/utils/dateUtils';
import { paymentMethods, getExpenseStatusOption } from '@/data/dataSets';
import moment from 'moment';
export const getExpenseColumns = ({
  theme = {},
  permissions = {},
  onDelete,
  onView,
  onEdit,
  onSetAsPending,
  onSetAsPaid,
} = {}) => [
    {
      key: 'expenseId',
      visible: true,
      label: 'Expense ID',
      sortable: true,
      renderCell: row => (
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium"
          onClick={() => onView?.(row._id)}
        >
          {row.expenseId || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'reference',
      visible: true,
      label: 'Reference',
      sortable: true,
      renderCell: row => (
        <Typography variant="body1" color="text.primary" className="text-[0.9rem]">
          {row.reference || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      visible: true,
      align: 'center',
      sortable: true,
      renderCell: row => {
        const total = Number(row.amount) || 0;

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
      label: 'Payment Mode',
      visible: true,
      sortable: true,
      renderCell: row => (
        <Box className="flex items-center gap-1.5">
          <Icon
            icon={paymentMethods.find(item => item.value === row.paymentMode)?.icon || 'mdi:cash-multiple'}
            fontSize={18}
            color={theme.palette?.text?.secondary}
          />
          <Typography color="text.primary">{row.paymentMode || '-'}</Typography>
        </Box>
      ),
    },
    {
      key: 'expenseDate',
      visible: true,
      label: 'Date',
      align: 'center',
      sortable: true,
      renderCell: row => (
        <Typography variant="body1" color="text.primary" className="text-[0.9rem] whitespace-nowrap">
          {row.createdAt ? moment(row.createdAt).format('DD MMM YY') : 'N/A'}
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
        const statusOption = getExpenseStatusOption(row.status);

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
      renderCell: row => {
        const options = [];

        if (permissions.canView) {
          options.push({
            text: 'View',
            icon: <Icon icon="mdi:eye-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onView?.(row._id),
            },
          });
        }

        if (permissions.canUpdate) {
          options.push({
            text: 'Edit',
            icon: <Icon icon="mdi:edit-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onEdit?.(row._id),
            },
          });
        }

        const normalizedStatus = String(row.status || '').trim();

        if (permissions.canUpdate && normalizedStatus === 'Draft') {
          options.push({
            text: 'Set as Pending',
            icon: <Icon icon="mdi:clock-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onSetAsPending?.(row._id),
            },
          });
        }

        if (permissions.canUpdate && normalizedStatus === 'Pending') {
          options.push({
            text: 'Set as Paid',
            icon: <Icon icon="mdi:check-circle-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onSetAsPaid?.(row._id),
            },
          });
        }

        if (permissions.canDelete) {
          options.push({
            text: 'Delete',
            icon: <Icon icon="mdi:delete-outline" />,
            menuItemProps: {
              className: 'flex items-center gap-2 text-textSecondary',
              onClick: () => onDelete?.(row),
            },
          });
        }

        return options.length ? (
          <OptionMenu
            icon={<MoreVertIcon />}
            iconButtonProps={{ size: 'small', 'aria-label': 'expense actions' }}
            options={options}
          />
        ) : null;
      },
    },
  ];
