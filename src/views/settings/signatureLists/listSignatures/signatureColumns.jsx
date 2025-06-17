import React from 'react';
import { Typography, Chip, Switch, Avatar, IconButton, Tooltip } from '@mui/material';
import { Star, StarBorder, Edit, Delete } from '@mui/icons-material';

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
    label: 'Actions',
    visible: true,
    align: 'center',
    renderCell: (row, handlers) => (
      <div className="flex items-center justify-center gap-1">
        <Tooltip title={row.markAsDefault ? 'Unset as Default' : 'Set as Default'}>
          <IconButton
            size="small"
            onClick={() => handlers.onSetDefault(row._id)}
            color={row.markAsDefault ? 'warning' : 'default'}
          >
            {row.markAsDefault ? <Star /> : <StarBorder />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Signature">
          <IconButton
            size="small"
            onClick={() => handlers.onEdit(row)}
            color="primary"
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Signature">
          <IconButton
            size="small"
            onClick={() => handlers.onDelete(row._id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </div>
    ),
  }
];