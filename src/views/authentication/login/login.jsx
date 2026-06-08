'use client'

import { useEffect, useRef, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import { Snackbar, CircularProgress } from '@mui/material'
import { alpha, styled, useColorScheme, useTheme } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'
import CustomAlert from '@/components/Alert/CustomAlert'
import CustomChip from '@/components/chips/CustomChip'
// Third-party Imports
import { Controller } from 'react-hook-form'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// Component Imports
import Logo from '@core/svg/Logo'
import { VibrantHeader } from '@/components/backgrounds'

const StyledSnackbar = styled(Snackbar)(({ theme, status }) => ({
  '& .MuiSnackbarContent-root': {
    backgroundColor:
      status === 'success'
        ? theme.palette.success.main
        : status === 'error'
          ? theme.palette.error.main
          : theme.palette.primary.main,
    color: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
  },
}))

// Motion variants for the form column
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const MotionCard = motion(Card)
const SUCCESS_REDIRECT_DELAY_MS = 1000

const MOBILE_HERO_TOP_HEIGHT = { xs: 200, sm: 200 }
const MOBILE_HERO_BOTTOM_HEIGHT = { xs: 200, sm: 200 }
const LOGIN_MOBILE_VIBRANT_SIZE = { min: 480, max: 720 }

const getHeroPanelBackgroundSx = (theme, isDark) => ({
  backgroundColor: 'background.paper',
  backgroundImage: isDark
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 48%, ${alpha(theme.palette.info.main, 0.08)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.11)} 0%, ${alpha(theme.palette.background.paper, 0)} 58%)`,
})

const LoginMobileHeroBackground = ({ isDark, animate }) => {
  const theme = useTheme()

  return (
    <Box
      className='absolute inset-0 z-[1] md:hidden'
      sx={{
        overflow: 'hidden',
        isolation: 'isolate',
        ...getHeroPanelBackgroundSx(theme, isDark),
      }}
    >
      <VibrantHeader
        isDark={isDark}
        animate={animate}
        shapes={['circle']}
        count={5}
        size={LOGIN_MOBILE_VIBRANT_SIZE}
      />
    </Box>
  )
}

// Full-screen success animation shown right after login
const SuccessOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1500,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        initial={{ scale: 0.4, opacity: 0.7 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          delay: i * 0.45,
          ease: 'easeOut',
        }}
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '2px solid rgba(115,103,240,0.7)',
        }}
      />
    ))}

    <motion.div
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.05 }}
      style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #7367F0 0%, #9E95F5 100%)',
        boxShadow:
          '0 24px 60px rgba(115,103,240,0.55), 0 0 0 8px rgba(255,255,255,0.08)',
      }}
    >
      <svg width="58" height="58" viewBox="0 0 56 56" fill="none">
        <motion.path
          d="M14 29 L24 39 L42 19"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      style={{ marginTop: 28, textAlign: 'center', padding: '0 24px' }}
    >
      <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
        Welcome back!
      </Typography>
      <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
        Redirecting to your dashboard...
      </Typography>
    </motion.div>
  </motion.div>
)

const LoginHeroPanel = ({ isDark, animate }) => {
  const theme = useTheme()

  return (
    <Box
      className='absolute inset-0 flex bs-full items-center justify-center min-bs-[100dvh] p-6 max-md:hidden'
      sx={{
        overflow: 'hidden',
        isolation: 'isolate',
        ...getHeroPanelBackgroundSx(theme, isDark),
      }}
    >
      <VibrantHeader isDark={isDark} animate={animate} shapes={['square']} />
    </Box>
  )
}

const Login = ({ controller }) => {
  const {
    control,
    errors = {},
    handleSubmit,
    isPasswordShown = false,
    isLoginProcessing = false,
    snackbar = { open: false, message: '', status: 'loading' },
    errorState,
    handlePasswordToggle,
    handleCredentialsSubmit,
    handleGoogleSignIn,
    handleCloseSnackbar,
    navigateToRedirect,
  } = controller || {}

  if (!controller || !control || typeof handleSubmit !== 'function') {
    return null
  }

  const { mode: colorMode, systemMode } = useColorScheme()
  const currentMode = (colorMode === 'system' ? systemMode : colorMode) || 'light'
  const isDark = currentMode === 'dark'
  const prefersReducedMotion = useReducedMotion()

  const isSuccess = snackbar.open && snackbar.status === 'success'
  const disableAuthActions = isLoginProcessing || isSuccess
  const [hasFormPanelExited, setHasFormPanelExited] = useState(false)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const redirectTimerRef = useRef(null)
  const navigateToRedirectRef = useRef(navigateToRedirect)
  const formExitTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.45, ease: [0.76, 0, 0.24, 1] }

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    navigateToRedirectRef.current = navigateToRedirect
  }, [navigateToRedirect])

  useEffect(() => {
    if (!isSuccess) {
      setHasFormPanelExited(false)
      setShowSuccessOverlay(false)
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
        redirectTimerRef.current = null
      }
      return
    }

    setShowSuccessOverlay(true)
    redirectTimerRef.current = setTimeout(() => {
      void navigateToRedirectRef.current?.()
    }, SUCCESS_REDIRECT_DELAY_MS)
  }, [isSuccess])

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  if (!hasMounted) {
    return <div className='flex bs-full min-bs-[100dvh] justify-center relative overflow-hidden' />
  }

  return (
    <div className='flex bs-full min-bs-[100dvh] justify-center relative overflow-hidden'>
      <LoginHeroPanel isDark={isDark} animate={!prefersReducedMotion} />
      <LoginMobileHeroBackground isDark={isDark} animate={!prefersReducedMotion} />

      <Box className='absolute z-[3] flex items-center gap-2 block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
        <Box sx={{ lineHeight: 0, '& svg': { width: { xs: 44, md: 55 }, height: { xs: 44, md: 55 } } }}>
          <Logo className='text-primary' width={55} height={55} />
        </Box>
        <Typography
          variant='h5'
          className='font-semibold tracking-[0.15px]'
          sx={{ fontSize: { xs: '1.05rem', sm: '1.1rem', md: '1.25rem' } }}
        >
          Invoices
        </Typography>
      </Box>

      <Box
        component='img'
        src='/images/flags/saudi-flag.svg'
        alt='Saudi Arabia'
        className='absolute z-[3] block-end-5 sm:block-end-[33px] inline-start-6 sm:inline-start-[38px]'
        sx={{
          width: { xs: 75, md: 75 },
          height: 'auto',
          borderRadius: 1,
          boxShadow: themeArg => `0 4px 16px ${alpha(themeArg.palette.common.black, 0.12)}`,
        }}
      />

      {!hasFormPanelExited && (
        <MotionCard
          className='flex rounded-none max-sm:justify-center max-sm:items-center sm:justify-center sm:items-center md:justify-center md:items-center max-md:bs-auto md:bs-full !min-is-full p-4 max-sm:py-5 sm:p-5 sm:py-4 md:!min-is-[unset] md:px-10 md:py-8 md:is-[400px]'
          sx={{
            position: 'absolute',
            insetInlineEnd: 0,
            zIndex: 2,
            backgroundColor: 'background.paper',
            top: { xs: MOBILE_HERO_TOP_HEIGHT.xs, sm: MOBILE_HERO_TOP_HEIGHT.sm, md: 0 },
            bottom: { xs: MOBILE_HERO_BOTTOM_HEIGHT.xs, sm: MOBILE_HERO_BOTTOM_HEIGHT.sm, md: 0 },
            left: { xs: 0, md: 'auto' },
            right: { xs: 0, md: 0 },
            blockSize: { xs: 'auto', sm: 'auto', md: '100%' },
            minBlockSize: { xs: 0, md: 'auto' },
            overflowY: { xs: 'auto', md: 'visible' },
          }}
          initial={false}
          animate={isSuccess ? { x: '110%' } : { x: 0 }}
          transition={formExitTransition}
          onAnimationComplete={() => {
            if (isSuccess) {
              setHasFormPanelExited(true)
            }
          }}
        >
          <motion.div
            className='flex flex-col gap-3 sm:gap-4 md:gap-4 is-full max-is-[380px] sm:max-is-[360px] md:max-is-[320px] max-sm:-translate-y-4 sm:mx-auto md:mx-auto'
            variants={containerVariants}
            initial='hidden'
            animate='show'
          >
            <CustomChip
              label='Business Portal'
              size='large'
              corners='corner'
              color='primary'
              skin='lighter'
              variant='tonal'
              sx={{ fontWeight: 600, width: 'fit-content' }}
            />

            <Box>
              <motion.div variants={itemVariants}>
                <Box className='flex items-start justify-between gap-3'>
                  <Typography variant='h4' sx={{ flex: 1, minWidth: 0 }}>
                    Welcome Back!
                  </Typography>
                </Box>
              </motion.div>

              <motion.div variants={itemVariants} className='flex flex-col gap-1.5'>
                <Typography color='text.secondary'>Please sign-in to your account</Typography>
              </motion.div>
            </Box>

            <motion.div variants={itemVariants}>
              <CustomAlert icon={false} skin='lighter' severity='info'>
                <Box className='flex flex-col gap-0'>
                  <Typography variant='body2' color='primary'>
                    Email: john.doe@example.com
                  </Typography>
                  <Typography variant='body2' color='primary'>
                    Pass: Test@123
                  </Typography>
                </Box>
              </CustomAlert>
            </motion.div>

            {errorState ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity='error'>{errorState}</Alert>
              </motion.div>
            ) : null}

            <motion.form
              variants={itemVariants}
              noValidate
              autoComplete='off'
              onSubmit={handleSubmit(handleCredentialsSubmit)}
              className='flex flex-col gap-5'
            >
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='email'
                    label='Email'
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Password'
                    id='login-password'
                    type={isPasswordShown ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton onClick={handlePasswordToggle} edge='end'>
                            <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                  />
                )}
              />
              <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                <FormControlLabel control={<Checkbox defaultChecked />} label='Remember me' />
                {/* <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography> */}
              </div>
              <motion.div
                whileHover={disableAuthActions ? undefined : { y: -2 }}
                whileTap={disableAuthActions ? undefined : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Button
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={disableAuthActions}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    // boxShadow: '0 8px 24px rgba(115,103,240,0.35)',
                    transition: 'box-shadow 0.3s ease',
                    "&:hover": { boxShadow: "0 12x 12px rgba(114, 103, 240, 0.22)" },
                  }}
                >
                  Log In
                </Button>
              </motion.div>
            </motion.form>

            {/* <motion.div variants={itemVariants}>
              <Divider className='gap-3'>or</Divider>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={disableAuthActions ? undefined : { y: -2 }}
              whileTap={disableAuthActions ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Button
                fullWidth
                variant='outlined'
                color='secondary'
                className='self-center text-textPrimary'
                onClick={handleGoogleSignIn}
                disabled={disableAuthActions}
                startIcon={<img src='/images/logos/google.png' alt='Google' width={18} height={18} />}
              >
                Sign in with Google
              </Button>
            </motion.div> */}
          </motion.div>
        </MotionCard>
      )}

      {/* Success overlay replaces the snackbar on success for a richer celebration */}
      <AnimatePresence>{showSuccessOverlay && <SuccessOverlay />}</AnimatePresence>

      <StyledSnackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbar.open && snackbar.status !== 'success'}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {snackbar.status === 'loading' && <CircularProgress size={24} color="inherit" style={{ marginRight: 10 }} />}
            {snackbar.status === 'success' && <CheckCircleIcon style={{ marginRight: 10 }} />}
            {snackbar.status === 'error' && <ErrorIcon style={{ marginRight: 10 }} />}
            {snackbar.message}
          </span>
        }
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        status={snackbar.status}
      />
    </div>
  )
}

export default Login
