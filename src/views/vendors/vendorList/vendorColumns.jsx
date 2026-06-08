import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { vendorStatusOptions, actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { formatNumberWithLocale } from '@/utils/numberUtils';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions, ledgerPermissions }) => {
  const viewAction = actionButtons.find(action => action.id === 'view');
  const editAction = actionButtons.find(action => action.id === 'edit');
  const deleteAction = actionButtons.find(action => action.id === 'delete');

  const handleMenuAction = (callback) => (event) => {
    event?.stopPropagation?.();
    callback?.();
  };


  const menuOptions = [];

  if (permissions?.canView) {
    menuOptions.push({
      text: viewAction?.label || 'View',
      icon: <Icon icon={viewAction?.icon || 'mdi:eye-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(() => handlers?.handleView?.(row._id))
      }
    });
  }

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: editAction?.label || 'Edit',
      icon: <Icon icon={editAction?.icon || 'mdi:edit-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(() => handlers?.handleEdit?.(row._id))
      }
    });
  }

  if (permissions?.canDelete) {
    menuOptions.push({
      text: deleteAction?.label || 'Delete',
      icon: <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(() => handlers?.handleDelete?.(row._id))
      }
    });
  }

  if (ledgerPermissions?.canView || ledgerPermissions?.canAll) {
    menuOptions.push({
      text: 'Ledger',
      icon: <Icon icon="mdi:book-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(() => handlers?.handleLedger?.(row._id))
      }
    });
  }

  return (
    menuOptions.length > 0 ? (
      <Box className='flex items-center justify-end' onClick={event => event.stopPropagation()}>
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
export const getVendorColumns = ({
  theme = {},
  permissions = {},
  ledgerPermissions = {},
  formatVendorDate = value => value || 'N/A',
} = {}) => [
    // {
    //   key: 'serial',
    //   visible: true,
    //   label: '#',
    //   align: 'center',
    //   renderCell: (row, handlers, index) => {
    //     // Add proper fallbacks and validation
    //     const currentPage = Number(handlers?.pagination?.current || handlers?.pagination?.page || 1);
    //     const pageSize = Number(handlers?.pagination?.pageSize || handlers?.pagination?.limit || 10);
    //     const rowIndex = Number(index >= 0 ? index : 0);

    //     // Calculate serial number with proper validation
    //     const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;

    //     return (
    //       <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
    //         {!isNaN(serialNumber) ? serialNumber : rowIndex + 1}
    //       </Typography>
    //     );
    //   },
    // },
    {
      key: 'vendor_name',
      visible: true,
      label: 'Name',
      sortable: true,
      align: 'center',
      renderCell: (row, handlers) => (
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium text-start"
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
      align: 'center',
      hideBelow: 'md',
      renderCell: (row) => (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] text-start'>
          {row.vendor_phone || 'N/A'}
        </Typography>
      ),
    },

    {
      key: 'vendor_email',
      visible: true,
      label: 'Email',
      sortable: true,
      align: 'center',
      hideBelow: 'md',
      renderCell: (row) => (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] text-start'>
          {row.vendor_email || 'N/A'}
        </Typography>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      visible: true,
      align: 'center',
      sortable: true,
      hideBelow: 'md',
      renderCell: (row) => {
        const rawBalance = Number(row?.closingBalance ?? row?.balance ?? 0) || 0;
        const balanceType = row?.closingBalanceType ?? row?.balanceType ?? (rawBalance >= 0 ? 'Credit' : 'Debit');
        const absoluteBalance = Math.abs(rawBalance);
        const formattedAmount = formatNumberWithLocale(absoluteBalance, 'en-IN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
        const textColor = balanceType === 'Credit' ? 'success.dark' : 'error.dark';
        const iconTone = balanceType === 'Credit' ? 'success' : 'warning';

        return (
          <div className="flex items-center justify-start gap-1">
            <Icon
              icon="lucide:saudi-riyal"
              width="1rem"
              color={iconTone === 'success' ? (theme?.palette?.success?.dark) : (theme?.palette?.warning?.dark)}
            // color={theme.palette.secondary.light}
            />
            <Typography
              color={textColor}
              className='text-[0.9rem] font-medium'
            >
              {formattedAmount}
            </Typography>
            {absoluteBalance > 0 && (
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
      hideBelow: 'md',
      renderCell: (row) => (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formatVendorDate(row.created_at)}
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
      label: 'action',
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