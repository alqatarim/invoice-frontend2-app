import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box, Avatar } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  return (
    <Box>
      {/* View Button */}
      {permissions?.canView && (
        <IconButton
          color='primary'
          size="small"
          onClick={() => handlers?.handleView?.(row._id)}
          title='View'
        >
          <Icon icon='mdi:eye-outline' />
        </IconButton>
      )}

      {/* Edit Button */}
      {permissions?.canUpdate && (
        <IconButton
          size="small"
          onClick={() => handlers?.handleEdit?.(row._id)}
          title='Edit'
          color="primary"
        >
          <Icon icon='mdi:edit-outline' />
        </IconButton>
      )}

      {/* Delete Button */}
      {permissions?.canDelete && (
        <IconButton
          size="small"
          onClick={() => handlers.handleDelete(row._id)}
          title='Delete'
          color="error"
        >
          <Icon icon='mdi:delete-outline' />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Product table column definitions
 */
export const getProductColumns = ({ theme = {}, permissions = {} } = {}) => [
  {
    key: 'serial',
    visible: true,
    label: '#',
    align: 'center',
    renderCell: (row, handlers, index) => {
      const currentPage = Number(handlers?.pagination?.current || handlers?.pagination?.page || 1);
      const pageSize = Number(handlers?.pagination?.pageSize || handlers?.pagination?.limit || 10);
      const rowIndex = Number(index >= 0 ? index : 0);

      const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;

      return (
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          {!isNaN(serialNumber) ? serialNumber : rowIndex + 1}
        </Typography>
      );
    },
  },
  {
    key: 'image',
    label: 'Image',
    visible: true,
    align: 'center',
    renderCell: (row) => (
      <Avatar
        src={row.images?.[0] || ''}
        variant="rounded"
        sx={{ width: 40, height: 40 }}
      >
        <Icon icon="mdi:package-variant-closed" />
      </Avatar>
    ),
  },
  {
    key: 'name',
    visible: true,
    label: 'Product Name',
    sortable: true,
    renderCell: (row, handlers) => (
      <Box>
        <Typography
          className="cursor-pointer text-primary hover:underline font-medium"
          onClick={() => handlers?.handleView?.(row._id)}
        >
          {row.name || 'N/A'}
        </Typography>
        {row.sku && (
          <Typography variant="caption" color="text.secondary">
            SKU: {row.sku}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    key: 'category',
    visible: true,
    label: 'Category',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.category?.category_name || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'sellingPrice',
    label: 'Selling Price',
    visible: true,
    align: 'right',
    sortable: true,
    renderCell: (row) => {
      const price = parseFloat(row.sellingPrice) || 0;
      return (
        <div className="flex items-center justify-end gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            color={theme.palette.secondary.light}
          />
          <Typography color='text.primary' className='text-[0.9rem] font-medium'>
            {price.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
        </div>
      );
    },
  },
  {
    key: 'purchasePrice',
    label: 'Purchase Price',
    visible: true,
    align: 'right',
    sortable: true,
    renderCell: (row) => {
      const price = parseFloat(row.purchasePrice) || 0;
      return (
        <div className="flex items-center justify-end gap-1">
          <Icon
            icon="lucide:saudi-riyal"
            width="1rem"
            color={theme.palette.secondary.light}
          />
          <Typography color='text.primary' className='text-[0.9rem] font-medium'>
            {price.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
        </div>
      );
    },
  },
  {
    key: 'alertQuantity',
    label: 'Alert Quantity',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.alertQuantity || '0'}
      </Typography>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => (
      <Chip
        className='mx-0'
        size='small'
        variant='tonal'
        label={row.isDeleted ? 'Inactive' : 'Active'}
        color={row.isDeleted ? 'error' : 'success'}
      />
    ),
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
      />
    ),
  },
];