"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const defaultForm = {
  name: '',
  kind: 'STORE',
  storeCode: '',
  province: '',
  city: '',
  district: '',
  address: '',
  phone: '',
  email: '',
  notes: '',
  status: true,
  defaultAdminUserId: '',
  defaultAdminFirstName: '',
  defaultAdminLastName: '',
  defaultAdminUserName: '',
  defaultAdminEmail: '',
  defaultAdminMobileNumber: '',
  defaultAdminPassword: '',
};

const getInitialForm = branch => ({
  name: branch?.name || '',
  kind: branch?.kind || (branch?.branchType === 'Warehouse' ? 'WAREHOUSE' : 'STORE'),
  storeCode: branch?.storeCode || '',
  province: branch?.province || '',
  city: branch?.city || '',
  district: branch?.district || '',
  address: branch?.address || '',
  phone: branch?.phone || '',
  email: branch?.email || '',
  notes: branch?.notes || '',
  status: branch?.status !== false,
  defaultAdminUserId: '',
  defaultAdminFirstName: '',
  defaultAdminLastName: '',
  defaultAdminUserName: '',
  defaultAdminEmail: '',
  defaultAdminMobileNumber: '',
  defaultAdminPassword: '',
});

const trimPayload = value => (typeof value === 'string' ? value.trim() : value);

