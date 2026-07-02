'use client';

import Link from 'next/link';
import { Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { Icon } from '@iconify/react';
import PageIconHeader from '@components/headers/PageIconHeader';
import SectionHeader from '@/components/headers/SectionHeader';
import {
  warrantyClaimLimitOptions,
  warrantyCoverageTypeOptions,
  warrantyDurationUnitOptions,
  warrantyPolicyStatusOptions,
  warrantyReturnBehaviorOptions,
} from '@/data/dataSets';

const TAB_PANEL_MIN_HEIGHT = 430;

const textFieldProps = ({ field, label, error, readOnly, ...props }) => ({
  ...field,
  ...props,
  fullWidth: true,
  label,
  value: field.value ?? '',
  error: Boolean(error),
  helperText: error?.message || '',
  InputProps: {
    readOnly,
  },
});

const SelectField = ({ control, name, label, options, disabled, error }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControl fullWidth disabled={disabled} error={Boolean(error)}>
        <InputLabel>{label}</InputLabel>
        <Select {...field} label={label} value={field.value ?? ''}>
          {options.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}
  />
);

const SwitchField = ({ control, name, label, disabled }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        control={<Switch checked={Boolean(field.value)} onChange={event => field.onChange(event.target.checked)} disabled={disabled} />}
        label={label}
      />
    )}
  />
);

const DetailsTab = ({ controller }) => (
  <Card sx={{ minHeight: { xs: 'auto', md: TAB_PANEL_MIN_HEIGHT } }}>
    <CardContent className="px-8 py-7">
      <div className="flex flex-col gap-6">
        <SectionHeader title="Policy Details" icon="ri-file-list-3-line" iconSize={30} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="name"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, label: 'Policy name', error: controller.errors.name, readOnly: controller.readOnly })} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="code"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, label: 'Policy No', readOnly: true, placeholder: 'Auto generated' })} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="durationValue"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, type: 'number', label: 'Duration', error: controller.errors.durationValue, readOnly: controller.readOnly })} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField
              control={controller.control}
              name="durationUnit"
              label="Duration unit"
              options={warrantyDurationUnitOptions}
              disabled={controller.readOnly}
              error={controller.errors.durationUnit}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField
              control={controller.control}
              name="status"
              label="Status"
              options={warrantyPolicyStatusOptions}
              disabled={controller.readOnly}
              error={controller.errors.status}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, multiline: true, minRows: 3, label: 'Description', error: controller.errors.description, readOnly: controller.readOnly })} />
              )}
            />
          </Grid>
        </Grid>
      </div>
    </CardContent>
  </Card>
);

