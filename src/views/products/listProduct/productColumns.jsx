import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box, Avatar, Tooltip } from '@mui/material';
import { parseProductDescription } from '@/utils/productMeta';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import OptionMenu from '@core/components/option-menu';
import { actionButtons } from '@/data/dataSets';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
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

  if (menuOptions.length === 0) return null;

  return (
    <Box className='flex items-center justify-end' onClick={event => event.stopPropagation()}>
      <OptionMenu
        icon={<MoreVertIcon />}
        iconButtonProps={{ size: 'small', 'aria-label': 'product actions' }}
        options={menuOptions}
      />
    </Box>
  );
};

/**
 * Product table column definitions
 */
export const getProductColumns = ({ theme = {}, permissions = {} } = {}) => [
  {
    key: 'expand',
    visible: true,
    label: '',
    align: 'center',
    sortable: false,
    minWidth: 30,
    renderCell: (row, handlers) => {
      const { meta } = parseProductDescription(row.productDescription);
      const variantsCount = Array.isArray(meta?.variants) ? meta.variants.length : 0;
      if (!variantsCount) return null;
      const isExpanded = handlers?.expandedRows?.[row._id];
      return (
        // <Tooltip title={isExpanded ? 'Collapse variants' : 'Expand variants'}>
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
        // </Tooltip>
      );
    }
  },

  {
    key: 'image',
    visible: true,
    label: 'Image',
    align: 'center',
    hideBelow: 'md',
    minWidth: 70,
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
    minWidth: 200,
    align: 'center',
    renderCell: (row, handlers) => (
      <Box className='flex flex-col gap-1'>
        <Typography
          className="cursor-pointer text-primary text-[0.9rem] hover:underline font-medium text-start"
          onClick={() => handlers?.handleView?.(row._id)}
        >
          {row.name || 'N/A'}
        </Typography>
        {/* {row.sku && (
          <Typography variant="caption" color="text.secondary">
            SKU: {row.sku}
          </Typography>
        )} */}
      </Box>
    ),
  },

  {
    key: 'sku',
    visible: true,
    label: 'SKU',
    sortable: true,
    hideBelow: 'md',
    minWidth: 100,
    align: 'center',
    renderCell: (row) => (
      <Typography color='text.primary' className='text-[0.9rem] text-start'>
        {row.sku || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'category',
    visible: true,
    label: 'Category',
    sortable: true,
    hideBelow: 'md',
    minWidth: 130,
    align: 'center',
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
    visible: true,
    label: 'Selling Price',
    align: 'left',
    sortable: true,
    hideBelow: 'md',
    minWidth: 100,
    renderCell: (row) => {
      const price = parseFloat(row.sellingPrice) || 0;
      return (
        <div className="flex items-center justify-start gap-0">
          <Icon
            icon="lucide:saudi-riyal"
            width="0.8rem"
            color={theme.palette.text.secondary}
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
    visible: true,
    label: 'Purchase Price',
    align: 'left',
    sortable: true,
    hideBelow: 'md',
    minWidth: 100,
    renderCell: (row) => {
      const price = parseFloat(row.purchasePrice) || 0;
      return (
        <div className="flex items-center justify-start gap-0">
          <Icon
            icon="lucide:saudi-riyal"
            width="0.8rem"
            color={theme.palette.text.secondary}
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
  // {
  //   key: 'alertQuantity',
  //   visible: true,
  //   label: 'Alert Qty',
  //   align: 'left',
  //   sortable: true,
  //   minWidth: 110,
  //   renderCell: (row) => (
  //     <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
  //       {row.alertQuantity || '0'}
  //     </Typography>
  //   ),
  // },
  {
    key: 'status',
    visible: true,
    label: 'Status',
    align: 'center',
    // sortable: true,
    minWidth: 50,
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
    visible: true,
    label: '',
    align: 'right',
    minWidth: 40,
    renderCell: (row, handlers) => (
      <ActionCell
        row={row}
        handlers={handlers}
        permissions={permissions}
      />
    ),
  },
];