import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Typography, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { statusOptions } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  const viewAction = { icon: 'mdi:eye-outline', title: 'View' };
  const editAction = { icon: 'mdi:edit-outline', title: 'Edit' };
  const deleteAction = { icon: 'mdi:delete-outline', title: 'Delete' };

  const options = [];

  if (permissions?.canView) {
    options.push({
      text: 'View',
      icon: <Icon icon={viewAction.icon} />,
      href: `/purchase-orders/order-view/${row._id}`,
      linkProps: {
        className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
      }
    });
  }

  if (permissions?.canUpdate) {
    options.push({
      text: 'Edit',
      icon: <Icon icon={editAction.icon} />,
      href: `/purchase-orders/order-edit/${row._id}`,
      linkProps: {
        className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
      }
    });
  }

  if (permissions?.canCreate) {
    options.push({
      text: 'Clone',
      icon: <Icon icon="mdi:content-duplicate" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handleClone?.(row.id || row._id)
      }
    });

    options.push({
      text: 'Send',
      icon: <Icon icon="mdi:invoice-send-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handleSend?.(row.id || row._id)
      }
    });
  }

  if (permissions?.canUpdate) {
    options.push({
      text: 'Convert to Purchase',
      icon: <Icon icon="mdi:invoice-export-outline" style={{ transform: 'scaleX(-1)' }} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.openConvertDialog?.(row)
      }
    });

    options.push({
      text: 'Print & Download',
      icon: <Icon icon="mdi:printer-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handlePrintDownload?.(row._id)
      }
    });
  }

  return (
    <OptionMenu
      icon={<MoreVertIcon />}
      iconButtonProps={{ size: 'small', 'aria-label': 'more actions' }}
      options={options}
    />
  );
};

/**
 * Purchase Order table column definitions
 */
export const getPurchaseOrderColumns = ({ theme = {}, permissions = {} } = {}) => [
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
      // Ensure proper date parsing and validation
      const orderDate = row.purchaseOrderDate;
      let formattedDate = 'N/A';

      if (orderDate) {
        const momentDate = moment(orderDate, 'DD-MM-YYYY', true); // strict parsing for DD-MM-YYYY
        if (momentDate.isValid()) {
          formattedDate = momentDate.format('DD MMM YYYY');
        } else {
          // Try ISO format as fallback
          const isoDate = moment(orderDate);
          if (isoDate.isValid()) {
            formattedDate = isoDate.format('DD MMM YYYY');
          }
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
    key: 'vendor',
    visible: true,
    label: 'Vendor',
    sortable: true,
    renderCell: (row, handlers) => (
      <Typography
        className="cursor-pointer text-primary hover:underline font-medium"
        onClick={() => window.open(`/vendors/vendor-view/${row.vendorId}`, '_blank')}
      >
        {row.vendorInfo?.vendor_name || 'Deleted Vendor'}
      </Typography>
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
      // Ensure proper date parsing and validation
      const dueDate = row.dueDate;
      let formattedDate = 'N/A';

      if (dueDate) {
        const momentDate = moment(dueDate, 'DD-MM-YYYY', true); // strict parsing for DD-MM-YYYY
        if (momentDate.isValid()) {
          formattedDate = momentDate.format('DD MMM YYYY');
        } else {
          // Try ISO format as fallback
          const isoDate = moment(dueDate);
          if (isoDate.isValid()) {
            formattedDate = isoDate.format('DD MMM YYYY');
          }
        }
      }

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap'>
          {formattedDate}
        </Typography>
      );
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