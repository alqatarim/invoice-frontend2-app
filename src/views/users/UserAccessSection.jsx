'use client';

import React, { useCallback, useMemo } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
} from '@mui/material';
import { Icon } from '@iconify/react';
import SectionHeader from '@components/headers/SectionHeader';
import CustomListTableSmall from '@/components/custom-components/CustomListTableSmall';
import {
  createEmptyAccessRow,
  getTeamFormOrganizationalRoles,
  isCompanyWideOrganizationalRole,
  isStoreScopedOrganizationalRole,
} from './userAccessCascade';
import userAccessColumns from './userAccessColumns';

const UserAccessSection = ({
  control,
  errors,
  isViewMode,
  fieldLocked,
  roles,
  branchOptions,
  userData,
  appendAccessRow,
  setValue,
}) => {
  const isEditingOwner =
    (userData?.organizationalRole || userData?.orgRole) === 'OWNER';

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accessRows',
  });

  const accessRows = useWatch({ control, name: 'accessRows' }) || [];

  const organizationalRoleOptions = useMemo(
    () => getTeamFormOrganizationalRoles(isEditingOwner),
    [isEditingOwner]
  );

  const syncRowsToOrganizationalRole = useCallback(
    (organizationalRole, rowIndex = 0) => {
      const nextRows = accessRows.map((row, index) => {
        const base = {
          ...row,
          organizationalRole,
        };

        if (isCompanyWideOrganizationalRole(organizationalRole)) {
          return {
            ...base,
            branchId: '',
            permissionRoleId: '',
            isPrimary: index === rowIndex,
          };
        }

        return base;
      });

      const trimmedRows = isCompanyWideOrganizationalRole(organizationalRole)
        ? [nextRows[rowIndex] || createEmptyAccessRow({ organizationalRole, isPrimary: true })]
        : nextRows.length
          ? nextRows
          : [createEmptyAccessRow({ organizationalRole, isPrimary: true })];

      setValue('accessRows', trimmedRows, { shouldDirty: true, shouldValidate: true });
      setValue('organizationalRole', organizationalRole, { shouldDirty: true });
    },
    [accessRows, setValue]
  );

  const handleAddRow = useCallback(() => {
    if (appendAccessRow) {
      appendAccessRow();
      return;
    }
    const organizationalRole = accessRows[0]?.organizationalRole || 'STORE_MEMBER';
    if (isCompanyWideOrganizationalRole(organizationalRole)) {
      return;
    }
    append(createEmptyAccessRow({ organizationalRole }));
  }, [accessRows, append, appendAccessRow]);

  const handleRemoveRow = useCallback(
    index => {
      if (fields.length <= 1) return;
      remove(index);
    },
    [fields.length, remove]
  );

  const handlePrimaryChange = useCallback(
    index => {
      const nextRows = accessRows.map((row, rowIndex) => ({
        ...row,
        isPrimary: rowIndex === index,
      }));
      setValue('accessRows', nextRows, { shouldDirty: true, shouldValidate: true });
    },
    [accessRows, setValue]
  );

  const columnContext = useMemo(
    () => ({
      mode: isViewMode ? 'view' : 'edit',
      control,
      errors,
      fieldLocked,
      roles: roles || [],
      branchOptions: branchOptions || [],
      accessRows,
      organizationalRoleOptions,
      isEditingOwner,
      fieldsLength: fields.length,
      handleRemoveRow,
      handlePrimaryChange,
      syncRowsToOrganizationalRole,
    }),
    [
      isViewMode,
      control,
      errors,
      fieldLocked,
      roles,
      branchOptions,
      accessRows,
      organizationalRoleOptions,
      isEditingOwner,
      fields.length,
      handleRemoveRow,
      handlePrimaryChange,
      syncRowsToOrganizationalRole,
    ]
  );

  const columns = useMemo(() => userAccessColumns(columnContext), [columnContext]);

  const tableRows = useMemo(() => {
    if (isViewMode) {
      return accessRows;
    }
    return fields.map((field, index) => ({
      ...(accessRows[index] || {}),
      _fieldId: field.id,
    }));
  }, [isViewMode, fields, accessRows]);

  const primaryOrgRole = accessRows[0]?.organizationalRole;
  const canAddStoreRows = isStoreScopedOrganizationalRole(primaryOrgRole);

  const addStoreRowButton = !isViewMode ? (
    <Button
      variant="text"
      size="small"
      startIcon={<Icon icon="mdi:plus" />}
      onClick={handleAddRow}
      disabled={fieldLocked || isEditingOwner || !canAddStoreRows}
    >
      Add Role
    </Button>
  ) : undefined;

  const accessTable = (
    <CustomListTableSmall
      columns={columns}
      rows={tableRows}
      rowKey={(row, rowIdx) => row._fieldId || `access-${rowIdx}`}
      enableHover={false}
      pagination={false}
      noDataText="No access rows configured."
      addRowButton={addStoreRowButton}
      minBodyRows={3}
      maxBodyRows={3}
      reservedBodyRowHeight={60}
    />
  );

  if (isViewMode) {
    return (
      <Box >
        <SectionHeader
          title="Access & permissions"
          icon="mdi:shield-account-outline"
          className='mb-3'

        />
        <Box sx={{ overflowX: 'auto' }}>
          {accessTable}
        </Box>

      </Box>
    );
  }

  return (
    <Box>
      <SectionHeader

        title="Access & permissions"
        icon="mdi:shield-account-outline"
        className="mb-0"
      />
      <Box className="mt-[-15px]" sx={{ overflowX: 'auto' }}>
        {accessTable}
      </Box>

      {/* <Box
        className="mt-4 p-3 rounded-lg"
        sx={{
          border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
          maxWidth: 280,
        }}
      >
        <Typography variant="subtitle2" className="mb-2 font-semibold">
          Account status
        </Typography>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.status}>
              <InputLabel>Status</InputLabel>
              <Select {...field} label="Status" disabled={fieldLocked}>
                {userStatusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
            </FormControl>
          )}
        />
      </Box> */}
    </Box>
  );
};

export default UserAccessSection;
