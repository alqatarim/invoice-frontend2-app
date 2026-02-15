import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';
import OptionMenu from '@core/components/option-menu';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { actionButtons } from '@/data/dataSets';

// Action cell extracted into its own component so hooks are used at the top level
const ActionCell = ({ row, handlers, permissions }) => {
  const editAction = actionButtons.find(action => action.id === 'edit');
  const deleteAction = actionButtons.find(action => action.id === 'delete');

  const menuOptions = [];

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: editAction?.label || 'Edit',
      icon: <Icon icon={editAction?.icon || 'mdi:edit-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleEdit?.(row._id)
      }
    });
  }

  if (permissions?.canDelete) {
    menuOptions.push({
      text: deleteAction?.label || 'Delete',
      icon: <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers.handleDelete(row._id)
      }
    });
  }

  if (menuOptions.length === 0) return null;

  return (
    <Box className='flex items-center justify-end'>
      <OptionMenu
        icon={<MoreVertIcon />}
        iconButtonProps={{ size: 'small', 'aria-label': 'unit actions' }}
        options={menuOptions}
      />
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
    key: 'baseUnit',
    label: 'Base Unit',
    visible: false,
    align: 'middle',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.baseUnit?.name || 'None'}
      </Typography>
    ),
  },
  {
    key: 'conversionFactor',
    label: 'Conversion Factor',
    visible: false,
    align: 'middle',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.conversionFactor ?? 1}
      </Typography>
    ),
  },
  {
    key: 'decimalPrecision',
    label: 'Precision',
    visible: false,
    align: 'middle',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.decimalPrecision ?? 2}
      </Typography>
    ),
  },
  {
    key: 'roundingMethod',
    label: 'Rounding',
    visible: false,
    align: 'middle',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.roundingMethod || 'round'}
      </Typography>
    ),
  },
  {
    key: 'standardUnitCode',
    label: 'Std Code',
    visible: false,
    align: 'middle',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.standardUnitCode || '-'}
      </Typography>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'middle',
    sortable: true,
    renderCell: (row) => {
      const isActive = row.status !== false;
      return (
        <Chip
          className='mx-0'
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
      <ActionCell 
        row={row} 
        handlers={handlers} 
        permissions={permissions} 
      />
    ),
  },
];
