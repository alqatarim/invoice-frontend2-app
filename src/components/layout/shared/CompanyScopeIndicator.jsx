'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useSession } from '@/Auth/SessionContext'

import {
  buildLocationDisplayLabel,
  buildLocationPreview,
} from '@/utils/userAccess'

const CompanyScopeIndicator = ({ sx = {} }) => {
  const theme = useTheme()
  const { data: session } = useSession()

  const companyName = session?.user?.companyDetails?.companyName || ''
  const companyMembership = session?.user?.companyMembership || {}
  const accessibleBranches = Array.isArray(companyMembership?.accessibleBranches)
    ? companyMembership.accessibleBranches
    : []
  const locationPreview = buildLocationPreview({
    branches: accessibleBranches,
    primaryBranchId: companyMembership?.primaryBranchId,
  })
  const headline = companyName || 'Location Access'
  const detail = buildLocationDisplayLabel(
    {
      branches: accessibleBranches,
      primaryBranchId: companyMembership?.primaryBranchId,
    },
    'No assigned locations'
  )
  const tooltipTitle = locationPreview.names.length
    ? locationPreview.names.join(', ')
    : detail

  if (!companyName && !locationPreview.total) {
    return null
  }

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.5,
          py: 0.9,
          borderRadius: 999,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
          maxWidth: 280,
          minWidth: 0,
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            flexShrink: 0,
          }}
        >
          <i className='ri-map-pin-user-line text-[18px]' />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', lineHeight: 1.1 }}
          >
            {headline}
          </Typography>
          <Typography
            variant='body2'
            color='text.primary'
            sx={{ fontWeight: 600, lineHeight: 1.3 }}
            noWrap
          >
            {detail}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

export default CompanyScopeIndicator
