import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import OptionMenu from '@core/components/option-menu';
import { formatDate } from '@/utils/dateUtils';
import { actionButtons, expenseStatusOptions } from '@/data/dataSets';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, onDelete, onView, onEdit, permissions }) => {
  const viewAction = actionButtons.find(action => action.id === 'view');
  const editAction = actionButtons.find(action => action.id === 'edit');
  const deleteAction = actionButtons.find(action => action.id === 'delete');

  const menuOptions = [];

  if (permissions?.canView) {
    menuOptions.push({
      text: viewAction?.label || 'View',
      icon: <Icon icon={viewAction?.icon || 'mdi:eye-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => onView?.(row._id)
      }
    });
  }

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: editAction?.label || 'Edit',
      icon: <Icon icon={editAction?.icon || 'mdi:edit-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => onEdit?.(row._id)
      }
    });
  }

  if (permissions?.canDelete) {
    menuOptions.push({
      text: deleteAction?.label || 'Delete',
      icon: <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => onDelete?.(row._id)
      }
    });
  }

  if (menuOptions.length === 0) return null;

  return (
    <Box className='flex items-center justify-end'>
      <OptionMenu
        icon={<MoreVertIcon />}
        iconButtonProps={{ size: 'small', 'aria-label': 'expense actions' }}
        options={menuOptions}
      />
    </Box>
  );
};

/**
 * Expense table column definitions
 */
export const getExpenseColumns = ({
  theme = {},
  permissions = {},
  onDelete,
  onView,
  onEdit,
} = {}) => [
  {
    key: 'expenseId',
    visible: true,
    label: 'Expense ID',
    sortable: true,
    renderCell: (row) => (
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
    renderCell: (row) => (
      <Typography color="text.primary" className='text-[0.925rem]'>
        {row.reference || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'amount',
    label: 'Amount',
    visible: true,
    align: 'left',
    sortable: true,
    renderCell: (row) => {
      // Ensure proper number handling and fallback
      const amount = parseFloat(row.amount) || 0;

      // Format amount with locale (Indian number format like old frontend)
      let formattedAmount = '0.00';
      try {
        formattedAmount = amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } catch (e) {
        // Fallback to simple formatting if locale fails
        formattedAmount = amount.toFixed(2);
      }

      return (
        <div className="flex items-center justify-start gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            color={theme.palette.secondary.light}
          />
          <Typography
            color="text.primary"
            className='text-[0.9rem] font-medium'
          >
            {formattedAmount}
          </Typography>
        </div>
      );
    },
  },
  {
    key: 'paymentMode',
    label: 'Payment Mode',
    visible: true,
    align: 'center',
    sortable: false,
    renderCell: (row) => {
      const paymentMode = row.paymentMode || 'Cash';

      return (
        <Box className='flex items-center justify-center gap-1'>
          <Icon
            color={theme.palette.secondary.main}
            width={18}
            icon={paymentMode === 'Bank' ? 'mdi:bank' : 'mdi:cash'}
          />
          <Typography variant="body1" color='text.primary' className='text-[0.925rem]'>
            {paymentMode}
          </Typography>
        </Box>
      );
    },
  },
  {
    key: 'expenseDate',
    visible: true,
    label: 'Date',
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formatDate(row.expenseDate)}
        </Typography>
      )
    },
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      const statusConfig = expenseStatusOptions.find(
        (option) => option.value.toLowerCase() === String(row.status || '').toLowerCase()
      ) || { color: 'default', label: row.status || 'N/A' };
      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={statusConfig.label}
          color={statusConfig.color}
        />
      );
    },
  },
  {
    key: 'action',
    label: '',
    visible: true,
    align: 'right',
    renderCell: (row) => (
      <ActionCell
        row={row}
        onDelete={onDelete}
        onView={onView}
        onEdit={onEdit}
        permissions={permissions}
      />
    ),
  },
];