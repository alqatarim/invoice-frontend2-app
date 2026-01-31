"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';

const defaultForm = {
  name: '',
  branchType: '',
  province: '',
  city: '',
  district: '',
  address: '',
  phone: '',
  email: '',
  notes: '',
  status: true,
};

const BranchDialog = ({ open, mode, branch, provincesCities = [], onClose, onSave }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        branchType: branch.branchType || '',
        province: branch.province || '',
        city: branch.city || '',
        district: branch.district || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        notes: branch.notes || '',
        status: branch.status !== false,
      });
    } else {
      setFormData(defaultForm);
    }
    setErrors({});
  }, [branch, open]);

  const readOnly = mode === 'view';

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

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Branch name is required';
    if (!formData.branchType) nextErrors.branchType = 'Branch type is required';
    if (!formData.province) nextErrors.province = 'Province is required';
    if (!formData.city) nextErrors.city = 'City is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (readOnly) return;
    if (!validateForm()) return;
    onSave?.(formData);
  };

  const titleMap = {
    add: 'Add Branch',
    edit: 'Edit Branch',
    view: 'View Branch',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{titleMap[mode] || 'Branch'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {branch?.branchId && (
            <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField label="Branch ID" value={branch.branchId} fullWidth disabled />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <TextField
              label="Branch Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              disabled={readOnly}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <FormControl fullWidth required disabled={readOnly} error={!!errors.branchType}>
              <InputLabel>Branch Type</InputLabel>
              <Select
                label="Branch Type"
                value={formData.branchType}
                onChange={(e) => setFormData(prev => ({ ...prev, branchType: e.target.value }))}
              >
                <MenuItem value="Store">Store</MenuItem>
                <MenuItem value="Warehouse">Warehouse</MenuItem>
              </Select>
              {errors.branchType && <FormHelperText>{errors.branchType}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <FormControl fullWidth required disabled={readOnly} error={!!errors.province}>
              <InputLabel>Province</InputLabel>
              <Select
                label="Province"
                value={formData.province}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    province: e.target.value,
                    city: '',
                    district: '',
                  }));
                }}
              >
                {provinceOptions.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
              {errors.province && <FormHelperText>{errors.province}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <FormControl fullWidth required disabled={readOnly || !formData.province} error={!!errors.city}>
              <InputLabel>City</InputLabel>
              <Select
                label="City"
                value={formData.city}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    city: e.target.value,
                    district: '',
                  }));
                }}
              >
                {cityOptions.map((city) => (
                  <MenuItem key={city.name} value={city.name}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <FormControl fullWidth disabled={readOnly || !formData.city}>
              <InputLabel>District (Optional)</InputLabel>
              <Select
                label="District (Optional)"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
              >
                <MenuItem value="">None</MenuItem>
                {districtOptions.map((district) => (
                  <MenuItem key={district} value={district}>
                    {district}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ width: { xs: '100%', md: '50%' } }}>
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ width: { xs: '100%' } }}>
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              fullWidth
              disabled={readOnly}
            />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ width: { xs: '100%' } }}>
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.status !== false}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                  disabled={readOnly}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly && (
          <Button onClick={handleSubmit} variant="contained">
            {mode === 'edit' ? 'Update' : 'Add'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BranchDialog;
