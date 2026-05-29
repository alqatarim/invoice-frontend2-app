'use client';

import React from 'react';
import Link from 'next/link';
import { Controller, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  InputAdornment,
  TextField,
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

const Totals = ({
  layout = 'summary',
  control,
  containerSx,
  cardSx,
  actionPanelSx,
  summaryPanelSx,
  actionColumnSize = { xs: 6, md: 6 },
  summaryColumnSize = { xs: 6, md: 6 },
  fixedPosition = true,
  bottom = 16,
  right = 24,
  width = { xs: 'calc(100% - 32px)', md: 'min(520px, calc(100vw - 48px))' },
  maxWidth = 520,
  showTenderFields = false,
  tenderedFieldName,
  tenderedAmount,
  tenderedInputRef,
  onTenderedAmountChange,
  onTenderedKeyDown,
  tenderedLabel = 'Tendered Amount',
  tenderedPlaceholder = 'Cash received',
  tenderedError,
  tenderedHelperText,
  onExactTenderedAmount,
  exactLabel = 'Exact',
  changeAmount,
  changeLabel = 'Change',
  disabled = false,
  showHoldActions = false,
  holdLabel = 'Hold',
  heldLabel = 'Held',
  heldCount = 0,
  onHold,
  onHeld,
  holdDisabled = false,
  heldDisabled = false,
  actionButtons = [],
  primaryActionLabel,
  primaryActionDisabled = false,
  primaryActionColor = 'success',
  primaryActionIcon = 'mdi:check-circle-outline',
  onPrimaryAction,
  renderActionContent,
  handleSubmit,
  handleFormSubmit,
  handleError,
  cancelHref = '/invoices/invoice-list',
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  buttonText,
  isSubmitting = false,
  showActions = true,
  showRoundOff = true,
  amountLabel = 'Amount',
  discountLabel = 'Discount',
  vatLabel = 'VAT',
  totalLabel = 'Total',
  submitColor = 'primary',
  submitIcon = 'mdi:content-save-outline',
  renderExtraActions,
  sticky = false,
  sx,
}) => {
  const theme = useTheme();
  const roundOffValue = useWatch({ control, name: 'roundOffValue' });
  const totalAmount = useWatch({ control, name: 'TotalAmount' });
  const hasRoundOff = showRoundOff && Number(roundOffValue || 0) !== 0;
  const hasSummaryPaymentFields =
    tenderedAmount !== undefined ||
    onTenderedAmountChange ||
    changeAmount !== undefined;

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

  const renderSummary = ({
    withActions = showActions,
    withPaymentFields = hasSummaryPaymentFields,
    cardSx: summaryCardSx,
    resolvedAmountLabel = amountLabel,
  } = {}) => (
    <Card
      variant="outlined"
      sx={{
        borderColor: alpha(theme.palette.primary.main, 0.12),
        overflow: 'visible',
        ...(sticky ? { position: 'sticky', top: 16 } : {}),
        ...summaryCardSx,
      }}
    >
      <CardContent sx={{ px: 2.5, py: 2, '&:last-child': { pb: 2 } }}>
        {withPaymentFields ? (
          <Box className="flex flex-col gap-1.5" sx={{ mb: 2 }}>
            {onTenderedAmountChange ? (
              <TextField
                label={tenderedLabel}
                size="small"
                value={tenderedAmount}
                disabled={disabled}
                onChange={event => onTenderedAmountChange(event.target.value)}
                placeholder="Enter tendered amount"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: theme.palette.secondary.main }}>
                      <Icon icon="lucide:saudi-riyal" width={15} />
                    </InputAdornment>
                  ),
                }}
              />
            ) : null}
            {changeAmount !== undefined ? (
              <TextField
                label={changeLabel}
                size="small"
                value={formatCurrency(changeAmount)}
                disabled={disabled}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: theme.palette.secondary.main }}>
                      <Icon icon="lucide:saudi-riyal" width={15} />
                    </InputAdornment>
                  ),
                }}
              />
            ) : null}
          </Box>
        ) : null}

        <Box className="flex flex-col gap-1.5">
          {renderSummaryRow({ label: resolvedAmountLabel, fieldName: 'taxableAmount' })}
          {renderSummaryRow({ label: discountLabel, fieldName: 'totalDiscount' })}
          {renderSummaryRow({ label: vatLabel, fieldName: 'vat' })}
          {hasRoundOff ? renderSummaryRow({ label: 'Round Off', value: roundOffValue }) : null}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          className="flex justify-between items-center rounded-md px-2 py-1.5 bg-secondaryLightest"
          sx={{ mx: -1.5 }}
        >
          <Typography variant="body1" color="text.primary" lineHeight={1} letterSpacing={0.5} fontSize={15} fontWeight={600}>
            {totalLabel}
          </Typography>
          {renderAmount(totalAmount, 'text.primary', true)}
        </Box>

        {withActions ? (
          <Box className="flex flex-col gap-2 mt-3">
            {renderExtraActions?.()}
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit?.(handleFormSubmit, handleError)}
              color={submitColor}
              startIcon={<Icon icon={submitIcon} width={18} />}
              sx={{ py: 0.85 }}
              disabled={isSubmitting || disabled}
            >
              {buttonText || saveLabel}
            </Button>
            {cancelHref ? (
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
            ) : null}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );

  if (layout !== 'floating') {
    return renderSummary({ cardSx: sx });
  }

  const primaryClickHandler = onPrimaryAction || handleSubmit?.(handleFormSubmit, handleError);
  const resolvedActionButtons = showHoldActions
    ? [
      {
        key: 'hold',
        label: holdLabel,
        variant: 'outlined',
        color: 'warning',
        icon: 'mdi:pause-circle-outline',
        onClick: onHold,
        disabled: disabled || holdDisabled,
      },
      {
        key: 'held',
        label: `${heldLabel} (${heldCount})`,
        variant: 'text',
        icon: 'mdi:history',
        onClick: onHeld,
        disabled: disabled || heldDisabled,
        sx: { whiteSpace: 'nowrap' },
      },
    ]
    : actionButtons;

  const defaultActionContent = (
    <>
      {showTenderFields ? (
        <Box className="flex flex-col gap-1.5">
          {tenderedFieldName ? (
            <Controller
              name={tenderedFieldName}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={tenderedLabel}
                  size="small"
                  value={field.value ?? ''}
                  disabled={disabled}
                  inputRef={tenderedInputRef}
                  onChange={event => {
                    field.onChange(event.target.value);
                    onTenderedAmountChange?.(event.target.value);
                  }}
                  onKeyDown={onTenderedKeyDown}
                  placeholder={tenderedPlaceholder}
                  error={Boolean(tenderedError)}
                  helperText={tenderedHelperText}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: theme.vars?.palette?.text?.secondary || theme.palette.text.secondary }}>
                        <Icon icon="lucide:saudi-riyal" width={15} />
                      </InputAdornment>
                    ),
                    endAdornment: onExactTenderedAmount ? (
                      <CustomButton
                        size="small"
                        variant="tonal"
                        color="primary"
                        onClick={() => onExactTenderedAmount(totalAmount)}
                        disabled={disabled}
                        sx={{ minWidth: 'auto', px: 1.5, py: 1 }}
                      >
                        {exactLabel}
                      </CustomButton>
                    ) : null,
                  }}
                />
              )}
            />
          ) : (
            <TextField
              label={tenderedLabel}
              size="small"
              value={tenderedAmount}
              disabled={disabled}
              inputRef={tenderedInputRef}
              onChange={event => onTenderedAmountChange?.(event.target.value)}
              onKeyDown={onTenderedKeyDown}
              placeholder={tenderedPlaceholder}
              error={Boolean(tenderedError)}
              helperText={tenderedHelperText}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: theme.vars?.palette?.text?.secondary || theme.palette.text.secondary }}>
                    <Icon icon="lucide:saudi-riyal" width={15} />
                  </InputAdornment>
                ),
                endAdornment: onExactTenderedAmount ? (
                  <CustomButton
                    size="small"
                    variant="tonal"
                    color="primary"
                    onClick={() => onExactTenderedAmount(totalAmount)}
                    disabled={disabled}
                    sx={{ minWidth: 'auto', px: 1.5, py: 1 }}
                  >
                    {exactLabel}
                  </CustomButton>
                ) : null,
              }}
            />
          )}
          <TextField
            label={changeLabel}
            size="small"
            value={formatCurrency(changeAmount)}
            disabled={disabled}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start" sx={{ color: theme.vars?.palette?.text?.secondary || theme.palette.text.secondary }}>
                  <Icon icon="lucide:saudi-riyal" width={15} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
        {resolvedActionButtons.length ? (
          <Box className="flex flex-row gap-1.5 items-center">
            {resolvedActionButtons.map(action => (
              <Button
                key={action.key || action.label}
                variant={action.variant || 'outlined'}
                color={action.color || 'primary'}
                size={action.size || 'small'}
                startIcon={action.icon ? <Icon icon={action.icon} width={16} /> : action.startIcon}
                onClick={action.onClick}
                disabled={disabled || action.disabled}
                sx={{ flex: 1, ...action.sx }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        ) : null}
        {primaryActionLabel ? (
          <CustomButton
            fullWidth
            variant="contained"
            color={primaryActionColor}
            startIcon={primaryActionIcon ? <Icon icon={primaryActionIcon} width={18} /> : null}
            onClick={primaryClickHandler}
            disabled={disabled || primaryActionDisabled}
          >
            {primaryActionLabel}
          </CustomButton>
        ) : null}
      </Box>
    </>
  );

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
      <Card sx={{ borderRadius: 2, width: '100%', ml: 'auto', ...cardSx }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
          <Grid container spacing={2} alignItems="stretch" direction={{ xs: 'row-reverse', md: 'row-reverse' }}>
            <Grid size={actionColumnSize}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  ...actionPanelSx,
                }}
              >
                {renderActionContent ? renderActionContent() : defaultActionContent}
              </Box>
            </Grid>
            <Grid size={summaryColumnSize} sx={{ display: 'flex', ...summaryPanelSx }}>
              <Box sx={{ width: '100%', height: '100%', display: 'flex' }}>
                {renderSummary({
                  withActions: false,
                  withPaymentFields: false,
                  resolvedAmountLabel: amountLabel === 'Amount' ? 'Subtotal' : amountLabel,
                  cardSx: { width: '100%', height: '100%', ...sx },
                })}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Totals;
