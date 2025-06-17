'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Button,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';
import Link from 'next/link';

const DebitNoteTotals = ({
  control,
  handleSubmit,
  handleFormSubmit,
  handleError
}) => {
  return (
    <Card>
      <CardContent className='px-4 py-3'>
        <Typography variant='h6' className='font-semibold text-textSecondary mb-3'>
          Summary
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body1">Subtotal:</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Controller
              name="taxableAmount"
              control={control}
              render={({ field }) => (
                <Typography variant="body1" fontWeight="medium">
                  {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                </Typography>
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body1">Discount:</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Controller
              name="totalDiscount"
              control={control}
              render={({ field }) => (
                <Typography variant="body1" fontWeight="medium">
                  -{isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                </Typography>
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body1">Tax (VAT):</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Controller
              name="vat"
              control={control}
              render={({ field }) => (
                <Typography variant="body1" fontWeight="medium">
                  {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                </Typography>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Controller
                  name="roundOff"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checked={field.value}
                      size="small"
                    />
                  )}
                />
              }
              label="Round Off"
              sx={{ mt: 1, mb: 1 }}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body1">Round Off:</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Controller
              name="roundOffValue"
              control={control}
              render={({ field }) => (
                <Typography variant="body1" fontWeight="medium">
                  {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                </Typography>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" className="font-semibold">Total:</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Controller
              name="TotalAmount"
              control={control}
              render={({ field }) => (
                <Typography variant="h6" color="primary.main" className="font-semibold">
                  {field.value ? Number(field.value).toFixed(2) : '0.00'}
                </Typography>
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DebitNoteTotals;