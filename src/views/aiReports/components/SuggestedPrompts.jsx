'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const SuggestedPrompts = ({
  suggestions = [],
  onSelect = () => {},
  disabled = false,
  variant = 'inline',
}) => {
  if (!suggestions.length) return null;

  const isEmpty = variant === 'empty';

  return (
    <Stack spacing={1.25} alignItems={isEmpty ? 'center' : 'flex-start'}>
      {!isEmpty ? (
        <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600, px: 0.5 }}>
          Suggested questions
        </Typography>
      ) : null}
      <Stack
        direction='row'
        flexWrap='wrap'
        gap={1}
        justifyContent={isEmpty ? 'center' : 'flex-start'}
      >
        {suggestions.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            variant={isEmpty ? 'filled' : 'outlined'}
            clickable
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            sx={{
              maxWidth: isEmpty ? 300 : 400,
              height: 'auto',
              py: 0.75,
              ...(isEmpty
                ? {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 'var(--mui-customShadows-xs)',
                    '&:hover': { bgcolor: 'background.paper' },
                  }
                : {}),
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                lineHeight: 1.45,
                px: 1.25,
              },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default SuggestedPrompts;
