'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';

const DeliveryChallanTotals = ({ control, handleSubmit, handleFormSubmit, handleError }) => {
  const theme = useTheme();

  return (
    <Card className="sticky top-4">
      <CardContent className="flex flex-col gap-4">
        {/* Header */}
        <Box className="flex flex-row gap-1.5 items-center">
          <Box className="w-2 h-8 bg-secondaryLight rounded-md" />
          <Typography variant="caption" fontWeight={500} fontSize="1rem">
            Totals
          </Typography>
        </Box>

        {/* Totals Section */}
        <Box className="flex flex-col gap-3">
          {/* Taxable Amount */}
          <Box className="flex flex-row items-center justify-between">
            <Typography variant="body2" color="text.secondary">
              Taxable Amount
            </Typography>
            <Controller
              name="taxableAmount"
              control={control}
              render={({ field }) => (
                <Box className="flex flex-row items-center gap-0.5">
                  <Icon icon="lucide:saudi-riyal" width={16} color={theme.vars.palette.text.secondary} />
                  <Typography variant="body2" fontWeight={500}>
                    {Number(field.value || 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            />
          </Box>

          {/* Total Discount */}
          <Box className="flex flex-row items-center justify-between">
            <Typography variant="body2" color="text.secondary">
              Total Discount
            </Typography>
            <Controller
              name="totalDiscount"
              control={control}
              render={({ field }) => (
                <Box className="flex flex-row items-center gap-0.5">
                  <Icon icon="lucide:saudi-riyal" width={16} color={theme.vars.palette.text.secondary} />
                  <Typography variant="body2" fontWeight={500}>
                    {Number(field.value || 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            />
          </Box>

          {/* VAT */}
          <Box className="flex flex-row items-center justify-between">
            <Typography variant="body2" color="text.secondary">
              VAT
            </Typography>
            <Controller
              name="vat"
              control={control}
              render={({ field }) => (
                <Box className="flex flex-row items-center gap-0.5">
                  <Icon icon="lucide:saudi-riyal" width={16} color={theme.vars.palette.text.secondary} />
                  <Typography variant="body2" fontWeight={500}>
                    {Number(field.value || 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            />
          </Box>

          {/* Round Off Checkbox */}
          <Controller
            name="roundOff"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value || false}
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Round Off
                  </Typography>
                }
                sx={{ mx: 0 }}
              />
            )}
          />

          <Divider sx={{ my: 1 }} />

          {/* Total Amount */}
          <Box className="flex flex-row items-center justify-between">
            <Typography variant="h6" color="primary.main">
              Total Amount
            </Typography>
            <Controller
              name="TotalAmount"
              control={control}
              render={({ field }) => (
                <Box className="flex flex-row items-center gap-1">
                  <Icon icon="lucide:saudi-riyal" width={20} color={theme.vars.palette.primary.main} />
                  <Typography variant="h6" color="primary.main" fontWeight={600}>
                    {Number(field.value || 0).toFixed(2)}
                  </Typography>
                </Box>
              )}
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box className="flex flex-col gap-2 mt-4">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSubmit(handleFormSubmit, handleError)}
            startIcon={<Icon icon="mdi:content-save" width={20} />}
          >
            Update Delivery Challan
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="medium"
            href="/deliveryChallans/deliveryChallans-list"
          >
            Cancel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DeliveryChallanTotals; 