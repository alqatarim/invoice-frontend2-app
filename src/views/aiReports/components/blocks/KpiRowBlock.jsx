'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { formatCurrency } from '@/views/accounting/utils';

const ACCENT_COLORS = ['primary', 'info', 'success', 'warning'];

const formatValue = (item = {}) => {
  const value = item.value;
  if (item.format === 'currency') return `SAR ${formatCurrency(value)}`;
  if (item.format === 'percent') return `${Number(value || 0).toFixed(1)}%`;
  if (item.format === 'number') return Number(value || 0).toLocaleString();
  return String(value ?? '-');
};

const KpiRowBlock = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <Grid container spacing={2}>
      {items.map((item, index) => {
        const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
        return (
          <Grid key={`${item.label}-${index}`} size={{ xs: 12, sm: 6, md: items.length <= 3 ? 4 : 3 }}>
            <Card
              variant='outlined'
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  bgcolor: `${accent}.main`,
                },
              }}
            >
              <CardContent sx={{ pt: 2.5 }}>
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                  {item.label}
                </Typography>
                <Typography variant='h5' sx={{ mt: 0.75, fontWeight: 700, lineHeight: 1.2 }}>
                  {formatValue(item)}
                </Typography>
                {item.sub ? (
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                    {item.sub}
                  </Typography>
                ) : null}
                {item.delta !== undefined && item.delta !== null ? (
                  <Box sx={{ mt: 0.75 }}>
                    <Typography
                      variant='caption'
                      sx={{ fontWeight: 600 }}
                      color={Number(item.delta) >= 0 ? 'success.main' : 'error.main'}
                    >
                      {Number(item.delta) >= 0 ? '+' : ''}
                      {Number(item.delta).toFixed(1)}% {item.deltaLabel || ''}
                    </Typography>
                  </Box>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default KpiRowBlock;
