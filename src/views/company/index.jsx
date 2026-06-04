'use client'

import { useCallback } from 'react'
import { useSnackbar } from 'notistack'

import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider'
import CompanyProfile from './CompanyProfile'
import useCompanyProfileHandler from './handler'

const CompanyIndexContent = ({
  initialCompanyProfile = {},
  initialProvinces = [],
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar()

  const notify = useCallback(
    (message, options = {}) => {
      enqueueSnackbar(message, {
        variant: options.variant || 'success',
        autoHideDuration: options.variant === 'error' ? 5000 : 3000,
        preventDuplicate: true,
      })
    },
    [enqueueSnackbar]
  )

  const controller = useCompanyProfileHandler({
    initialCompanyProfile,
    initialProvinces,
    onNotify: notify,
  })

  return (
    <CompanyProfile controller={controller} initialErrorMessage={initialErrorMessage} />
  )
}

const CompanyIndex = props => (
  <AppSnackbarProvider>
    <CompanyIndexContent {...props} />
  </AppSnackbarProvider>
)

export default CompanyIndex
