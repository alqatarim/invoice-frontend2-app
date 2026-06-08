"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SectionHeader from '@components/headers/SectionHeader';
import CustomAlert from '@/components/Alert/CustomAlert';
import {
  getBranchDialogInitialForm,
  normalizeUserId,
} from '@/utils/normalizeBranchFormValues';

const emptyDefaultAdminFields = {
  defaultAdminUserId: '',
  defaultAdminFirstName: '',
  defaultAdminLastName: '',
  defaultAdminUserName: '',
  defaultAdminEmail: '',
  defaultAdminMobileNumber: '',
  defaultAdminPassword: '',
};

const defaultForm = {
  name: '',
  type: 'STORE',
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

const trimPayload = value => (typeof value === 'string' ? value.trim() : value);

const DIALOG_PAPER_PROPS = {
  sx: {
    mt: { xs: 4, sm: 6 },
    width: '100%',
    minWidth: { xs: '90vw', sm: '600px', md: '800px' },
    minHeight: { xs: 'auto', sm: '400px' },
  },
};

const MODE_TITLES = {
  add: 'Add Store / Warehouse',
  edit: 'Edit Store / Warehouse',
  view: 'View Store / Warehouse',
};

/** Keeps dialog height stable when Type is Warehouse (admin fields hidden). */
const DEFAULT_ADMIN_SECTION_MIN_HEIGHT = 240;
/** SectionHeader row (avatar + title) — reserved when hidden for warehouses. */
const ADMIN_SECTION_HEADER_MIN_HEIGHT = 56;
/** Matches `CustomAlert` size="sm" skin="lighter" for add vs edit layout parity. */
const CURRENT_ADMIN_ALERT_PLACEHOLDER_MIN_HEIGHT = 40;

const BranchDialogFormFields = ({
  branch,
  formData,
  errors,
  readOnly,
  isStoreType,
  isCreatingNewDefaultAdmin,
  isViewingAssignedAdmin,
  provincesCities,
  cityOptions,
  districtOptions,
  assignableUsers,
  handleChange,
  handleTypeChange,
  handleProvinceChange,
  handleCityChange,
  handleDefaultAdminAssignmentChange,
}) => (
  <Box className="p-6">
    <Grid container columnSpacing={1} rowSpacing={2}>
      <Grid size={{ xs: 12 }}>
        <SectionHeader title="Details" icon="ri-store-2-line" className="mb-2" />
      </Grid>
      {branch?.branchId && (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Internal Branch ID" value={branch.branchId} fullWidth disabled />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth required disabled={readOnly} error={!!errors.type}>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={formData.type} onChange={e => handleTypeChange(e.target.value)}>
            <MenuItem value="STORE">Store</MenuItem>
            <MenuItem value="WAREHOUSE">Warehouse</MenuItem>
          </Select>
          {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          label="Store Code"
          value={formData.storeCode}
          onChange={e => handleChange('storeCode', e.target.value)}
          fullWidth
          disabled={readOnly}
        // helperText="Leave empty to auto-generate"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth required disabled={readOnly} error={!!errors.province}>
          <InputLabel>Province</InputLabel>
          <Select label="Province" value={formData.province} onChange={e => handleProvinceChange(e.target.value)}>
            {provincesCities.map(item => (
              <MenuItem key={item.province} value={item.province}>
                {item.display_name}
              </MenuItem>
            ))}
          </Select>
          {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl fullWidth required disabled={readOnly || !formData.province} error={!!errors.city}>
          <InputLabel>City</InputLabel>
          <Select label="City" value={formData.city} onChange={e => handleCityChange(e.target.value)}>
            {cityOptions.map(city => (
              <MenuItem key={city.name} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
          {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          label="Phone"
          value={formData.phone}
          onChange={e => handleChange('phone', e.target.value)}
          fullWidth
          disabled={readOnly}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          label="Email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          fullWidth
          disabled={readOnly}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          label="Address"
          value={formData.address}
          onChange={e => handleChange('address', e.target.value)}
          fullWidth
          disabled={readOnly}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Box
          className="mt-2"
          sx={{
            minHeight: DEFAULT_ADMIN_SECTION_MIN_HEIGHT,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              visibility: isStoreType ? 'visible' : 'hidden',
              minHeight: ADMIN_SECTION_HEADER_MIN_HEIGHT,
              mb: 0,
              flexShrink: 0,
            }}
            aria-hidden={!isStoreType}
          >
            <SectionHeader
              title="Default Store Admin"
              icon="ri-shield-user-line"
              color="info"
              className="mb-0"
            />
          </Box>

          {isStoreType ? (
            <Grid container columnSpacing={1} rowSpacing={2} sx={{ flex: 1, alignContent: 'flex-start' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                {branch?.defaultAdminName ? (
                  <CustomAlert
                    severity="info"
                    size="sm"
                    skin="lighter"
                    sx={{ width: 'fit-content', maxWidth: '100%' }}
                  >
                    Current Admin: {branch.defaultAdminName}
                    {branch.defaultAdminEmail ? ` (${branch.defaultAdminEmail})` : ''}
                  </CustomAlert>
                ) : (
                  <Box
                    aria-hidden
                    sx={{
                      minHeight: CURRENT_ADMIN_ALERT_PLACEHOLDER_MIN_HEIGHT,
                      width: 'fit-content',
                      maxWidth: '100%',
                    }}
                  />
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth disabled={readOnly}>
                  <InputLabel size="small">Assign Existing Team Member</InputLabel>
                  <Select
                    size="small"
                    label="Assign Existing Team Member"
                    value={formData.defaultAdminUserId}
                    onChange={e => handleDefaultAdminAssignmentChange(e.target.value)}
                  >
                    <MenuItem size="small" value="">
                      Create a new store admin
                    </MenuItem>
                    {assignableUsers.map(user => (
                      <MenuItem size="small" key={user.id} value={String(user.id)}>
                        {user.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {isViewingAssignedAdmin && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="First Name"
                      value={formData.defaultAdminFirstName}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Last Name"
                      value={formData.defaultAdminLastName}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Username"
                      value={formData.defaultAdminUserName}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Email"
                      value={formData.defaultAdminEmail}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Mobile Number"
                      value={formData.defaultAdminMobileNumber}
                      fullWidth
                      disabled
                      autoComplete="off"
                    />
                  </Grid>
                </>
              )}

              {isCreatingNewDefaultAdmin && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="First Name"
                      value={formData.defaultAdminFirstName}
                      onChange={e => handleChange('defaultAdminFirstName', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminFirstName}
                      helperText={errors.defaultAdminFirstName}
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Last Name"
                      value={formData.defaultAdminLastName}
                      onChange={e => handleChange('defaultAdminLastName', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminLastName}
                      helperText={errors.defaultAdminLastName}
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Username"
                      value={formData.defaultAdminUserName}
                      onChange={e => handleChange('defaultAdminUserName', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminUserName}
                      helperText={errors.defaultAdminUserName}
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Email"
                      value={formData.defaultAdminEmail}
                      onChange={e => handleChange('defaultAdminEmail', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminEmail}
                      helperText={errors.defaultAdminEmail}
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Mobile Number"
                      value={formData.defaultAdminMobileNumber}
                      onChange={e => handleChange('defaultAdminMobileNumber', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      autoComplete="off"
                      name="branch-default-admin-mobile"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      label="Temporary Password"
                      type="password"
                      value={formData.defaultAdminPassword}
                      onChange={e => handleChange('defaultAdminPassword', e.target.value)}
                      fullWidth
                      disabled={readOnly}
                      error={!!errors.defaultAdminPassword}
                      autoComplete="new-password"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          ) : (
            <Box aria-hidden sx={{ flex: 1, minHeight: 0 }} />
          )}
        </Box>
      </Grid>
    </Grid>
  </Box>
);

const BranchDialog = ({
  open,
  mode,
  branch,
  users = [],
  provincesCities = [],
  onClose,
  onClosed,
  onSave,
}) => {
  const theme = useTheme();
  const isFullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  const readOnly = mode === 'view';
  const isStoreType = formData.type === 'STORE';

  useEffect(() => {
    if (!open) return;

    setFormData(
      branch
        ? getBranchDialogInitialForm(branch, provincesCities)
        : defaultForm
    );
    setErrors({});
  }, [branch, open, provincesCities]);

  const cityOptions = useMemo(() => {
    const province = provincesCities.find(item => item.province === formData.province);
    const cities = [...(province?.cities || [])];

    if (formData.city && !cities.some(city => city.name === formData.city)) {
      cities.push({ name: formData.city, districts: [] });
    }

    return cities;
  }, [provincesCities, formData.province, formData.city]);

  const districtOptions = useMemo(() => {
    const city = cityOptions.find(item => item.name === formData.city);
    const districts = [...(city?.districts || [])];

    if (formData.district && !districts.includes(formData.district)) {
      districts.push(formData.district);
    }

    return districts;
  }, [cityOptions, formData.city, formData.district]);

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
            .join(' \u00b7 ') || 'Team Member'
      }));
  }, [users]);

  const hasNewDefaultAdminPayload = useMemo(
    () =>
      [
        formData.defaultAdminFirstName,
        formData.defaultAdminLastName,
        formData.defaultAdminUserName,
        formData.defaultAdminEmail,
      ].some(value => Boolean(trimPayload(value))),
    [formData]
  );

  const isCreatingNewDefaultAdmin = isStoreType && !formData.defaultAdminUserId;
  const isViewingAssignedAdmin = isStoreType && Boolean(formData.defaultAdminUserId);

  const assignableUsers = useMemo(() => {
    const options = [...eligibleUsers];
    const currentId = normalizeUserId(branch?.defaultAdminUserId || formData.defaultAdminUserId);

    if (currentId && !options.some(user => normalizeUserId(user.id) === currentId)) {
      options.unshift({
        id: currentId,
        label:
          [branch?.defaultAdminName, branch?.defaultAdminEmail].filter(Boolean).join(' \u00b7 ') ||
          'Current default admin',
      });
    }

    return options;
  }, [branch, eligibleUsers, formData.defaultAdminUserId]);

  const applyAssignedAdminToForm = userId => {
    const normalizedId = normalizeUserId(userId);
    const matchedUser = (users || []).find(
      user => normalizeUserId(user?._id || user?.id) === normalizedId
    );

    if (matchedUser) {
      setFormData(prev => ({
        ...prev,
        defaultAdminUserId: normalizedId,
        defaultAdminFirstName: matchedUser.firstName || '',
        defaultAdminLastName: matchedUser.lastName || '',
        defaultAdminUserName: matchedUser.userName || matchedUser.username || '',
        defaultAdminEmail: matchedUser.email || '',
        defaultAdminMobileNumber: matchedUser.mobileNumber || matchedUser.mobile || '',
        defaultAdminPassword: '',
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      defaultAdminUserId: normalizedId,
      defaultAdminFirstName: '',
      defaultAdminLastName: '',
      defaultAdminUserName: '',
      defaultAdminEmail: '',
      defaultAdminMobileNumber: '',
      defaultAdminPassword: '',
    }));
  };

  const handleDefaultAdminAssignmentChange = value => {
    if (!value) {
      setFormData(prev => ({ ...prev, ...emptyDefaultAdminFields }));
      return;
    }

    applyAssignedAdminToForm(value);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = value => {
    setFormData(prev => ({
      ...prev,
      type: value,
      defaultAdminUserId: value === 'STORE' ? prev.defaultAdminUserId : '',
      defaultAdminFirstName: value === 'STORE' ? prev.defaultAdminFirstName : '',
      defaultAdminLastName: value === 'STORE' ? prev.defaultAdminLastName : '',
      defaultAdminUserName: value === 'STORE' ? prev.defaultAdminUserName : '',
      defaultAdminEmail: value === 'STORE' ? prev.defaultAdminEmail : '',
      defaultAdminMobileNumber: value === 'STORE' ? prev.defaultAdminMobileNumber : '',
      defaultAdminPassword: value === 'STORE' ? prev.defaultAdminPassword : '',
    }));
  };

  const handleProvinceChange = value => {
    setFormData(prev => ({
      ...prev,
      province: value,
      city: '',
      district: '',
    }));
  };

  const handleCityChange = value => {
    setFormData(prev => ({
      ...prev,
      city: value,
      district: '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!trimPayload(formData.name)) nextErrors.name = 'Store or warehouse name is required';
    if (!formData.type) nextErrors.type = 'Location type is required';
    if (!formData.province) nextErrors.province = 'Province is required';
    if (!formData.city) nextErrors.city = 'City is required';

    if (isStoreType) {
      const hasExistingAdmin = Boolean(normalizeUserId(branch?.defaultAdminUserId));
      const isAssigningExistingUser = Boolean(formData.defaultAdminUserId);
      const isReplacingAdmin = isCreatingNewDefaultAdmin && hasNewDefaultAdminPayload;
      const requiresNewAdminAccount =
        isCreatingNewDefaultAdmin && (!hasExistingAdmin || isReplacingAdmin);

      if (requiresNewAdminAccount) {
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
      } else if (!hasExistingAdmin && !isAssigningExistingUser) {
        nextErrors.defaultAdminEmail = 'A default store admin is required for each store';
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
      type: formData.type,
      branchType: formData.type === 'WAREHOUSE' ? 'Warehouse' : 'Store',
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

    if (isStoreType) {
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

  const handleClose = onClose;

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      fullScreen={isFullScreen}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      scroll="body"
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={DIALOG_PAPER_PROPS}
      slotProps={{
        transition: {
          onExited: () => onClosed?.(),
        },
      }}
    >
      <DialogTitle
        variant="h4"
        className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16"
      >
        {MODE_TITLES[mode] || 'Location'}
      </DialogTitle>

      <DialogContent className="overflow-visible pbs-0 pbe-3 pli-0" sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className="absolute block-start-4 inline-end-4">
          <i className="ri-close-line text-textSecondary" />
        </IconButton>

        <BranchDialogFormFields
          branch={branch}
          formData={formData}
          errors={errors}
          readOnly={readOnly}
          isStoreType={isStoreType}
          isCreatingNewDefaultAdmin={isCreatingNewDefaultAdmin}
          isViewingAssignedAdmin={isViewingAssignedAdmin}
          provincesCities={provincesCities}
          cityOptions={cityOptions}
          districtOptions={districtOptions}
          assignableUsers={assignableUsers}
          handleChange={handleChange}
          handleTypeChange={handleTypeChange}
          handleProvinceChange={handleProvinceChange}
          handleCityChange={handleCityChange}
          handleDefaultAdminAssignmentChange={handleDefaultAdminAssignmentChange}
        />
      </DialogContent>

      {readOnly ? (
        <DialogActions className="flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      ) : (
        <DialogActions className="gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {mode === 'edit' ? 'Update Location' : 'Create Location'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BranchDialog;
