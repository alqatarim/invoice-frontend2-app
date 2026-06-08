'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import {
  getAvailableBranchesForRow,
  getOrganizationalRoleLabel,
  isCompanyWideOrganizationalRole,
  isStoreScopedOrganizationalRole,
  requiresPermissionProfile,
} from './userAccessCascade';

const getPermissionRoleLabel = (roles, value) => {
  const match = roles.find(role => role.id === value || role.value === value);
  return match?.label || '—';
};

const userAccessColumns = ({
  mode = 'view',
  control,
  errors,
  fieldLocked,
  roles = [],
  branchOptions = [],
  accessRows = [],
  organizationalRoleOptions = [],
  isEditingOwner = false,
  fieldsLength = 1,
  handleRemoveRow,
  handlePrimaryChange,
  syncRowsToOrganizationalRole,
}) => {
  const isEditMode = mode === 'edit';

  const renderViewCell = (columnKey, row) => {
    switch (columnKey) {
      case 'organizationalRole':
        return (
          <Typography variant="body2" color="text.primary">
            {getOrganizationalRoleLabel(row.organizationalRole)}
          </Typography>
        );
      case 'branchId':
        return (
          <Typography variant="body2" color="text.primary">
            {isStoreScopedOrganizationalRole(row.organizationalRole)
              ? branchOptions.find(branch => branch.id === row.branchId)?.label || '—'
              : 'All stores'}
          </Typography>
        );
      case 'permissionRoleId':
        return (
          <Typography variant="body2" color="text.primary">
            {requiresPermissionProfile(row.organizationalRole)
              ? getPermissionRoleLabel(roles, row.permissionRoleId)
              : 'Full access'}
          </Typography>
        );
      case 'isPrimary':
        return (
          <Typography variant="body2" color="text.primary">
            {row.isPrimary ? 'Yes' : '—'}
          </Typography>
        );
      default:
        return '—';
    }
  };

  const renderEditCell = (columnKey, row, index) => {
    const rowErrors = errors?.accessRows?.[index];
    const organizationalRole = row.organizationalRole || 'STORE_MEMBER';
    const isCompanyWide = isCompanyWideOrganizationalRole(organizationalRole);
    const isStoreScoped = isStoreScopedOrganizationalRole(organizationalRole);
    const availableBranches = getAvailableBranchesForRow(branchOptions, accessRows, index);

    switch (columnKey) {
      case 'actions':
        return (
          <IconButton
            size="small"
            color="error"
            disabled={fieldLocked || fieldsLength <= 1 || isCompanyWide}
            onClick={() => handleRemoveRow(index)}
            aria-label="Remove access row"
          >
            <Icon icon="mdi:trash-can-outline" width={18} />
          </IconButton>
        );
      case 'organizationalRole':
        return (
          <Controller
            name={`accessRows.${index}.organizationalRole`}
            control={control}
            render={({ field: roleField }) => (
              <FormControl fullWidth size="small" error={!!rowErrors?.organizationalRole}>
                <InputLabel size="small" >Organizational role</InputLabel>
                <Select
                  {...roleField}
                  label="Organizational role"
                  disabled={fieldLocked || (isEditingOwner && organizationalRole === 'OWNER')}
                  onChange={e => syncRowsToOrganizationalRole(e.target.value, index)}
                >
                  {organizationalRoleOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        );
      case 'branchId':
        if (!isStoreScoped) {
          return (
            <Typography variant="body2" color="text.secondary" className="italic pt-2">
              All stores
            </Typography>
          );
        }
        return (
          <Controller
            name={`accessRows.${index}.branchId`}
            control={control}
            render={({ field: branchField }) => (
              <FormControl fullWidth size="small" error={!!rowErrors?.branchId}>
                <InputLabel>Store</InputLabel>
                <Select {...branchField} label="Store" disabled={fieldLocked}>
                  {availableBranches.map(branch => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        );
      case 'permissionRoleId':
        if (!requiresPermissionProfile(organizationalRole)) {
          return (
            <Typography variant="body2" color="text.secondary" className="italic pt-2">
              Full access
            </Typography>
          );
        }
        return (
          <Controller
            name={`accessRows.${index}.permissionRoleId`}
            control={control}
            render={({ field: permissionField }) => (
              <FormControl fullWidth size="small" error={!!rowErrors?.permissionRoleId}>
                <InputLabel size="small">Permission profile</InputLabel>
                <Select {...permissionField} label="Permission profile" disabled={fieldLocked}>
                  {roles.map(role => (
                    <MenuItem key={role.id || role.value} value={role.id || role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        );
      case 'isPrimary':
        if (!isStoreScoped) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        return (
          <Radio
            size="small"
            checked={Boolean(row.isPrimary)}
            disabled={fieldLocked || !row.branchId}
            onChange={() => handlePrimaryChange(index)}
          />
        );
      default:
        return null;
    }
  };

  const columnDefs = [

    {
      key: 'organizationalRole',
      label: 'Organizational role',
      visible: true,
      align: 'left',
      minWidth: 160,
      renderCell: (row, rowIdx) =>
        isEditMode
          ? renderEditCell('organizationalRole', row, rowIdx)
          : renderViewCell('organizationalRole', row),
    },
    {
      key: 'branchId',
      label: 'Store',
      visible: true,
      align: 'left',
      minWidth: 140,
      renderCell: (row, rowIdx) =>
        isEditMode ? renderEditCell('branchId', row, rowIdx) : renderViewCell('branchId', row),
    },
    {
      key: 'permissionRoleId',
      label: 'Permission profile',
      visible: true,
      align: 'left',
      hideBelow: 'md',
      minWidth: 160,
      renderCell: (row, rowIdx) =>
        isEditMode
          ? renderEditCell('permissionRoleId', row, rowIdx)
          : renderViewCell('permissionRoleId', row),
    },
    {
      key: 'isPrimary',
      label: 'Default',
      visible: true,
      align: 'center',
      hideBelow: 'md',
      minWidth: 72,
      renderCell: (row, rowIdx) =>
        isEditMode ? renderEditCell('isPrimary', row, rowIdx) : renderViewCell('isPrimary', row),
    },

    ...(isEditMode
      ? [
        {
          key: 'actions',
          label: '',
          visible: true,
          align: 'center',
          width: 44,
          minWidth: 44,
          renderCell: (row, rowIdx) => renderEditCell('actions', row, rowIdx),
        },
      ]
      : []),
  ];

  return columnDefs;
};

export default userAccessColumns;
