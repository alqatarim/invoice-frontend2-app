import React from 'react';
import { Typography, Chip, Switch, Avatar, Tooltip, Box } from '@mui/material';
import { Star, StarBorder, Edit, Delete, MoreVert } from '@mui/icons-material';
import OptionMenu from '@core/components/option-menu';

/**
 * Signature table column definitions
 */
export const getSignatureColumns = ({ theme, permissions = {} }) => [
  {
    key: 'index',
    visible: true,
    label: '#',
    align: 'center',
    renderCell: (row, handlers) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {(handlers?.index || 0) + 1}
      </Typography>
    ),
  },
  {
    key: 'signatureName',
    visible: true,
    label: 'Signature Name',
    sortable: true,
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
        {row.signatureName}
      </Typography>
    ),
  },
  {
    key: 'signatureImage',
    visible: true,
    label: 'Signature',
    align: 'center',
    renderCell: (row) => (
      <Avatar
        src={row.signatureImage}
        sx={{ width: 80, height: 30 }}
        variant="rounded"
      />
    ),
  },
  {
    key: 'status',
    visible: true,
    label: 'Status',
    align: 'center',
    renderCell: (row, handlers) => (
      <div className="flex items-center justify-center gap-2">
        <Chip
          className='mx-0'
          size='small'
          variant='tonal'
          label={row.status ? 'Active' : 'Inactive'}
          color={row.status ? 'success' : 'error'}
        />
        <Switch
          checked={row.status}
          onChange={() => handlers.onToggleStatus(row._id, !row.status)}
          size="small"
        />
      </div>
    ),
  },
  {
    key: 'action',
    label: '',
    visible: true,
    align: 'right',
    renderCell: (row, handlers) => {
      const menuOptions = [
        {
          text: row.markAsDefault ? 'Unset Default' : 'Set Default',
          icon: row.markAsDefault ? <Star /> : <StarBorder />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.onSetDefault(row._id)
          }
        },
        {
          text: 'Edit',
          icon: <Edit />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.onEdit(row)
          }
        },
        {
          text: 'Delete',
          icon: <Delete />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: () => handlers.onDelete(row._id)
          }
        }
      ];

      return (
        <Box className="flex items-center justify-end">
          <OptionMenu
            icon={<MoreVert />}
            iconButtonProps={{ size: 'small', 'aria-label': 'signature actions' }}
            options={menuOptions}
          />
        </Box>
      );
    },
  }
];