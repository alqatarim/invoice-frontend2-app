'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

const expandShortHex = (hex) => (
  /^#[0-9a-f]{3}$/i.test(hex)
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex
);

const normalizeHex = (value, fallback = '#ffffff') => {
  const normalized = String(value || '').trim().toLowerCase();

  if (/^#[0-9a-f]{3}$/i.test(normalized)) return expandShortHex(normalized);
  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;

  return fallback;
};

const isValidHex = (value) => /^#[0-9a-f]{6}$/i.test(value);

const ColorSwatchPicker = ({
  value,
  fallbackValue = '#ffffff',
  manual = false,
  disabled = false,
  size = 20,
  tooltipTitle,
  onApply,
  onClear,
  adornmentSx = {},
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [draftHex, setDraftHex] = useState('#ffffff');
  const swatchColor = normalizeHex(value || fallbackValue);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    if (disabled) return;

    setDraftHex(swatchColor);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDraftHex(swatchColor);
  };

  const handleApply = () => {
    if (!isValidHex(draftHex)) return;

    onApply?.(draftHex.toLowerCase());
    setAnchorEl(null);
  };

  return (
    <InputAdornment position='start' sx={{ ml: -0.5, mr: 0.5, ...adornmentSx }}>
      <Tooltip
        title={
          tooltipTitle ||
          (manual ? `Picked: ${value} (right-click to auto-match label)` : 'Pick a color')
        }
        arrow
      >
        <Box
          component='span'
          role='button'
          tabIndex={disabled ? -1 : 0}
          onClick={handleOpen}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOpen(event);
            }
          }}
          onContextMenu={(event) => {
            if (manual && onClear) {
              event.preventDefault();
              onClear();
            }
          }}
          sx={{
            width: size,
            height: size,
            borderRadius: '5px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: swatchColor,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: manual ? '0 0 0 2px' : 'none',
            color: 'primary.main',
            opacity: disabled ? 0.6 : 1,
          }}
        />
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Stack spacing={2} sx={{ width: 240, p: 2 }}>
          <Typography variant='subtitle2' fontWeight={600}>
            Select Color
          </Typography>
          <Box
            component='input'
            type='color'
            value={isValidHex(draftHex) ? draftHex : '#ffffff'}
            onChange={(event) => setDraftHex(event.target.value)}
            sx={{
              width: '100%',
              height: 80,
              cursor: 'pointer',
              border: 0,
              p: 0,
              backgroundColor: 'transparent',
            }}
          />
          <TextField
            size='small'
            label='Hex'
            value={draftHex}
            error={!isValidHex(draftHex)}
            onChange={(event) => setDraftHex(event.target.value.trim())}
          />
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button size='small' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
            <Button size='small' variant='contained' onClick={handleApply} disabled={!isValidHex(draftHex)}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </InputAdornment>
  );
};

export default ColorSwatchPicker;
