'use client';

import React from 'react';
import { MenuItem, TextField } from '@mui/material';

import { resolveBranchId } from '@/utils/branchAccess';

const StoreScopeSelect = ({
  label = 'Store Scope',
  value = '',
  onChange,
  branches = [],
  disabled = false,
  allowAll = true,
  allLabel = 'All assigned stores',
  sx = {},
}) => {
  const normalizedBranches = Array.isArray(branches) ? branches : [];

  return (
    <TextField
      select
      size='small'
      label={label}
      value={value}
      onChange={event => onChange?.(event.target.value)}
      disabled={disabled}
      sx={{ minWidth: 220, ...sx }}
    >
      {allowAll ? <MenuItem value=''>{allLabel}</MenuItem> : null}
      {normalizedBranches.map(branch => {
        const branchValue = resolveBranchId(branch);
        if (!branchValue) return null;

        return (
          <MenuItem key={branchValue} value={branchValue}>
            {branch?.name || branch?.branchId || branchValue}
          </MenuItem>
        );
      })}
    </TextField>
  );
};

export default StoreScopeSelect;
