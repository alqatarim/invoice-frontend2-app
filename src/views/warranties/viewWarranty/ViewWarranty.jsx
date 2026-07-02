'use client';

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import PageIconHeader from '@components/headers/PageIconHeader';
import { warrantyStatusOptions } from '@/data/dataSets';
import Overview from './tabs/Overview';
import Policy from './tabs/Policy';
import Claims from './tabs/Claims';
import Timeline from './tabs/Timeline';
import { Icon } from '@iconify/react';
const TAB_PANEL_MIN_HEIGHT = 440;

const formatDate = value => (value ? dayjs(value).format('DD MMM YYYY') : 'N/A');

const getCoverageProgress = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const totalDays = end.diff(start, 'day');

  if (totalDays <= 0) return 100;

  const elapsedDays = dayjs().diff(start, 'day');

  if (elapsedDays <= 0) return 0;
  if (elapsedDays >= totalDays) return 100;

  return Math.round((elapsedDays / totalDays) * 100);
};

const getCoverageRemainingDays = endDate => {
  if (!endDate) return 0;

  return Math.max(dayjs(endDate).diff(dayjs(), 'day'), 0);
};

const getSourceDisplay = warranty => {
  const sourceType = warranty?.sourceDocumentType || warranty?.source || 'manual';
  if (sourceType === 'replacement') return 'Replacement';
  if (sourceType === 'invoice' || sourceType === 'receipt') return warranty?.sourceDocumentId?.invoiceNumber || 'N/A';
  return 'Manual';
};

export default function ViewWarranty({ warranty, initialErrorMessage = '' }) {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  const status = warranty?.effectiveStatus || warranty?.status || 'active';
  const statusOption = warrantyStatusOptions.find(option => option.value === status);
  const claims = warranty?.claims || [];
  const events = warranty?.events || [];
  const extensions = warranty?.extensions || [];

  const coverageProgress = useMemo(
    () => getCoverageProgress(warranty?.startDate, warranty?.endDate),
    [warranty?.endDate, warranty?.startDate]
  );
  const remainingDays = useMemo(
    () => getCoverageRemainingDays(warranty?.endDate),
    [warranty?.endDate]
  );
  const coverage = useMemo(() => {
    if (remainingDays <= 0) {
      return { color: 'error', text: 'text-error', bg: 'bg-errorLightest', border: 'border-errorLighter', value: 'Ended', unit: 'Coverage period has elapsed' };
    }
    const tone = remainingDays <= 30
      ? { color: 'warning', text: 'warning.darkest', bg: 'bg-warningLightest', border: 'border-warningLighter' }
      : { color: 'info', text: 'info.darkest', bg: 'bg-infoLightest', border: 'border-infoLighter' };

    return { ...tone, value: remainingDays, unit: `day${remainingDays === 1 ? '' : 's'} remaining` };
  }, [remainingDays]);

  if (!warranty) {
    return <Alert severity="error">{initialErrorMessage || 'Warranty not found.'}</Alert>;
  }

  return (
    <div className="flex flex-col gap-3">
      <PageIconHeader title='Warranty' icon="mdi:shield-star-outline" iconSize={30} />

      <Box className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Box className="w-full min-w-[275px] max-w-[400px] space-y-1">

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h6" color={coverage.text} className='font-semibold leading-none'>
                {coverage.value}
              </Typography>
              <Typography variant="body1.5" fontWeight={450}>
                {coverage.unit}
              </Typography>
            </Stack>
            <Typography variant="body1.5" fontWeight={450}>
              {formatDate(warranty.endDate)}
            </Typography>

          </Stack>


          <LinearProgress
            variant="determinate"
            color={coverage.color}
            value={coverageProgress}
            className="!h-2 rounded-full"
          />



        </Box>

        <Stack direction="row" spacing={2} alignItems="center" className="self-end md:ml-auto">
          <Chip
            size="small"
            variant="tonal"
            color={statusOption?.color || 'default'}
            label={statusOption?.label || status.replace(/_/g, ' ')}
          />
        </Stack>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_event, value) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Icon icon="mdi:information-slab-circle-outline" />} iconPosition="start" label="Overview" />
        <Tab icon={<Icon icon="ri-file-list-3-line" />} iconPosition="start" label="Policy" />
        <Tab icon={<Icon icon="mdi:shield-alert-outline" />} iconPosition="start" label="Claims" />
        <Tab icon={<Icon icon="mdi:timeline-clock-outline" />} iconPosition="start" label="Timeline" />
      </Tabs>

      <Box>
        <Box role="tabpanel" hidden={activeTab !== 0} sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
          <Overview
            warranty={warranty}
            formatDate={formatDate}
            getSourceDisplay={getSourceDisplay}
            minHeight={TAB_PANEL_MIN_HEIGHT}
          />
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 1} sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
          <Policy warranty={warranty} minHeight={TAB_PANEL_MIN_HEIGHT} />
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 2} sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
          <Claims claims={claims} minHeight={TAB_PANEL_MIN_HEIGHT} />
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 3} sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
          <Timeline events={events} extensions={extensions} formatDate={formatDate} minHeight={TAB_PANEL_MIN_HEIGHT} />
        </Box>
      </Box>
    </div >
  );
}