const BranchDialog = ({ open, mode, branch, users = [], provincesCities = [], onClose, onSave }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const readOnly = mode === 'view';
  const isStoreKind = formData.kind === 'STORE';

  useEffect(() => {
    setFormData(branch ? getInitialForm(branch) : defaultForm);
    setErrors({});
  }, [branch, open]);

  const provinceOptions = useMemo(
    () => provincesCities.map(item => item.province),
    [provincesCities]
  );

  const cityOptions = useMemo(() => {
    const province = provincesCities.find(item => item.province === formData.province);
    return province?.cities || [];
  }, [provincesCities, formData.province]);

  const districtOptions = useMemo(() => {
    const city = cityOptions.find(item => item.name === formData.city);
    return city?.districts || [];
  }, [cityOptions, formData.city]);

  const eligibleUsers = useMemo(() => {
    const seen = new Set();

    return (users || [])
      .filter(user => {
        const userId = user?._id || user?.id;
        if (!userId || seen.has(userId)) return false;
        if (user?.role === 'Super Admin') return false;
        seen.add(userId);
        return true;
      })
      .map(user => ({
        id: user._id || user.id,
        label:
          [
            user.fullname || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName,
            user.email
          ]
            .filter(Boolean)
            .join(' · ') || 'Team Member'
      }));
  }, [users]);

  const hasNewDefaultAdminPayload = useMemo(
    () =>
      [
        formData.defaultAdminFirstName,
        formData.defaultAdminLastName,
        formData.defaultAdminUserName,
        formData.defaultAdminEmail,
        formData.defaultAdminMobileNumber,
        formData.defaultAdminPassword
      ].some(value => Boolean(trimPayload(value))),
    [formData]
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKindChange = value => {
    setFormData(prev => ({
      ...prev,
      kind: value,
      defaultAdminUserId: value === 'STORE' ? prev.defaultAdminUserId : '',
      defaultAdminFirstName: value === 'STORE' ? prev.defaultAdminFirstName : '',
      defaultAdminLastName: value === 'STORE' ? prev.defaultAdminLastName : '',
      defaultAdminUserName: value === 'STORE' ? prev.defaultAdminUserName : '',
      defaultAdminEmail: value === 'STORE' ? prev.defaultAdminEmail : '',
      defaultAdminMobileNumber: value === 'STORE' ? prev.defaultAdminMobileNumber : '',
      defaultAdminPassword: value === 'STORE' ? prev.defaultAdminPassword : '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!trimPayload(formData.name)) nextErrors.name = 'Store or warehouse name is required';
    if (!formData.kind) nextErrors.kind = 'Location kind is required';
    if (!formData.province) nextErrors.province = 'Province is required';
    if (!formData.city) nextErrors.city = 'City is required';

    if (isStoreKind) {
      const hasExistingAdmin = Boolean(branch?.defaultAdminUserId);
      const isAssigningExistingUser = Boolean(formData.defaultAdminUserId);

      if (!hasExistingAdmin && !isAssigningExistingUser && !trimPayload(formData.defaultAdminEmail)) {
        nextErrors.defaultAdminEmail = 'A default store admin is required for each store';
      }

      if (!isAssigningExistingUser && (hasNewDefaultAdminPayload || !hasExistingAdmin)) {
        if (!trimPayload(formData.defaultAdminFirstName)) {
          nextErrors.defaultAdminFirstName = 'First name is required';
        }
        if (!trimPayload(formData.defaultAdminLastName)) {
          nextErrors.defaultAdminLastName = 'Last name is required';
        }
        if (!trimPayload(formData.defaultAdminUserName)) {
          nextErrors.defaultAdminUserName = 'Username is required';
        }
        if (!trimPayload(formData.defaultAdminEmail)) {
          nextErrors.defaultAdminEmail = 'Email is required';
        }
        if (!trimPayload(formData.defaultAdminPassword)) {
          nextErrors.defaultAdminPassword = 'Password is required';
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (readOnly) return;
    if (!validateForm()) return;

    const payload = {
      name: trimPayload(formData.name),
      kind: formData.kind,
      branchType: formData.kind === 'WAREHOUSE' ? 'Warehouse' : 'Store',
      storeCode: trimPayload(formData.storeCode),
      province: formData.province,
      city: formData.city,
      district: trimPayload(formData.district),
      address: trimPayload(formData.address),
      phone: trimPayload(formData.phone),
      email: trimPayload(formData.email),
      notes: trimPayload(formData.notes),
      status: Boolean(formData.status),
    };

    if (isStoreKind) {
      if (formData.defaultAdminUserId) {
        payload.defaultAdminUserId = formData.defaultAdminUserId;
      } else if (hasNewDefaultAdminPayload || !branch?.defaultAdminUserId) {
        payload.defaultAdminFirstName = trimPayload(formData.defaultAdminFirstName);
        payload.defaultAdminLastName = trimPayload(formData.defaultAdminLastName);
        payload.defaultAdminUserName = trimPayload(formData.defaultAdminUserName);
        payload.defaultAdminEmail = trimPayload(formData.defaultAdminEmail);
        payload.defaultAdminMobileNumber = trimPayload(formData.defaultAdminMobileNumber);
        payload.defaultAdminPassword = trimPayload(formData.defaultAdminPassword);
      }
    }

    onSave?.(payload);
  };

  const titleMap = {
    add: 'Add Store / Warehouse',
    edit: 'Edit Store / Warehouse',
    view: 'View Store / Warehouse',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{titleMap[mode] || 'Location'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {branch?.branchId && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Internal Branch ID" value={branch.branchId} fullWidth disabled />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Location Name"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              fullWidth
              required
              disabled={readOnly}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required disabled={readOnly} error={!!errors.kind}>
              <InputLabel>Location Kind</InputLabel>
              <Select
                label="Location Kind"
                value={formData.kind}
                onChange={e => handleKindChange(e.target.value)}
              >
                <MenuItem value="STORE">Store</MenuItem>
                <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
              </Select>
              {errors.kind && <FormHelperText>{errors.kind}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Store Code"
              value={formData.storeCode}
              onChange={e => handleChange('storeCode', e.target.value)}
              fullWidth
              disabled={readOnly}
              helperText="Leave empty to auto-generate"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required disabled={readOnly} error={!!errors.province}>
              <InputLabel>Province</InputLabel>
              <Select
                label="Province"
                value={formData.province}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    province: e.target.value,
                    city: '',
                    district: '',
                  }));
                }}
              >
                {provinceOptions.map(province => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
              {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required disabled={readOnly || !formData.province} error={!!errors.city}>
              <InputLabel>City</InputLabel>
              <Select
                label="City"
                value={formData.city}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    city: e.target.value,
                    district: '',
                  }));
                }}
              >
                {cityOptions.map(city => (
                  <MenuItem key={city.name} value={city.name}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={readOnly || !formData.city}>
              <InputLabel>District</InputLabel>
              <Select
                label="District"
                value={formData.district}
                onChange={e => handleChange('district', e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {districtOptions.map(district => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Address"
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={readOnly}
            />
          </Grid>

          {isStoreKind && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider textAlign="left">Default Store Admin</Divider>
              </Grid>

              {branch?.defaultAdminName && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info">
                    Current default admin: {branch.defaultAdminName}
                    {branch.defaultAdminEmail ? ` (${branch.defaultAdminEmail})` : ''}
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Alert severity="warning">
                  Every store must have a default store admin. You can assign an existing team member or create a new store admin account here.
                </Alert>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth disabled={readOnly}>
                  <InputLabel>Assign Existing Team Member</InputLabel>
                  <Select
                    label="Assign Existing Team Member"
                    value={formData.defaultAdminUserId}
                    onChange={e => handleChange('defaultAdminUserId', e.target.value)}
                  >
                    <MenuItem value="">Create a new store admin</MenuItem>
                    {eligibleUsers.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {!formData.defaultAdminUserId && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      New Default Admin Account
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="First Name"
                      value={formData.defaultAdminFirstName}
                      onChange={e => handleChange('defaultAdminFirstName', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminFirstName}
                      helperText={errors.defaultAdminFirstName}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Last Name"
                      value={formData.defaultAdminLastName}
                      onChange={e => handleChange('defaultAdminLastName', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminLastName}
                      helperText={errors.defaultAdminLastName}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Username"
                      value={formData.defaultAdminUserName}
                      onChange={e => handleChange('defaultAdminUserName', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminUserName}
                      helperText={errors.defaultAdminUserName}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Email"
                      value={formData.defaultAdminEmail}
                      onChange={e => handleChange('defaultAdminEmail', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminEmail}
                      helperText={errors.defaultAdminEmail}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Mobile Number"
                      value={formData.defaultAdminMobileNumber}
                      onChange={e => handleChange('defaultAdminMobileNumber', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Temporary Password"
                      type="password"
                      value={formData.defaultAdminPassword}
                      onChange={e => handleChange('defaultAdminPassword', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminPassword}
                      helperText={errors.defaultAdminPassword || 'Required when creating a new default admin'}
                    />
                  </Grid>
                </>
              )}
            </>
          )}

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.status !== false}
                    onChange={e => handleChange('status', e.target.checked)}
                    disabled={readOnly}
                  />
                }
                label="Active"
              />
              {branch?.defaultAdminName && isStoreKind ? (
                <Typography variant="body2" color="text.secondary">
                  Leave the admin section unchanged to keep the current default store admin.
                </Typography>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly && (
          <Button onClick={handleSubmit} variant="contained">
            {mode === 'edit' ? 'Update Location' : 'Create Location'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BranchDialog;
