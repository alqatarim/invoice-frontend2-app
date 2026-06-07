'use client';

import dayjs from 'dayjs';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Stack, TextField } from '@mui/material';

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';

const DEFAULT_PORTAL_ID = 'custom-datepicker-portal';
const DEFAULT_EMPTY_LABEL_RANGE = 'DD/MM/YYYY - DD/MM/YYYY';
const DEFAULT_EMPTY_LABEL_SINGLE = 'DD/MM/YYYY';

const toDateValue = value => {
  if (!value) return null;

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.toDate() : null;
};

export const formatCustomDateRangeLabel = (
  from,
  to,
  { partialEndSuffix = '...' } = {}
) => {
  const start = from ? dayjs(from) : null;
  const end = to ? dayjs(to) : null;

  if (start?.isValid() && end?.isValid()) {
    return `${start.format('DD MMM YYYY')} - ${end.format('DD MMM YYYY')}`;
  }

  if (start?.isValid()) {
    return `${start.format('DD MMM YYYY')} - ${partialEndSuffix}`;
  }

  return '';
};

export const formatCustomSingleDateLabel = value => {
  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('DD MMM YYYY') : '';
};

const CustomDateInput = forwardRef(function CustomDateInput(
  {
    displayValue,
    label,
    size = 'small',
    disabled,
    onClick,
    value: _datepickerValue,
    onChange: _datepickerOnChange,
    onBlur,
    ...rest
  },
  ref
) {
  return (
    <TextField
      {...rest}
      fullWidth
      size={size}
      label={label}
      value={displayValue || ''}
      onClick={onClick}
      onBlur={onBlur}
      inputRef={ref}
      disabled={disabled}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        readOnly: true,
      }}
    />
  );
});

const CustomDatePicker = ({
  mode = 'range',
  startDate = '',
  endDate = '',
  value = '',
  onStartDateChange,
  onEndDateChange,
  onChange,
  onApply,
  onReset,
  commitOnApply = false,
  hasActiveSelection = false,
  emptyLabel = mode === 'range' ? DEFAULT_EMPTY_LABEL_RANGE : DEFAULT_EMPTY_LABEL_SINGLE,
  label,
  disabled = false,
  size = 'small',
  portalId = DEFAULT_PORTAL_ID,
  popperPlacement = 'bottom-start',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [pendingRange, setPendingRange] = useState(() => ({
    fromDate: toDateValue(startDate),
    toDate: toDateValue(endDate),
  }));

  const isRangeMode = mode === 'range';

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let node = document.getElementById(portalId);

    if (!node) {
      node = document.createElement('div');
      node.id = portalId;
      node.style.position = 'relative';
      node.style.zIndex = '1500';
      document.body.appendChild(node);
    }
  }, [portalId]);

  useEffect(() => {
    if (!commitOnApply || isOpen) return;

    setPendingRange({
      fromDate: toDateValue(startDate),
      toDate: toDateValue(endDate),
    });
  }, [commitOnApply, endDate, isOpen, startDate]);

  const resolvedLabel = label || (isRangeMode ? 'Date Range' : 'Date');

  const rangeStart = commitOnApply ? pendingRange.fromDate : toDateValue(startDate);
  const rangeEnd = commitOnApply ? pendingRange.toDate : toDateValue(endDate);
  const singleSelected = toDateValue(value);

  const displayLabel = useMemo(() => {
    if (!isRangeMode) {
      return formatCustomSingleDateLabel(value) || emptyLabel;
    }

    if (commitOnApply && isOpen) {
      const formatted = formatCustomDateRangeLabel(
        pendingRange.fromDate,
        pendingRange.toDate
      );

      return formatted || '';
    }

    const formatted = formatCustomDateRangeLabel(startDate, endDate);

    return formatted || emptyLabel;
  }, [
    commitOnApply,
    emptyLabel,
    endDate,
    isOpen,
    isRangeMode,
    pendingRange,
    startDate,
    value,
  ]);

  const canApply =
    commitOnApply &&
    Boolean(pendingRange.fromDate && pendingRange.toDate) &&
    (dayjs(pendingRange.fromDate).format('YYYY-MM-DD') !== startDate ||
      dayjs(pendingRange.toDate).format('YYYY-MM-DD') !== endDate);

  const canReset =
    commitOnApply &&
    (hasActiveSelection || Boolean(pendingRange.fromDate || pendingRange.toDate));

  const handleApply = async () => {
    if (!pendingRange.fromDate || !pendingRange.toDate) return;

    const nextStartDate = dayjs(pendingRange.fromDate).format('YYYY-MM-DD');
    const nextEndDate = dayjs(pendingRange.toDate).format('YYYY-MM-DD');

    const success = await onApply?.({
      startDate: nextStartDate,
      endDate: nextEndDate,
      fromDate: nextStartDate,
      toDate: nextEndDate,
    });

    if (success !== false) {
      setIsOpen(false);
    }
  };

  const handleReset = async () => {
    if (hasActiveSelection) {
      await onReset?.();
      setIsOpen(false);
      return;
    }

    setPendingRange({
      fromDate: null,
      toDate: null,
    });
  };

  const sharedInputProps = {
    displayValue: displayLabel,
    label: resolvedLabel,
    size,
    disabled,
  };

  const sharedPickerProps = {
    open: isOpen,
    onInputClick: () => {
      if (!disabled) setIsOpen(true);
    },
    onClickOutside: () => setIsOpen(false),
    onCalendarOpen: () => setIsOpen(true),
    onCalendarClose: () => setIsOpen(false),
    disabled,
    dateFormat: 'dd/MM/yyyy',
    popperPlacement,
    popperProps: {
      strategy: 'fixed',
    },
    portalId,
  };

  const footerActions = commitOnApply ? (
    <Box>
      <Divider />

      <Stack direction='row' spacing={1.5} justifyContent='flex-end' sx={{ p: 3 }}>
        <Button
          variant='text'
          color='secondary'
          onClick={handleReset}
          disabled={disabled || !canReset}
        >
          Reset
        </Button>

        <Button variant='contained' onClick={handleApply} disabled={disabled || !canApply}>
          Apply
        </Button>
      </Stack>
    </Box>
  ) : null;

  if (!isRangeMode) {
    return (
      <Box sx={{ width: '100%' }}>
        <AppReactDatepicker
          selected={singleSelected}
          onChange={date => {
            onChange?.(date ? dayjs(date).format('YYYY-MM-DD') : '');
            setIsOpen(false);
          }}
          {...sharedPickerProps}
          customInput={<CustomDateInput {...sharedInputProps} />}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <AppReactDatepicker
        selectsRange
        startDate={rangeStart}
        endDate={rangeEnd}
        selected={rangeStart}
        onChange={dates => {
          const [start, end] = Array.isArray(dates) ? dates : [null, null];

          if (commitOnApply) {
            setPendingRange({
              fromDate: start,
              toDate: end,
            });

            return;
          }

          onStartDateChange?.(start ? dayjs(start).format('YYYY-MM-DD') : '');
          onEndDateChange?.(end ? dayjs(end).format('YYYY-MM-DD') : '');
        }}
        shouldCloseOnSelect={false}
        {...sharedPickerProps}
        customInput={<CustomDateInput {...sharedInputProps} />}
      >
        {footerActions}
      </AppReactDatepicker>
    </Box>
  );
};

export default CustomDatePicker;
