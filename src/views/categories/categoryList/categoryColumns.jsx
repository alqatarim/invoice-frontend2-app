import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box, Avatar } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  return (
    <Box>
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
 * Category table column definitions
 */
export const getCategoryColumns = ({ theme = {}, permissions = {} } = {}) => [
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
    visible: true,
    label: 'Image',
    align: 'center',
    renderCell: (row) => (
      <Box className='flex justify-center'>
        <Avatar
          src={row.image || ''}
          alt={row.name || 'Category'}
          // className='w-12 h-12'
          variant='rounded'
          // sx={{
          //   width: 48,
          //   height: 48,
          //   border: '2px solid',
          //   borderColor: 'divider',
          //   backgroundColor: 'grey.100',
          // }}
        >
          {!row.image && (
            <Icon
              icon="mdi:image-outline"
              width={24}
              height={24}
              style={{ color: theme?.palette?.text?.secondary || '#666' }}
            />
          )}
        </Avatar>


                        
      </Box>
    ),
  },
  {
    key: 'name',
    visible: true,
    label: 'Category Name',
    sortable: true,
    renderCell: (row) => (
      <Box className='flex flex-col gap-1'>
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          { row.name || 'N/A'}
        </Typography>
        {row.description && (
          <Typography variant="caption" color="text.secondary">
            {row.description.length > 50 ? row.description.substring(0, 50) + '...' : row.description}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    key: 'slug',
    label: 'Slug',  
    visible: true,
    align: 'center',
    sortable: true,
    renderCell: (row) => (
  
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] whitespace-nowrap text-start'>
          {row.slug}
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