const CoverageTab = ({ controller }) => {
  const extensionAllowed = controller.watch('extensionAllowed');
  const claimLimitType = controller.watch('claimLimitType');

  return (
    <Card sx={{ minHeight: { xs: 'auto', md: TAB_PANEL_MIN_HEIGHT } }}>
      <CardContent className="px-8 py-7">
        <div className="flex flex-col gap-6">
          <SectionHeader title="Coverage Rules" icon="mdi:shield-check-outline" iconSize={30} />

          <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField
              control={controller.control}
              name="coverageType"
              label="Coverage"
              options={warrantyCoverageTypeOptions}
              disabled={controller.readOnly}
              error={controller.errors.coverageType}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField
              control={controller.control}
              name="returnBehavior"
              label="Return behavior"
              options={warrantyReturnBehaviorOptions}
              disabled={controller.readOnly}
              error={controller.errors.returnBehavior}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SwitchField control={controller.control} name="extensionAllowed" label="Allow extensions" disabled={controller.readOnly} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="maxExtensionValue"
              control={controller.control}
              render={({ field }) => (
                <TextField
                  {...textFieldProps({
                    field,
                    type: 'number',
                    label: 'Max extension',
                    error: controller.errors.maxExtensionValue,
                    readOnly: controller.readOnly || !extensionAllowed,
                    disabled: !extensionAllowed,
                  })}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField
              control={controller.control}
              name="maxExtensionUnit"
              label="Max extension unit"
              options={warrantyDurationUnitOptions}
              disabled={controller.readOnly || !extensionAllowed}
              error={controller.errors.maxExtensionUnit}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField
              control={controller.control}
              name="claimLimitType"
              label="Claim limit"
              options={warrantyClaimLimitOptions}
              disabled={controller.readOnly}
              error={controller.errors.claimLimitType}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="claimLimitCount"
              control={controller.control}
              render={({ field }) => (
                <TextField
                  {...textFieldProps({
                    field,
                    type: 'number',
                    label: 'Claim count',
                    error: controller.errors.claimLimitCount,
                    readOnly: controller.readOnly || claimLimitType !== 'count',
                    disabled: claimLimitType !== 'count',
                  })}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SwitchField control={controller.control} name="requiresSerialNumber" label="Requires serial number" disabled={controller.readOnly} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SwitchField control={controller.control} name="isTransferable" label="Transferable" disabled={controller.readOnly} />
          </Grid>
          </Grid>
        </div>
      </CardContent>
    </Card>
  );
};

const TermsTab = ({ controller }) => (
  <Card sx={{ minHeight: { xs: 'auto', md: TAB_PANEL_MIN_HEIGHT } }}>
    <CardContent className="px-8 py-7">
      <div className="flex flex-col gap-6">
        <SectionHeader title="Terms And Instructions" icon="mdi:file-document-edit-outline" iconSize={30} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="termsAndConditions"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, multiline: true, minRows: 4, label: 'Terms and conditions', error: controller.errors.termsAndConditions, readOnly: controller.readOnly })} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="exclusions"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, multiline: true, minRows: 4, label: 'Exclusions', error: controller.errors.exclusions, readOnly: controller.readOnly })} />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="instructions"
              control={controller.control}
              render={({ field }) => (
                <TextField {...textFieldProps({ field, multiline: true, minRows: 4, label: 'Customer instructions', error: controller.errors.instructions, readOnly: controller.readOnly })} />
              )}
            />
          </Grid>
        </Grid>
      </div>
    </CardContent>
  </Card>
);

const Policy = ({ controller }) => {
  const tabs = [
    { label: 'Details', icon: 'ri-file-list-3-line', content: <DetailsTab controller={controller} /> },
    { label: 'Coverage', icon: 'mdi:shield-check-outline', content: <CoverageTab controller={controller} /> },
    { label: 'Terms', icon: 'mdi:file-document-edit-outline', content: <TermsTab controller={controller} /> },
  ];

  return (
    <Box className="flex flex-col gap-3">
      <PageIconHeader title={controller.title} icon="mdi:shield-star-outline" iconSize={30} />

      <form
        id={controller.formId}
        onSubmit={controller.handleSubmit(controller.handleFormSubmit, controller.handleValidationError)}
        className="flex flex-col gap-3"
      >
        <Tabs
          value={controller.activeTab}
          onChange={(_event, value) => controller.setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map(tab => (
            <Tab key={tab.label} icon={<Icon icon={tab.icon} />} iconPosition="start" label={tab.label} />
          ))}
        </Tabs>

        <Box>
          {tabs.map((tab, index) => (
            <Box key={tab.label} role="tabpanel" hidden={controller.activeTab !== index} sx={{ display: controller.activeTab === index ? 'block' : 'none' }}>
              {tab.content}
            </Box>
          ))}
        </Box>
      </form>

      <Box className="flex flex-col justify-center gap-2 pb-6 sm:flex-row">
        <Button className="w-[140px]" variant="outlined" color="secondary" onClick={controller.handleBack} disabled={controller.isSubmitting}>
          Back
        </Button>

        {controller.readOnly && controller.policy?._id ? (
          <Button className="w-[140px]" component={Link} href={`/policies/policy-edit/${controller.policy._id}`} variant="contained">
            Edit
          </Button>
        ) : null}

        {!controller.readOnly ? (
          <Button className="w-[140px]" type="submit" form={controller.formId} variant="contained" disabled={controller.isSubmitting}>
            {controller.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
};

export default Policy;
