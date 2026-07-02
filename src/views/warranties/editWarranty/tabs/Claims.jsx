'use client';

import Link from 'next/link';
import dayjs from 'dayjs';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import SectionHeader from '@/components/headers/SectionHeader';
import {
  warrantyClaimStatusOptions,
  warrantyClaimIssueTypeOptions,
  warrantyClaimServiceOutcomeOptions,
} from '@/data/dataSets';
import CustomChip from '@/components/chips/CustomChip';

const formatDate = value => (value ? dayjs(value).format('DD MMM YYYY') : 'N/A');

const getLabel = (options, value, fallback) =>
  options.find(option => option.value === value)?.label || fallback;

const getClaimTone = statusOption => {
  const color = statusOption?.color || 'primary';

  return {
    color: `${color}.main`,
    lineColor: statusOption?.lineColor || `${color}.light`,
    icon: statusOption?.icon || 'mdi:shield-alert-outline',
  };
};

export default function Claims({ claims, minHeight }) {
  return (
    <Card sx={{ minHeight: { xs: 'auto', md: minHeight } }}>
      <CardContent className='px-8 py-7'>
        <Stack spacing={4}>
          <SectionHeader title='Claims' icon="mdi:shield-alert-outline" iconSize={30} />

          {claims.length ? (
            <Stack spacing={0}>
              {claims.map((claim, index) => {
                const statusOption = warrantyClaimStatusOptions.find(option => option.value === claim.status);
                const tone = getClaimTone(statusOption);
                const issueLabel = getLabel(warrantyClaimIssueTypeOptions, claim.issueType, 'Repair');
                const outcomeLabel = getLabel(warrantyClaimServiceOutcomeOptions, claim.serviceOutcome, 'Pending');
                const attachmentCount = claim.attachments?.length || 0;

                return (
                  <Box key={claim._id} className="flex gap-5">
                    <Box className="flex flex-col items-center">
                      <Box
                        sx={{ color: tone.color }}
                        className="relative z-[1] flex size-6 items-center justify-center rounded-full bg-backgroundPaper"
                      >
                        <Icon icon={tone.icon} className="text-xl" />
                      </Box>
                      {index < claims.length - 1 ? (
                        <Box
                          sx={{ borderColor: tone.lineColor }}
                          className="min-h-24 flex-1 border-l border-dashed"
                        />
                      ) : null}
                    </Box>

                    <Stack spacing={1.5} className={`flex-1 ${index < claims.length - 1 ? 'pb-6' : ''}`}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        className="flex-wrap gap-2"
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography
                            component={Link}
                            href={`/claims/claim-view/${claim._id}`}
                            variant="h7"
                            className="text-primary hover:underline"
                          >
                            {claim.claimNumber || 'Claim'}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {formatDate(claim.createdAt)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} className="flex-wrap gap-2">
                        <Chip
                          size="small"
                          variant="tonal"
                          color={statusOption?.color || 'default'}
                          label={statusOption?.label || (claim.status || '').replace(/_/g, ' ')}
                        />
                        <CustomChip
                          corners="corner"
                          size="small"
                          variant="outlined"
                          color="secondary"
                          icon={<Icon icon="mdi:wrench-outline" />}
                          label={`Issue: ${issueLabel}`}
                        />
                        <CustomChip
                          corners="corner"
                          size="small"
                          variant="outlined"
                          color="secondary"
                          icon={<Icon icon="mdi:clipboard-check-outline" />}
                          label={`Outcome: ${outcomeLabel}`}
                        />
                        {attachmentCount ? (
                          <CustomChip
                            corners="corner"
                            color="secondary"
                            size="small"
                            variant="outlined"
                            icon={<Icon icon="mdi:paperclip" />}
                            label={`${attachmentCount} attachment${attachmentCount === 1 ? '' : 's'}`}
                          />
                        ) : null}
                      </Stack>

                      <Box className="rounded-md border" sx={{ p: 3, borderColor: 'divider' }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="h7" sx={{ letterSpacing: 0.5 }}>
                              Description
                            </Typography>
                            <Typography variant="body2" whiteSpace="pre-wrap" className="mt-0.5">
                              {claim.description || 'No description provided.'}
                            </Typography>
                          </Box>

                          {claim.resolutionNotes ? (
                            <Box>
                              <Typography variant="caption" color="text.secondary" className="uppercase" sx={{ letterSpacing: 0.5 }}>
                                Resolution
                              </Typography>
                              <Typography variant="body2" whiteSpace="pre-wrap" className="mt-1">
                                {claim.resolutionNotes}
                              </Typography>
                            </Box>
                          ) : null}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Stack alignItems="center" justifyContent="center" spacing={1.5} className="text-center" sx={{ py: 8 }}>
              <Icon icon="mdi:shield-check-outline" fontSize={44} className="text-textDisabled" />
              <Typography variant="body2" color="text.secondary">No claims yet.</Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
