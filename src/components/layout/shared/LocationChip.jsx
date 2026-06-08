'use client'

import { useRef, useState, useMemo } from 'react'
import Chip from '@mui/material/Chip'
import useMediaQuery from '@mui/material/useMediaQuery'
import Tooltip from '@mui/material/Tooltip'
import Popper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext'
import { isStoreBranch } from '@/utils/branchAccess'

const getLocationIconClass = (branch, selected) => {
  if (isStoreBranch(branch)) {
    return selected ? 'ri-store-2-fill' : 'ri-store-2-line'
  }

  return selected ? 'ri-building-4-fill' : 'ri-building-4-line'
}

const LocationChip = () => {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'))
  const anchorRef = useRef(null)
  const [open, setOpen] = useState(false)
  const {
    assignedBranches,
    primaryLocation,
    selectedLocation,
    selectedLocationId,
    selectedLocationType,
    selectLocation,
  } = useGlobalLocationScope()

  const label = useMemo(() => {
    if (selectedLocation?.name) {
      return selectedLocation.name
    }

    if (!assignedBranches.length) {
      return null
    }

    return `${assignedBranches.length} location${assignedBranches.length > 1 ? 's' : ''}`
  }, [assignedBranches.length, selectedLocation?.name])

  if (!label) return null

  const handleToggle = () => setOpen(prev => !prev)
  const handleClose = e => {
    if (anchorRef.current?.contains(e?.target)) return
    setOpen(false)
  }
  const handleSelect = branch => {
    selectLocation(branch?._id || branch?.branchId || '')
    setOpen(false)
  }

  return (
    <>
      <Tooltip title={open ? '' : 'Assigned Branches'} arrow>
        <Chip
          ref={anchorRef}
          icon={<i className={`${getLocationIconClass(selectedLocation, true)} text-[16px]`} />}
          label={isCompact ? undefined : label}
          size='medium'
          variant='outlined'
          onClick={handleToggle}
          sx={{
            cursor: 'pointer',
            fontWeight: 500,
            maxWidth: { xs: 40, sm: 200, md: 350 },
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }}
        />
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement='bottom-end'
        transition
        disablePortal
        className='z-[1]'
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={6}
              sx={{
                mt: 1,
                minWidth: 220,
                maxWidth: 350,
                maxHeight: 320,
                overflow: 'auto',
                borderRadius: 2,
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box sx={{ p: 2 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
                    Assigned Branches
                  </Typography>
                  <Box className='flex flex-col gap-1.5'>
                    {assignedBranches.map((branch, idx) => {
                      const branchType = String(branch?.branchType || branch?.type || '').trim()
                      const isPrimary =
                        branch?.isDefault ||
                        [String(branch?._id || ''), String(branch?.branchId || '')].includes(
                          String(primaryLocation?._id || primaryLocation?.branchId || '')
                        )
                      const isSelected =
                        [String(branch?._id || ''), String(branch?.branchId || '')].includes(
                          String(selectedLocationId || '')
                        )

                      return (
                        <Box
                          key={branch?._id || idx}
                          onClick={() => handleSelect(branch)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            bgcolor: isSelected
                              ? theme.palette.primary.lighterOpacity
                              // : isPrimary
                              //   ? alpha(theme.palette.primary.main, 0.04)
                              : 'transparent',
                            '&:hover': {
                              bgcolor: isSelected ? theme.palette.primary.lighterOpacity : theme.palette.secondary.lightOpacity,
                              // bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },

                            border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.secondary.lightOpacity}`,

                          }}
                        >
                          <i
                            className={`${getLocationIconClass(branch, isSelected)} text-[18px]`}
                            style={{
                              color: isSelected
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                            }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: isSelected ? 600 : 400 }}
                              noWrap
                            >
                              {branch?.name || 'Unnamed'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {[branchType, branch?.city, branch?.storeCode].filter(Boolean).join(' • ') ||
                                'Assigned location'}
                            </Typography>
                          </Box>
                          <Box className='flex items-center gap-1 flex-wrap justify-end'>
                            {/* {isSelected && (
                              <Chip
                                size='small'
                                label='Current'
                                color='primary'
                                variant='tonal'
                              />
                            )} */}
                            {isPrimary && (
                              <Chip
                                size='small'
                                label='Primary'
                                color='primary'
                                variant='tonal'
                              />
                            )}
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>

                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default LocationChip
