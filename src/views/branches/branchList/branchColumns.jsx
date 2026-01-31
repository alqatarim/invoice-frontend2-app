import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, IconButton, Box } from '@mui/material';

const ActionCell = ({ row, handlers, permissions }) => {
  return (
    <Box>
      {permissions?.canView && (
        <IconButton
          size="small"
          onClick={() => handlers?.handleView?.(row._id)}
          title='View'
          color="info"
        >
          <Icon icon='mdi:eye-outline' />
        </IconButton>
      )}
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
      {permissions?.canDelete && (
        <IconButton
          size="small"
          onClick={() => handlers?.handleDelete?.(row._id)}
          title='Delete'
          color="error"
        >
          <Icon icon='mdi:delete-outline' />
        </IconButton>
      )}
    </Box>
  );
};

export const getBranchColumns = ({ permissions = {} } = {}) => [
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
    key: 'branchId',
    visible: true,
    label: 'Branch ID',
    align: 'left',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.branchId || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'name',
    visible: true,
    label: 'Branch Name',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
        {row.name || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'branchType',
    visible: true,
    label: 'Type',
    align: 'center',
    renderCell: (row) => {
      const isStore = row.branchType === 'Store';
      return (
        <Chip
          size='small'
          variant='tonal'
          label={isStore ? 'Store' : 'Warehouse'}
          color={isStore ? 'info' : 'success'}
        />
      );
    },
  },
  {
    key: 'province',
    visible: true,
    label: 'Province',
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.province || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'city',
    visible: true,
    label: 'City',
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.city || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'district',
    visible: true,
    label: 'District',
    align: 'left',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.district || '-'}
      </Typography>
    ),
  },
  {
    key: 'status',
    visible: false,
    label: 'Status',
    align: 'center',
    renderCell: (row) => {
      const isActive = row.status !== false;
      return (
        <Chip
          size='small'
          variant='tonal'
          label={isActive ? 'Active' : 'Inactive'}
          color={isActive ? 'success' : 'error'}
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
      <ActionCell row={row} handlers={handlers} permissions={permissions} />
    ),
  },
];
