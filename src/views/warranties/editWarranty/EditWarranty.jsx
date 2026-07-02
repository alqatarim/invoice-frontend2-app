'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Icon } from '@iconify/react';
import PageIconHeader from '@components/headers/PageIconHeader';
import { warrantyDurationUnitOptions, warrantyStatusOptions } from '@/data/dataSets';
import useEditWarrantyHandler, { getSourceDisplay } from './handler';
import Overview from './tabs/Overview';
import Policy from './tabs/Policy';
import Claims from './tabs/Claims';
import Timeline from './tabs/Timeline';

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

export default function EditWarranty({ warranty, initialErrorMessage = '' }) {
  const controller = useEditWarrantyHandler({ warranty, initialErrorMessage });
  const {
    actionDisabled,
    activeTab,
    canExtend,
    canUpdateWarranty,
    claims,
    closeExtendDialog,
    closeVoidDialog,
    events,
    extendOpen,
    extension,
    extensions,
    handleExtend,
    handleVoid,
    isPermissionsReady,
    openExtendDialog,
    openVoidDialog,
    saving,
    setActiveTab,
    setVoidReason,
    status,
    updateExtensionField,
    voidOpen,
    voidReason,
  } = controller;

  const statusOption = warrantyStatusOptions.find(option => option.value === status);
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
      return { color: 'error', text: 'text-error', value: 'Ended', unit: 'Coverage period has elapsed' };
    }

    const tone = remainingDays <= 30
      ? { color: 'warning', text: 'warning.darkest' }
      : { color: 'info', text: 'info.darkest' };

    return { ...tone, value: remainingDays, unit: `day${remainingDays === 1 ? '' : 's'} remaining` };
  }, [remainingDays]);

  if (!isPermissionsReady) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!canUpdateWarranty) {
    return null;
  }

  if (!warranty) {
    return <Alert severity="error">{initialErrorMessage || 'Warranty not found.'}</Alert>;
  }

  return (
    <div className="flex flex-col gap-3">
      <PageIconHeader title='Edit Warranty' icon="mdi:shield-edit-outline" iconSize={30} />

      <Box className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Box className="w-full min-w-[275px] max-w-[500px]">
          <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h6" color={coverage.text} className='font-semibold leading-none'>
                {coverage.value}
              </Typography>
              <Typography variant="body2">
                {coverage.unit}
              </Typography>
            </Stack>
          </Stack>

          <Grid container className="items-center flex justify-start gap-2">
            <Grid size={{ xs: 12, sm: 6, md: 7 }}>
              <LinearProgress
                variant="determinate"
                color={coverage.color}
                value={coverageProgress}
                className="!h-2 rounded-full"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 'auto' }}>
              <Typography variant="body1.5" className='text-center'>
                {formatDate(warranty.endDate)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" className="self-end md:ml-auto">
          <Chip
            size="small"
            variant="tonal"
            color={statusOption?.color || 'default'}
            label={statusOption?.label || status.replace(/_/g, ' ')}
          />
          <Button size='small' disabled={actionDisabled || saving} color="error" variant="outlined" onClick={openVoidDialog}>Void</Button>
          <Button size='small' disabled={!canExtend || saving} variant="contained" onClick={openExtendDialog}>Extend</Button>
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

      <Dialog open={voidOpen} onClose={closeVoidDialog} fullWidth maxWidth="sm">
        <DialogTitle>Void Warranty</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline minRows={3} label="Reason" value={voidReason} onChange={event => setVoidReason(event.target.value)} className="mt-1" />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVoidDialog} color="secondary" variant="tonal">Cancel</Button>
          <Button onClick={handleVoid} disabled={saving} color="error" variant="contained">Void Warranty</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={extendOpen} onClose={closeExtendDialog} fullWidth maxWidth="sm">
        <DialogTitle className='text-center'>Extend Warranty</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="pt-1">
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth type="number" label="Duration value" value={extension.value} onChange={updateExtensionField('value')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Duration unit</InputLabel>
                <Select label="Duration unit" value={extension.unit} onChange={updateExtensionField('unit')}>
                  {warrantyDurationUnitOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <TextField fullWidth multiline minRows={3} label="Reason" value={extension.reason} onChange={updateExtensionField('reason')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeExtendDialog} color="secondary" variant="tonal">Cancel</Button>
          <Button onClick={handleExtend} disabled={saving} variant="contained">Extend</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
