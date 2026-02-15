import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box, Avatar } from '@mui/material';
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
        iconButtonProps={{ size: 'small', 'aria-label': 'category actions' }}
        options={menuOptions}
      />
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
    key: 'parentCategory',
    label: 'Parent Category',
    visible: false,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.parentCategory?.name || 'None'}
      </Typography>
    ),
  },
  {
    key: 'tax',
    label: 'Tax Classification',
    visible: false,
    align: 'center',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.tax?.name ? `${row.tax.name}${row.tax.taxRate ? ` (${row.tax.taxRate}%)` : ''}` : 'None'}
      </Typography>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    visible: true,
    align: 'center',
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
