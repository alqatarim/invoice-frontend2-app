'use client';

import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

import { CustomButton } from '@/components/buttons';
import { RiyalIcon } from '@/utils/currencyUtils';

const formatCurrency = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
};

const getThemeTextColor = theme => theme.vars?.palette?.text?.primary || theme.palette.text.primary;

const TotalsTwo = ({
  layout = 'summary',
  control,
  containerSx,
  cardSx,
  fixedPosition = true,
  bottom = 16,
  right = 24,
  width = { xs: 'calc(100% - 32px)', sm: 360 },
  maxWidth = 275,
  disabled = false,
  primaryActionLabel,
  primaryActionDisabled = false,
  primaryActionColor = 'success',
  primaryActionIcon = 'mdi:check-circle-outline',
  onPrimaryAction,
  handleSubmit,
  handleFormSubmit,
  handleError,
  saveLabel = 'Save',
  buttonText,
  isSubmitting = false,
  showActions = true,
  showRoundOff = true,
  subtotalLabel = 'Subtotal',
  discountLabel = 'Discount',
  vatLabel = 'VAT',
  totalLabel = 'Total',
  renderExtraActions,
  sticky = false,
  sx,
}) => {
  const theme = useTheme();
  const roundOffValue = useWatch({ control, name: 'roundOffValue' });
  const totalAmount = useWatch({ control, name: 'TotalAmount' });
  const hasRoundOff = showRoundOff && Number(roundOffValue || 0) !== 0;
  const primaryClickHandler = onPrimaryAction || handleSubmit?.(handleFormSubmit, handleError);

  const renderAmount = (value, color = 'text.primary', strong = false) => (
    <Box className="flex justify-end items-end gap-0.5">
      <RiyalIcon width={12} color={getThemeTextColor(theme)} />
      <Typography
        variant="body1"
        color={color}
        lineHeight={1}
        fontSize={15}
        fontWeight={strong ? 600 : 500}
      >
        {formatCurrency(value)}
      </Typography>
    </Box>
  );

  const renderSummaryRow = ({ label, fieldName, value, strong = false }) => (
    <Box className="flex justify-between items-center">
      <Typography
        variant="body1"
        fontSize={14}
        fontWeight={strong ? 600 : 500}
        letterSpacing={0.5}
        color="text.secondary"
      >
        {label}
      </Typography>
      {fieldName ? (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => renderAmount(field.value, 'text.primary', strong)}
        />
      ) : (
        renderAmount(value, 'text.primary', strong)
      )}
    </Box>
  );

  const renderSummaryContent = () => (
    <>
      <Box
        className="flex flex-col gap-1.5"
        sx={{
          p: 1.75,
          borderRadius: 1.5,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.88),
        }}
      >
        {renderSummaryRow({ label: subtotalLabel, fieldName: 'taxableAmount' })}
        {renderSummaryRow({ label: discountLabel, fieldName: 'totalDiscount' })}
        {renderSummaryRow({ label: vatLabel, fieldName: 'vat' })}
        {hasRoundOff ? renderSummaryRow({ label: 'Round Off', value: roundOffValue }) : null}

        <Divider sx={{ my: 1 }} />

        <Box
          className="flex justify-between items-center rounded-md px-2 py-1.5 bg-secondaryLightest"
          sx={{ mx: -0.75 }}
        >
          <Typography variant="body1" color="text.primary" lineHeight={1} letterSpacing={0.5} fontSize={15} fontWeight={600}>
            {totalLabel}
          </Typography>
          {renderAmount(totalAmount, 'text.primary', true)}
        </Box>
      </Box>

      {showActions ? (
        <Box className="flex flex-col gap-2 mt-3">
          {renderExtraActions?.()}
          <CustomButton
            fullWidth
            variant="contained"
            color={primaryActionColor}
            startIcon={primaryActionIcon ? <Icon icon={primaryActionIcon} width={18} /> : null}
            onClick={primaryClickHandler}
            disabled={disabled || isSubmitting || primaryActionDisabled}
            sx={{ py: 1 }}
          >
            {primaryActionLabel || buttonText || saveLabel}
          </CustomButton>
        </Box>
      ) : null}
    </>
  );

  const renderSummary = (summaryCardSx) => (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'visible',
        ...(sticky ? { position: 'sticky', top: 16 } : {}),
        ...summaryCardSx,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {renderSummaryContent()}
      </CardContent>
    </Card>
  );

  if (layout !== 'floating') {
    return renderSummary(sx);
  }

  return (
    <Box
      sx={{
        ...(fixedPosition ? { position: 'fixed', bottom, right } : {}),
        zIndex: theme.zIndex.appBar + 1,
        width,
        maxWidth,
        ...containerSx,
      }}
    >
      {renderSummary({ width: '100%', ml: 'auto', ...cardSx, ...sx })}
    </Box>
  );
};

export default TotalsTwo;
