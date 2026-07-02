'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import CustomIconButton from '@core/components/mui/IconButton';

const CHAT_BG = 'var(--mui-palette-customColors-chatBg)';

const ChatInput = ({ onSend = () => {}, disabled = false, inputRef }) => {
  const theme = useTheme();
  const isBelowSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const endAdornment = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {!isBelowSmScreen ? (
        <>
          <IconButton size='small' disabled={disabled} aria-label='Suggested prompts'>
            <i className='ri-lightbulb-line text-textPrimary' />
          </IconButton>
          <IconButton size='small' disabled={disabled} aria-label='Attach data'>
            <i className='ri-attachment-2-line text-textPrimary' />
          </IconButton>
        </>
      ) : null}
      {isBelowSmScreen ? (
        <CustomIconButton variant='contained' color='primary' type='submit' disabled={disabled || !value.trim()}>
          <i className='ri-send-plane-line' />
        </CustomIconButton>
      ) : (
        <Button
          variant='contained'
          color='primary'
          type='submit'
          disabled={disabled || !value.trim()}
          endIcon={<i className='ri-send-plane-line' />}
        >
          Send
        </Button>
      )}
    </Box>
  );

  return (
    <Box
      component='form'
      autoComplete='off'
      onSubmit={handleSubmit}
      sx={{ bgcolor: CHAT_BG }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        size='small'
        placeholder='Type a message'
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        inputRef={inputRef}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event);
          }
        }}
        slotProps={{ input: { endAdornment } }}
        sx={{
          p: { xs: 2, sm: 2.5 },
          '& fieldset': { border: 0 },
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            boxShadow: 'var(--mui-customShadows-xs)',
          },
        }}
      />
    </Box>
  );
};

export default ChatInput;
