import React from 'react';
import { Icon } from '@iconify/react';
import { Typography, Chip, Box } from '@mui/material';
import OptionMenu from '@core/components/option-menu';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { actionButtons } from '@/data/dataSets';
import { branchesOptions } from '@/data/dataSets';
import { resolveProvinceDisplayName } from '@/utils/normalizeBranchFormValues';
const ActionCell = ({ row, handlers, permissions }) => {
  const viewAction = actionButtons.find(action => action.id === 'view');
  const editAction = actionButtons.find(action => action.id === 'edit');
  const deleteAction = actionButtons.find(action => action.id === 'delete');
  const branchId = row._id || row.id;

  const handleMenuAction = callback => event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    callback?.(branchId);
  };

  const menuOptions = [];

  if (permissions?.canView) {
    menuOptions.push({
      text: viewAction?.label || 'View',
      icon: <Icon icon={viewAction?.icon || 'mdi:eye-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(handlers?.handleView),
      },
    });
  }

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: editAction?.label || 'Edit',
      icon: <Icon icon={editAction?.icon || 'mdi:edit-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(handlers?.handleEdit),
      },
    });
  }

  if (permissions?.canDelete) {
    menuOptions.push({
      text: deleteAction?.label || 'Delete',
      icon: <Icon icon={deleteAction?.icon || 'mdi:delete-outline'} />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: handleMenuAction(handlers?.handleDelete),
      },
    });
  }

  if (menuOptions.length === 0) return null;

  return (
    <Box className='flex items-center justify-end'>
      <OptionMenu
        icon={<MoreVertIcon />}
        iconButtonProps={{ size: 'small', 'aria-label': 'branch actions' }}
        options={menuOptions}
      />
    </Box>
  );
};

export const getBranchColumns = ({ permissions = {}, provincesCities = [] } = {}) => [
  // {
  //   key: 'serial',
  //   visible: true,
  //   label: '#',
  //   align: 'center',
  //   renderCell: (row, handlers, index) => {
  //     const currentPage = Number(handlers?.pagination?.current || handlers?.pagination?.page || 1);
  //     const pageSize = Number(handlers?.pagination?.pageSize || handlers?.pagination?.limit || 10);
  //     const rowIndex = Number(index >= 0 ? index : 0);
  //     const serialNumber = (currentPage - 1) * pageSize + rowIndex + 1;
  //     return (
  //       <Typography variant="body1" color='text.primary' className='text-[0.9rem] font-medium'>
  //         {!isNaN(serialNumber) ? serialNumber : rowIndex + 1}
  //       </Typography>
  //     );
  //   },
  // },
  {
    key: 'storeCode',
    visible: true,
    label: 'Store Code',
    align: 'left',
    sortable: true,
    hideBelow: 'md',
    renderCell: (row) => (
      <Typography variant="body1" color='text.primary' className='text-[0.9rem]'>
        {row.storeCode || row.branchId || 'N/A'}
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
    key: 'Type',
    visible: true,
    label: 'Type',
    align: 'center',
    renderCell: (row) => {
      return (
        <Chip
          size='small'
          variant='outlined'
          label={branchesOptions.find(option => option.value === row.branchType)?.label || 'N/A'}
          color={branchesOptions.find(option => option.value === row.branchType)?.color || 'primary'}
        />
      );
    },
  },
  // {
  //   key: 'defaultAdminName',
  //   visible: true,
  //   label: 'Default Admin',
  //   align: 'left',
  //   renderCell: (row) => (
  //     <Box className='flex flex-col'>
  //       <Typography variant="body2" color='text.primary' fontWeight={500}>
  //         {row.defaultAdminName || (row.type === 'STORE' ? 'Not assigned' : 'N/A')}
  //       </Typography>
  //       <Typography variant="caption" color='text.secondary'>
  //         {row.defaultAdminEmail || (row.type === 'STORE' ? 'Store admin required' : 'Warehouse')}
  //       </Typography>
  //     </Box>
  //   ),
  // },
  {
    key: 'province',
    visible: true,
    label: 'Province',
    align: 'left',
    hideBelow: 'md',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {resolveProvinceDisplayName(row.province, provincesCities) || 'N/A'}
      </Typography>
    ),
  },
  {
    key: 'city',
    visible: true,
    label: 'City',
    align: 'left',
    hideBelow: 'md',
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
    hideBelow: 'md',
    renderCell: (row) => (
      <Typography variant="body2" color='text.primary'>
        {row.district || '-'}
      </Typography>
    ),
  },
  {
    key: 'status',
    visible: true,
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
