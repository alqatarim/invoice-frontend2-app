'use client';

import { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
} from '@mui/material';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import SimpleOptionAutocomplete from '@/components/shared/SimpleOptionAutocomplete';
import useAddWarrantyHandler from './handler';

const formatPolicyDescription = policy => {
  const duration = policy?.duration;
  const durationText = duration?.value
    ? `${duration.value} ${duration.unit || 'months'}`
    : 'No duration';
  const coverageText = policy?.coverageType ? String(policy.coverageType).replace(/_/g, ' ') : 'No coverage type';

  return `${durationText} • ${coverageText}`;
};

const formatCustomerDescription = customer => [customer?.phone, customer?.email].filter(Boolean).join(' • ');

const getProductWarrantyPolicyId = product => {
  const policy = product?.warrantyPolicyId;

  if (!policy) return '';
  if (typeof policy === 'object') return policy._id || '';

  return policy;
};

const AddWarrantyDialog = ({ open, onClose, onSave, onError, options = {}, optionsLoading = false }) => {
  const products = options.products || [];
  const policies = options.policies || [];
  const customers = options.customers || [];
  const {
    control,
    errors,
    handleClose,
    handleFormSubmit,
    handleSubmit,
    handleValidationError,
    isSubmitting,
    setValue,
  } = useAddWarrantyHandler({
    onClose,
    onError,
    onSave,
  });
  const selectedPolicyId = useWatch({ control, name: 'policyId' });
  const selectedPolicy = policies.find(policy => String(policy?._id) === String(selectedPolicyId || ''));
  const requiresSerialNumber = Boolean(selectedPolicy?.requiresSerialNumber);

  useEffect(() => {
    setValue('requiresSerialNumber', requiresSerialNumber, { shouldValidate: true });
    if (requiresSerialNumber) {
      setValue('quantity', 1, { shouldValidate: true });
    }
  }, [requiresSerialNumber, setValue]);

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth="md" scroll="body">
      <DialogTitle
        variant="h4"
        className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16"
      >
        Add Manual Warranty
      </DialogTitle>

      <form noValidate onSubmit={handleSubmit(handleFormSubmit, handleValidationError)}>
        <DialogContent className="overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12">
          <IconButton onClick={handleClose} className="absolute block-start-4 inline-end-4" disabled={isSubmitting}>
            <i className="ri-close-line text-textSecondary" />
          </IconButton>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <ProductAutocomplete
                    availableProducts={products}
                    allProducts={products}
                    selectedProduct={products.find(product => String(product?._id) === String(field.value)) || null}
                    onChange={product => {
                      field.onChange(product?._id || '');

                      const productPolicyId = getProductWarrantyPolicyId(product);
                      const hasActivePolicy = policies.some(policy => String(policy?._id) === String(productPolicyId));

                      if (productPolicyId && hasActivePolicy) {
                        setValue('policyId', productPolicyId, { shouldValidate: true });
                      }
                    }}
                    disabled={isSubmitting || optionsLoading}
                    size="medium"
                    label="Product"
                    placeholder={optionsLoading ? 'Loading products...' : 'Select product'}
                    error={!!errors.productId}
                    helperText={errors.productId?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="policyId"
                control={control}
                render={({ field }) => (
                  <SimpleOptionAutocomplete
                    options={policies}
                    value={field.value}
                    onChange={field.onChange}
                    getOptionLabel={policy => policy?.name || policy?.code || ''}
                    getOptionDescription={formatPolicyDescription}
                    label="Warranty policy"
                    placeholder={optionsLoading ? 'Loading policies...' : 'Select warranty policy'}
                    disabled={isSubmitting || optionsLoading}
                    error={!!errors.policyId}
                    helperText={errors.policyId?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <SimpleOptionAutocomplete
                    options={customers}
                    value={field.value}
                    onChange={field.onChange}
                    getOptionLabel={customer => customer?.name || customer?.email || customer?.phone || ''}
                    getOptionDescription={formatCustomerDescription}
                    label="Customer"
                    placeholder={optionsLoading ? 'Loading customers...' : 'Select customer (optional)'}
                    disabled={isSubmitting || optionsLoading}
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message || 'Optional for walk-in/manual warranties'}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Quantity"
                    inputProps={{ min: 1, step: 1 }}
                    disabled={isSubmitting || requiresSerialNumber}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || (requiresSerialNumber ? 'Serialized warranties are issued one unit at a time' : '')}
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="serialNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Serial number"
                    placeholder={requiresSerialNumber ? 'Enter required serial number' : 'Optional serial number'}
                    error={!!errors.serialNumber}
                    helperText={errors.serialNumber?.message || (requiresSerialNumber ? 'Required by selected warranty policy' : '')}
                    required={requiresSerialNumber}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Start date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    minRows={3}
                    label="Notes"
                    placeholder="Optional warranty notes"
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className="gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16">
          <Button onClick={handleClose} color="secondary" variant="outlined" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || optionsLoading} variant="contained">
            {isSubmitting ? 'Saving...' : 'Create Warranty'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddWarrantyDialog;
