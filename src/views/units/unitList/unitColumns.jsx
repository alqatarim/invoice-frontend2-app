import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box } from '@mui/material';
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
 * Unit table column definitions
 */
export const getUnitColumns = ({ theme = {}, permissions = {} } = {}) => [
  {
    key: 'serial',
    visible: true,
    label: '#',
    align: 'middle',
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
    key: 'unit',
    visible: true,
    label: 'Unit Name',
    sortable: true,
    renderCell: (row) => (
    
        <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          {row.name || 'N/A'}
        </Typography>
    
    ),
  },
  {
    key: 'symbol',
    label: 'Symbol',
    visible: true,
    align: 'middle',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
          {row.symbol}
        </Typography>
      )

  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'middle',
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
