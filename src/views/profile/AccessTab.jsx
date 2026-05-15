'use client'

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  Chip,
  Stack
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Icon } from '@iconify/react'

import {
  buildLocationPreview,
  formatAccessLabel,
  getLocationTypeIcon,
} from '@/utils/userAccess'

const accessSummaryIcons = {
  'permission role': 'ri-shield-user-line',
  'organization role': 'mdi:office-building-cog-outline',
  'total locations': 'ri-map-pin-line',
}

const AccessTab = ({ data = {} }) => {
  const theme = useTheme()

  const assignedBranches = Array.isArray(data?.assignedBranches)
    ? data.assignedBranches
    : []
  const locationPreview = buildLocationPreview({
    branches: assignedBranches,
    primaryBranchId: data?.primaryBranchId,
    primaryBranchName: data?.primaryBranchName,
  })
  const orgRoleLabel = formatAccessLabel(data?.companyRole || data?.orgRole, '')

  const accessSummaryData = [
    { property: 'permission role', value: formatAccessLabel(data?.role, 'Not assigned') },
    ...(orgRoleLabel ? [{ property: 'organization role', value: orgRoleLabel }] : []),
    { property: 'total locations', value: String(locationPreview.total || 0) },
  ]

  return (
    <Grid container spacing={6}>
      {/* Access Summary Card */}
      <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
        <Card>
          <CardHeader title='Access Summary' />
          <CardContent className='flex flex-col gap-6'>
            {accessSummaryData.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Icon icon={accessSummaryIcons[item.property]} fontSize={23} color={theme.palette.secondary.main} />
                <div className='flex items-center flex-wrap gap-3'>
                  <Typography fontWeight={500}>
                    {`${item.property.charAt(0).toUpperCase() + item.property.slice(1)}:`}
                  </Typography>
                  <Typography>{item.value}</Typography>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Locations List */}
      <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
        <Card>
          <CardHeader title='Assigned Locations' />
          <CardContent>
            {assignedBranches.length === 0 ? (
              <Box className='flex flex-col items-center justify-center gap-4 text-center py-12'>
                <Icon icon='ri-map-pin-line' fontSize='3rem' color={theme.palette.text.secondary} />
                <Typography variant='body1' color='text.secondary'>
                  No locations assigned to your account.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3} sx={{ maxWidth: 420 }}>

                {assignedBranches.map((branch, index) => {
                  const isPrimary =
                    branch?.isDefault ||
                    [String(branch?._id || ''), String(branch?.branchId || '')].includes(
                      String(data?.primaryBranchId || '')
                    )

                  return (
                    <Box
                      key={branch?._id || index}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          isPrimary ? theme.palette.primary.main : theme.palette.divider,
                          isPrimary ? 0.3 : 1
                        )}`,
                        bgcolor: isPrimary
                          ? alpha(theme.palette.primary.main, 0.04)
                          : 'transparent',
                      }}
                    >
                      <Box className='flex items-center justify-between flex-wrap gap-2'>
                        <Box className='flex items-center gap-3'>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: alpha(
                                isPrimary ? theme.palette.primary.main : theme.palette.secondary.main,
                                0.1
                              ),
                              color: isPrimary
                                ? theme.palette.primary.main
                                : theme.palette.secondary.main,
                              flexShrink: 0,
                            }}
                          >
                            <Icon
                              icon={getLocationTypeIcon(branch?.branchType, isPrimary)}
                              fontSize={22}
                            />
                          </Box>
                          <Box>
                            <Typography variant='body1' sx={{ fontWeight: 600 }}>
                              {branch?.name || 'Unnamed Location'}
                            </Typography>
                            <Box className='flex items-center gap-2 flex-wrap'>
                              {branch?.branchType && (
                                <Typography variant='caption' color='text.secondary'>
                                  {branch.branchType}
                                </Typography>
                              )}
                              {branch?.city && (
                                <Typography variant='caption' color='text.secondary'>
                                  &middot; {branch.city}
                                </Typography>
                              )}
                              {branch?.storeCode && (
                                <Typography variant='caption' color='text.secondary'>
                                  &middot; {branch.storeCode}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        <Box className='flex items-center gap-2'>
                          {isPrimary && (
                            <Chip
                              size='small'
                              color='primary'
                              variant='tonal'
                              label='Primary'
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AccessTab
