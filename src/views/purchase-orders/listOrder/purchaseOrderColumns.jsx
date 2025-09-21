import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { statusOptions, actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { formatDate } from '@/utils/dateUtils';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  const menuOptions = [];

  if (permissions?.canCreate) {
    menuOptions.push({
      text: 'Clone',
      icon: <Icon icon="mdi:content-duplicate" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handleClone?.(row.id || row._id)
      }
    });

    menuOptions.push({
      text: 'Send',
      icon: <Icon icon="mdi:invoice-send-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handleSend?.(row.id || row._id)
      }
    });
  }

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: 'Convert to Purchase',
      icon: <Icon icon="mdi:invoice-export-outline" style={{ transform: 'scaleX(-1)' }} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.openConvertDialog?.(row)
      }
    });

    menuOptions.push({
      text: 'Print & Download',
      icon: <Icon icon="mdi:printer-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handlePrintDownload?.(row._id)
      }
    });
  }

  return (
    <Box className='flex items-center justify-end gap-1'>
      {/* Direct action buttons */}
      <Box className='flex gap-1' sx={{ display: 'flex', gap: 1 }}>
        {permissions?.canView && (
          <IconButton
            size="small"
            component={Link}
            href={`/purchase-orders/order-view/${row._id}`}
            title={actionButtons.find(action => action.id === 'view')?.title || 'View'}
            color={actionButtons.find(action => action.id === 'view')?.color || 'primary'}
          >
            <Icon icon={actionButtons.find(action => action.id === 'view')?.icon || 'mdi:eye-outline'} />
          </IconButton>
        )}
        {permissions?.canUpdate && (
          <IconButton
            size="small"
            component={Link}
            href={`/purchase-orders/order-edit/${row._id}`}
            title={actionButtons.find(action => action.id === 'edit')?.title || 'Edit'}
            color={actionButtons.find(action => action.id === 'edit')?.color || 'primary'}
          >
            <Icon icon={actionButtons.find(action => action.id === 'edit')?.icon || 'mdi:edit-outline'} />
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
};

/**
 * Purchase Order table column definitions
 */
export const getPurchaseOrderColumns = ({ theme = {}, permissions = {} } = {}) => [
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
    key: 'purchaseOrderId',
    visible: true,
    label: 'Order No',
    sortable: true,
    renderCell: (row, handlers) => (
      <Typography
        className="cursor-pointer text-primary hover:underline font-medium"
        onClick={() => handlers?.handleView?.(row._id)}
      >
        {row.purchaseOrderId || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'purchaseOrderDate',
    visible: true,
    label: 'Order Date',
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formatDate(row.purchaseOrderDate)}
        </Typography>
      )
    },
  },
  {
    key: 'vendor',
    visible: true,
    label: 'Vendor',
    sortable: true,
    renderCell: (row, handlers) => (

      <Box className='flex flex-col'>
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium"
          onClick={() => window.open(`/vendors/vendor-view/${row.vendorId}`, '_blank')}
        >
          {row.vendorInfo?.vendor_name || 'Deleted Vendor'}
        </Typography>
        <Typography variant="caption" color="text.secondary" className='text-[0.85rem]'>
          {row.vendorInfo?.vendor_phone || 'N/A'}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    visible: true,
    align: 'left',
    sortable: true,
    renderCell: (row) => {
      // Ensure proper number handling and fallback
      const total = parseFloat(row.TotalAmount) || 0;

      // Format amount with locale (Indian number format like old frontend)
      let formattedAmount = '0.00';
      try {
        formattedAmount = total.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } catch (e) {
        // Fallback to simple formatting if locale fails
        formattedAmount = total.toFixed(2);
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
    key: 'dueDate',
    label: 'Due Date',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formatDate(row.dueDate)}
        </Typography>
      )

    },
  },
  // {
  //   key: 'status',
  //   label: 'Status',
  //   visible: true,
  //   align: 'center',
  //   sortable: true,
  //   renderCell: (row) => {
  //     const getStatusConfig = (status) => {
  //       switch (status?.toLowerCase()) {
  //         case 'pending':
  //           return { color: 'warning', label: 'Pending' };
  //         case 'approved':
  //           return { color: 'success', label: 'Approved' };
  //         case 'rejected':
  //           return { color: 'error', label: 'Rejected' };
  //         case 'draft':
  //           return { color: 'secondary', label: 'Draft' };
  //         case 'converted':
  //           return { color: 'info', label: 'Converted' };
  //         default:
  //           return { color: 'default', label: 'N/A' };
  //       }
  //     };

  //     const statusConfig = getStatusConfig(row.status);
  //     return (
  //       <Chip
  //         className='mx-0'
  //         size='small'
  //         variant='tonal'
  //         label={statusConfig.label}
  //         color={statusConfig.color}
  //       />
  //     );
  //   },
  // },
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
      />
    ),
  },
];