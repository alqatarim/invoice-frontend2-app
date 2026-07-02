'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useColorScheme, useTheme } from '@mui/material/styles';

import { buildChartConfig } from '../charts/chartAdapters';
import { getChartHeight } from '../charts/chartUtils';

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), {
  ssr: false,
  loading: () => <Skeleton variant='rounded' height={280} />,
});

const ChartBlock = ({ spec = {}, rows = [] }) => {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const currentMode = (mode === 'system' ? systemMode : mode) || 'light';

  const themeColors = useMemo(
    () => ({
      primary: theme.palette.primary.main,
      primaryLight: theme.palette.primary.light,
      secondary: theme.palette.info.main,
      tertiary: theme.palette.success.main,
      quaternary: theme.palette.warning.main,
    }),
    [theme.palette]
  );

  const chartConfig = useMemo(
    () => buildChartConfig({ spec, rows, themeColors }),
    [spec, rows, themeColors]
  );

  const chartHeight = useMemo(
    () => getChartHeight({ spec, rowCount: rows.length }),
    [spec, rows.length]
  );

  if (!rows.length) {
    return (
      <Typography variant='body2' color='text.secondary'>
        No chart data available.
      </Typography>
    );
  }

  return (
    <Card variant='outlined' sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {spec?.title ? (
          <Typography variant='subtitle1' sx={{ mb: 1.5, fontWeight: 700 }}>
            {spec.title}
          </Typography>
        ) : null}
        <Box sx={{ mx: -0.5 }}>
          <AppReactApexCharts
            type={chartConfig.type}
            height={chartHeight}
            width='100%'
            options={{
              ...chartConfig.options,
              theme: { mode: currentMode },
            }}
            series={chartConfig.series}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartBlock;
