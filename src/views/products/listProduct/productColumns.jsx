import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box, Avatar, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { parseProductDescription } from '@/utils/productMeta';

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
    key: 'expand',
    label: '',
    visible: true,
    align: 'center',
    sortable: false,
    width: '50px',
    renderCell: (row, handlers) => {
      const { meta } = parseProductDescription(row.productDescription);
      const variantsCount = Array.isArray(meta?.variants) ? meta.variants.length : 0;
      if (!variantsCount) return null;
      const isExpanded = handlers?.expandedRows?.[row._id];
      return (
        <Tooltip title={isExpanded ? 'Collapse variants' : 'Expand variants'}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handlers?.toggleRow?.(row._id);
            }}
          >
            <Icon
              icon="mdi:chevron-down"
              width={22}
              style={{
                transition: 'transform 200ms ease',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </IconButton>
        </Tooltip>
      );
    }
  },

  {
    key: 'image',
    label: 'Image',
    visible: true,
    align: 'center',
    renderCell: (row) => (
      <Box>
        <Avatar
          src={row.images || ''}
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        >
          <Icon icon="mdi:package-variant-closed" />
        </Avatar>
      </Box>
    ),
  },
  {
    key: 'name',
    visible: true,
    label: 'Product Name',
    sortable: true,
    renderCell: (row, handlers) => (
      <Box className='flex flex-col gap-1'>
        <Typography
          className="cursor-pointer text-primary text-[1rem] hover:underline font-medium"
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
      <Chip
        size="small"
        variant="outlined"
        color="secondary"
        label={row.category?.name || 'N/A'}
        sx={{ fontSize: '0.75rem' }}
      />
    ),
  },
  {
    key: 'sellingPrice',
    label: 'Selling Price',
    visible: true,
    align: 'left',
    sortable: true,
    renderCell: (row) => {
      const price = parseFloat(row.sellingPrice) || 0;
      return (
        <div className="flex items-center justify-start gap-1">
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
    align: 'left',
    sortable: true,
    renderCell: (row) => {
      const price = parseFloat(row.purchasePrice) || 0;
      return (
        <div className="flex items-center justify-start gap-1">
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
    label: 'Alert Qty',
    visible: true,
    align: 'left',
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
    // sortable: true,
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