'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { updateWarrantyClaim } from '@/app/(dashboard)/claims/actions';
import {
  warrantyClaimServiceOutcomeOptions,
  warrantyClaimStatusOptions,
} from '@/data/dataSets';

const formatDate = value => (value ? dayjs(value).format('DD MMM YYYY') : 'N/A');

export default function ViewClaim({ claim, initialErrorMessage = '' }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    status: claim?.status || 'submitted',
    serviceOutcome: claim?.serviceOutcome || 'pending',
    internalNotes: claim?.internalNotes || '',
    resolutionNotes: claim?.resolutionNotes || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialErrorMessage) enqueueSnackbar(initialErrorMessage, { variant: 'error' });
  }, [enqueueSnackbar, initialErrorMessage]);

  if (!claim) {
    return <Alert severity="error">{initialErrorMessage || 'Warranty claim not found.'}</Alert>;
  }

  const updateField = field => event => {
    setForm(current => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateWarrantyClaim(claim._id, form);
    setSaving(false);

    if (!result.success) {
      enqueueSnackbar(result.message || 'Failed to update claim', { variant: 'error' });
      return;
    }

    enqueueSnackbar(result.message || 'Warranty claim updated', { variant: 'success' });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Typography variant="h4">Claim {claim.claimNumber}</Typography>
                <Chip
                  size="small"
                  variant="tonal"
                  color={warrantyClaimStatusOptions.find(option => option.value === claim.status)?.color || 'default'}
                  label={warrantyClaimStatusOptions.find(option => option.value === claim.status)?.label || (claim.status || '').replace(/_/g, ' ')}
                />
              </Stack>
              <Typography color="text.secondary">
                Warranty {claim.warrantyRecordId?.warrantyNumber || 'N/A'} - {formatDate(claim.createdAt)}
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {claim.warrantyRecordId?._id ? (
                <Button component={Link} href={`/warranties/warranty-view/${claim.warrantyRecordId._id}`} variant="outlined">Warranty</Button>
              ) : null}
              <Button component={Link} href="/claims/claim-list" color="secondary" variant="outlined">Back</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6">Claim Details</Typography>
                <Typography color="text.primary">{claim.description}</Typography>
                <Typography color="text.secondary">Issue type: {(claim.issueType || 'repair').replace(/_/g, ' ')}</Typography>
                <Typography color="text.secondary">Customer: {claim.customerId?.name || claim.customerId?.email || 'Walk-in / unlinked'}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6">Update Claim</Typography>
                <TextField fullWidth select label="Status" value={form.status} onChange={updateField('status')} SelectProps={{ native: true }}>
                  {warrantyClaimStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </TextField>
                <TextField fullWidth select label="Service outcome" value={form.serviceOutcome} onChange={updateField('serviceOutcome')} SelectProps={{ native: true }}>
                  {warrantyClaimServiceOutcomeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </TextField>
                <TextField fullWidth multiline minRows={3} label="Internal notes" value={form.internalNotes} onChange={updateField('internalNotes')} />
                <TextField fullWidth multiline minRows={3} label="Resolution notes" value={form.resolutionNotes} onChange={updateField('resolutionNotes')} />
                <Button onClick={handleSave} disabled={saving} variant="contained">{saving ? 'Saving...' : 'Save Claim'}</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Status History</Typography>
                {(claim.statusHistory || []).length ? claim.statusHistory.map((item, index) => (
                  <Typography key={`${item.changedAt}-${index}`} color="text.secondary">
                    {formatDate(item.changedAt)} - {item.status?.replace(/_/g, ' ')} {item.notes ? `- ${item.notes}` : ''}
                  </Typography>
                )) : <Typography color="text.secondary">No status history.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
