import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import moment from 'moment';
import { productStatusOptions, actionButtons } from '@/data/dataSets';
import OptionMenu from '@core/components/option-menu';
import { useTheme } from '@mui/material/styles';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  const viewAction = actionButtons.find(action => action.id === 'view');
  const editAction = actionButtons.find(action => action.id === 'edit');
  const deleteAction = actionButtons.find(action => action.id === 'delete');

  return (
    <Box>
      {/* Edit Button */}
      {permissions?.canUpdate && (
        <IconButton
          size="small"
          onClick={() => handlers?.handleEdit?.(row._id)}
          title={editAction?.title || 'Edit'}
          color="primary"
        >
          <Icon icon={editAction?.icon || 'mdi:edit-outline'} />
        </IconButton>
      )}

      {/* Delete Button */}
      {permissions?.canDelete && (
        <IconButton
          size="small"
          onClick={() => handlers.handleDelete(row._id)}
          title={deleteAction?.title || 'Delete'}
          color="error"
        >
          <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Category table column definitions
 */
export const getCategoryColumns = ({ theme = {}, permissions = {} } = {}) => [
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
    key: 'category_name',
    visible: true,
    label: 'Category Name',
    sortable: true,
    renderCell: (row, handlers) => (
      <Typography
        className="cursor-pointer text-primary hover:underline font-medium"
        onClick={() => handlers?.handleView?.(row._id)}
      >
        {row.category_name || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created On',
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => {
      const createdDate = row.createdAt;
      let formattedDate = 'N/A';

      if (createdDate) {
        const momentDate = moment(createdDate);
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
      const isActive = !row.isDeleted;
      const statusOption = productStatusOptions.find(opt => opt.value === isActive);
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
      />
    ),
  },
];