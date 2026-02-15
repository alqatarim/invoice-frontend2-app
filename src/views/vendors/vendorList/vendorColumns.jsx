import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { vendorStatusOptions, actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { useTheme } from '@mui/material/styles';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions, ledgerPermissions }) => {
  const viewAction = actionButtons.find(action => action.id === 'view');
  const editAction = actionButtons.find(action => action.id === 'edit');
  const deleteAction = actionButtons.find(action => action.id === 'delete');

  // Prepare menu options
  const theme = useTheme();
  const menuOptions = [];
  
  if (permissions?.canView) {
    menuOptions.push({
      text: viewAction?.label || 'View',
      icon: <Icon icon={viewAction?.icon || 'mdi:eye-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleView?.(row._id)
      }
    });
  }

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: editAction?.label || 'Edit',
      icon: <Icon icon={editAction?.icon || 'mdi:edit-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleEdit?.(row._id)
      }
    });
  }

  if (permissions?.canDelete) {
    menuOptions.push({
      text: deleteAction?.label || 'Delete',
      icon: <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleDelete?.(row._id)
      }
    });
  }

  if (ledgerPermissions?.canView || ledgerPermissions?.canCreate) {
    menuOptions.push({
      text: 'Ledger',
      icon: <Icon icon="mdi:book-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleLedger?.(row._id)
      }
    });
  }

  return (
    menuOptions.length > 0 ? (
      <Box className='flex items-center justify-end'>
        <OptionMenu
          icon={<MoreVertIcon />}
          iconButtonProps={{ size: 'small', 'aria-label': 'vendor actions' }}
          options={menuOptions}
        />
      </Box>
    ) : null
  );
};

/**
 * Vendor table column definitions
 */
export const getVendorColumns = ({ theme = {}, permissions = {}, ledgerPermissions = {} } = {}) => [
  {
    key: 'serial',
    visible: true,
    label: '#',
    align: 'center',
    renderCell: (row, handlers, index) => {
      // Add proper fallbacks and validation
      const currentPage = Number(handlers?.pagination?.current || handlers?.pagination?.page || 1);
      const pageSize = Number(handlers?.pagination?.pageSize || handlers?.pagination?.limit || 10);
      const rowIndex = Number(index >= 0 ? index : 0);

      // Calculate serial number with proper validation
      const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          {!isNaN(serialNumber) ? serialNumber : rowIndex + 1}
        </Typography>
      );
    },
  },
  {
    key: 'vendor_name',
    visible: true,
    label: 'Name',
    sortable: true,
    renderCell: (row, handlers) => (
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium"
          onClick={() => handlers?.handleView?.(row._id)}
        >
          {row.vendor_name || 'N/A'}
        </Typography>
    ),
  },

  {
    key: 'vendor_phone',
    visible: true,
    label: 'Phone',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.vendor_phone || 'N/A'}
      </Typography>
    ),
  },

   {
    key: 'vendor_email',
    visible: true,
    label: 'Email',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.vendor_email || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'balance',
    label: 'Closing Balance',
    visible: true,
    align: 'left',
    sortable: true,
    renderCell: (row) => {
      // Ensure proper number handling and fallback
      const balance = parseFloat(row.balance) || 0;
      const balanceType = row.balanceType || (balance >= 0 ? 'Credit' : 'Debit');
      const displayBalance = Math.abs(balance);

      // Format balance with locale (Indian number format like old frontend)
      let formattedBalance = '0.00';
      try {
        formattedBalance = displayBalance.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } catch (e) {
        // Fallback to simple formatting if locale fails
        formattedBalance = displayBalance.toFixed(2);
      }

      return (
        <div className="flex items-center justify-start gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            // color={balanceType === 'Credit' ? (theme?.palette?.success?.main) : (theme?.palette?.warning?.main)}
            color={theme.palette.secondary.light}
          />
          <Typography
            color={balanceType === 'Credit' ? 'success.main' : 'error.main'}
            className='text-[0.9rem] font-medium'
          >
            {balance < 0 ? '-' : ''}{formattedBalance}
          </Typography>
          {balance > 0 && (
            <Typography
              color="text.secondary"
              className='text-[0.8rem] ml-1'
            >
              ({balanceType})
            </Typography>
          )}
        </div>
      );
    },
  },
  {
    key: 'created_at',
    label: 'Created On',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      // Ensure proper date parsing and validation
      const createdDate = row.created_at;
      let formattedDate = 'N/A';

      if (createdDate) {
        const momentDate = moment(createdDate, 'DD-MM-YYYY', true); // strict parsing for DD-MM-YYYY
        if (momentDate.isValid()) {
          formattedDate = momentDate.format('DD MMM YYYY');
        }
      }

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formattedDate}
        </Typography>
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
      const statusOption = vendorStatusOptions.find(opt => opt.value === row.status);
      return (
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={statusOption?.label || 'Unknown'}
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
    renderCell: (row, handlers) => (
      <ActionCell 
        row={row} 
        handlers={handlers} 
        permissions={permissions} 
        ledgerPermissions={ledgerPermissions} 
      />
    ),
  },
];