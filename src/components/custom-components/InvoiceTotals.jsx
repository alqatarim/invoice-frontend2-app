'use client';

import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Button,
  Box
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const InvoiceTotals = ({
  control,
  handleSubmit,
  handleFormSubmit,
  handleError,
  cancelHref = '/invoices/invoice-list',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  buttonText,
  isSubmitting = false,
}) => {
  const theme = useTheme();
  const roundOffValue = useWatch({ control, name: 'roundOffValue' });
  const showRoundOff = Number(roundOffValue || 0) !== 0;

  const SummaryRow = ({ label, fieldName, isBold }) => (
    <Box className="flex justify-between items-center" sx={{ py: 0.4 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem' }}>
        {label}
      </Typography>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <Typography
            variant="body2"
            fontWeight={isBold ? 600 : 500}
            sx={{ fontSize: '0.84rem' }}
          >
            {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
          </Typography>
        )}
      />
    </Box>
  );

  const resolvedSaveLabel = buttonText || saveLabel;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: alpha(theme.palette.primary.main, 0.12),
        borderTop: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ px: 2.5, py: 2, '&:last-child': { pb: 2 } }}>
        {/* Summary rows */}
        <Box className="flex flex-col" sx={{ gap: 0.25 }}>
          <SummaryRow label="Amount" fieldName="taxableAmount" />
          <SummaryRow label="Discount" fieldName="totalDiscount" />
          <SummaryRow label="VAT" fieldName="vat" />
          {showRoundOff && (
            <Box className="flex justify-between items-center" sx={{ py: 0.4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem' }}>
                Round Off
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.84rem' }}>
                {Number(roundOffValue || 0).toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1.25 }} />

        {/* Total row with highlighted background */}
        <Box
          className="flex justify-between items-center"
          sx={{
            py: 0.75,
            px: 1.25,
            mx: -0.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Total
          </Typography>
          <Controller
            name="TotalAmount"
            control={control}
            render={({ field }) => (
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                {field.value ? Number(field.value).toFixed(2) : '0.00'}
              </Typography>
            )}
          />
        </Box>

        {/* Action Buttons */}
        <Box className='flex flex-col gap-2 mt-3'>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit(handleFormSubmit, handleError)}
            color="primary"
            startIcon={<Icon icon="mdi:content-save-outline" width={18} />}
            sx={{ py: 0.85 }}
            disabled={isSubmitting}
          >
            {resolvedSaveLabel}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            component={Link}
            href={cancelHref}
            size="small"
            sx={{ py: 0.55 }}
          >
            {cancelLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceTotals;