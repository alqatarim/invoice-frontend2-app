'use client';

import React from 'react';
import { MenuItem, TextField } from '@mui/material';

import { resolveBranchId } from '@/utils/branchAccess';

const StoreScopeSelect = ({
  label = 'Store Scope',
  size = 'medium',
  value = '',
  onChange,
  fullWidth = true,
  branches = [],
  disabled = false,
  allowAll = true,
  allLabel = 'All Stores',
  sx = {},
}) => {
  const normalizedBranches = Array.isArray(branches) ? branches : [];

  const resolveSelectedLabel = selectedValue => {
    if (!selectedValue) return allLabel;

    const branch = normalizedBranches.find(
      item => resolveBranchId(item) === selectedValue
    );

    return branch?.name || branch?.branchId || selectedValue;
  };

  return (
    <TextField
      fullWidth={fullWidth}
      select
      size={size}
      label={label}
      value={value}
      onChange={event => onChange?.(event.target.value)}
      disabled={disabled}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        displayEmpty: true,
        renderValue: selected => resolveSelectedLabel(selected),
      }}
      sx={{ ...sx }}
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
