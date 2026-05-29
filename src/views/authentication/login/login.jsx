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
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { Snackbar, CircularProgress } from '@mui/material'
import { alpha, styled, useColorScheme, useTheme } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import CloseIcon from '@mui/icons-material/Close'

// Third-party Imports
import { Controller } from 'react-hook-form'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// Component Imports
import Logo from '@core/svg/Logo'
import { VibrantHeader } from '@/components/shared/VibrantHeader'

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
        backgroundColor: 'background.paper',
        backgroundImage: isDark
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 48%, ${alpha(theme.palette.info.main, 0.08)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.11)} 0%, ${alpha(
            theme.palette.background.paper,
            0
          )} 58%)`,
      }}
    >
      <VibrantHeader isDark={isDark} animate={animate} shapes={['circle']} />

      {/* <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 'min(540px, 100%)',
          p: { md: 6, lg: 7 },
          borderRadius: 4,
          backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.7 : 0.78),
          border: `1px solid ${alpha(theme.palette.text.primary, isDark ? 0.16 : 0.08)}`,
          boxShadow: `0 30px 80px ${alpha(theme.palette.common.black, isDark ? 0.32 : 0.12)}`,
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
      >
        <div className='flex items-center gap-3 mbe-8'>
          <Logo className='text-primary' width={56} height={56} />
          <Typography variant='h3' className='font-semibold tracking-[0.15px]'>
            Invoices
          </Typography>
        </div>

        <Typography variant='h2' sx={{ fontWeight: 800, letterSpacing: '-0.04em', mb: 2 }}>
          Manage every invoice with clarity.
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.8, maxWidth: 440 }}>
          Track sales, purchases, payments, and business performance from one calm workspace.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1.5,
            mt: 5,
          }}
        >
          {['Invoices', 'Customers', 'Reports'].map(label => (
            <Box
              key={label}
              sx={{
                py: 1.4,
                px: 1.5,
                borderRadius: 2.4,
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Box> */}
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
  const redirectTimerRef = useRef(null)
  const formExitTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : { duration: 0.45, ease: [0.76, 0, 0.24, 1] }

  useEffect(() => {
    if (!isSuccess) {
      setHasFormPanelExited(false)
      setShowSuccessOverlay(false)
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
        redirectTimerRef.current = null
      }
    }
  }, [isSuccess])

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current)
      }
    }
  }, [])

  return (
    <div className='flex bs-full min-bs-[100dvh] justify-center relative overflow-hidden'>
      <LoginHeroPanel isDark={isDark} animate={!prefersReducedMotion} />

      {/* Right side with login form */}
      {!hasFormPanelExited && (
        <MotionCard
          className='flex rounded-none justify-center items-center bs-full !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[400px]'
          sx={{
            position: 'absolute',
            insetBlock: 0,
            insetInlineEnd: 0,
            zIndex: 2,
          }}
          initial={false}
          animate={isSuccess ? { x: '110%' } : { x: 0 }}
          transition={formExitTransition}
          onAnimationComplete={() => {
            if (isSuccess) {
              setHasFormPanelExited(true)
              setShowSuccessOverlay(true)
              if (typeof navigateToRedirect === 'function') {
                redirectTimerRef.current = setTimeout(() => {
                  navigateToRedirect()
                }, SUCCESS_REDIRECT_DELAY_MS)
              }
            }
          }}
        >
          <div
            className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
          >
            <div className='flex justify-center items-center gap-3 mbe-6'>
              <Logo className='text-primary' width={50} height={50} />
              <Typography variant='h4' className='font-semibold tracking-[0.15px]'>
                Invoices
              </Typography>
            </div>
          </div>

          <motion.div
            className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[380px] md:max-is-[unset]'
            variants={containerVariants}
            initial='hidden'
            animate='show'
          >
            <motion.div variants={itemVariants}>
              <Typography variant='h4'>{`Welcome to Invoices!👋🏻`}</Typography>
              <Typography>Please sign-in to your account and start the adventure</Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Alert icon={false} className='bg-[var(--mui-palette-primary-lightOpacity)]'>
                <Typography variant='body2' color='primary'>
                  Email: <span className='font-medium'>superadmin@dreamstechnologies.com</span> / Pass:{' '}
                  <span className='font-medium'>Dgt@2023</span>
                </Typography>
              </Alert>
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
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
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
                    boxShadow: '0 8px 24px rgba(115,103,240,0.35)',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': { boxShadow: '0 12px 28px rgba(115,103,240,0.45)' },
                  }}
                >
                  Log In
                </Button>
              </motion.div>
            </motion.form>

            <motion.div variants={itemVariants}>
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
            </motion.div>
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
