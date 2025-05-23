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
  Box
} from '@mui/material';
import Link from 'next/link';

const InvoiceTotals = ({
  control,
  handleSubmit,
  handleFormSubmit,
  handleError
}) => {
  return (
    <Card>
      <CardContent className='px-4 py-3'>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body1">Amount:</Typography>
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
                  {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                </Typography>
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body1">VAT:</Typography>
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
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6">Total:</Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Controller
              name="TotalAmount"
              control={control}
              render={({ field }) => (
                <Typography variant="h6" color="primary.main">
                  {field.value ? Number(field.value).toFixed(2) : '0.00'}
                </Typography>
              )}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box className='flex flex-row gap-3 justify-between mt-3'>
          <Button
            variant="outlined"
            color="secondary"
            component={Link}
            href="/invoices/invoice-list"
          >
            Cancel
          </Button>
          <Button
            className='flex-1'
            variant="contained"
            onClick={handleSubmit(handleFormSubmit, handleError)}
            color="primary"
          >
            Save
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceTotals;