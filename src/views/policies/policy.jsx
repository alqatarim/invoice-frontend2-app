'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import {
  warrantyClaimLimitOptions,
  warrantyCoverageTypeOptions,
  warrantyDurationUnitOptions,
  warrantyPolicyStatusOptions,
  warrantyReturnBehaviorOptions,
} from '@/data/dataSets';

const Policy = ({ open, mode, form, onChange, onClose, onSubmit, saving }) => {
  const readOnly = mode === 'view';
  const title = mode === 'add' ? 'Add Warranty Policy' : mode === 'edit' ? 'Edit Warranty Policy' : 'Warranty Policy';

  const updateField = field => event => {
    const value = event?.target?.type === 'checkbox' ? event.target.checked : event.target.value;
    onChange(current => ({ ...current, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} className="pt-1">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Policy name" value={form.name} onChange={updateField('name')} disabled={readOnly} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Policy No" value={form.code} disabled placeholder="Auto generated" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth type="number" label="Duration" value={form.durationValue} onChange={updateField('durationValue')} disabled={readOnly} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Duration unit</InputLabel>
              <Select label="Duration unit" value={form.durationUnit} onChange={updateField('durationUnit')}>
                {warrantyDurationUnitOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status} onChange={updateField('status')}>
                {warrantyPolicyStatusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Coverage</InputLabel>
              <Select label="Coverage" value={form.coverageType} onChange={updateField('coverageType')}>
                {warrantyCoverageTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Return behavior</InputLabel>
              <Select label="Return behavior" value={form.returnBehavior} onChange={updateField('returnBehavior')}>
                {warrantyReturnBehaviorOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel control={<Switch checked={form.extensionAllowed} onChange={updateField('extensionAllowed')} disabled={readOnly} />} label="Allow extensions" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth type="number" label="Max extension" value={form.maxExtensionValue} onChange={updateField('maxExtensionValue')} disabled={readOnly || !form.extensionAllowed} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth disabled={readOnly || !form.extensionAllowed}>
              <InputLabel>Max extension unit</InputLabel>
              <Select label="Max extension unit" value={form.maxExtensionUnit} onChange={updateField('maxExtensionUnit')}>
                {warrantyDurationUnitOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={readOnly}>
              <InputLabel>Claim limit</InputLabel>
              <Select label="Claim limit" value={form.claimLimitType} onChange={updateField('claimLimitType')}>
                {warrantyClaimLimitOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="number" label="Claim count" value={form.claimLimitCount} onChange={updateField('claimLimitCount')} disabled={readOnly || form.claimLimitType !== 'count'} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel control={<Switch checked={form.requiresSerialNumber} onChange={updateField('requiresSerialNumber')} disabled={readOnly} />} label="Requires serial number" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel control={<Switch checked={form.isTransferable} onChange={updateField('isTransferable')} disabled={readOnly} />} label="Transferable" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline minRows={2} label="Description" value={form.description} onChange={updateField('description')} disabled={readOnly} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline minRows={3} label="Terms and conditions" value={form.termsAndConditions} onChange={updateField('termsAndConditions')} disabled={readOnly} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth multiline minRows={3} label="Exclusions" value={form.exclusions} onChange={updateField('exclusions')} disabled={readOnly} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth multiline minRows={3} label="Customer instructions" value={form.instructions} onChange={updateField('instructions')} disabled={readOnly} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="tonal">Close</Button>
        {!readOnly ? (
          <Button onClick={onSubmit} disabled={saving} variant="contained">
            {saving ? 'Saving...' : 'Save'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default Policy;
