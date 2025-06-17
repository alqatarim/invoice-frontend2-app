'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// MUI Imports
import { Tab, IconButton, Typography, Box } from '@mui/material'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

// Third-party Imports
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack'
import { Icon } from '@iconify/react'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import { settingsTabs } from '@/data/dataSets'

// Auth
import { usePermission } from '@/Auth/usePermission'

const SettingsLayout = ({ children, title, breadcrumb }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Permission checks - using usePermission hook for individual modules
  const hasCompanySettings = usePermission('companySettings', 'view')
  const hasInvoiceSettings = usePermission('invoiceSettings', 'view')
  const hasPreferenceSettings = usePermission('preferenceSettings', 'view')
  const hasBankSettings = usePermission('bankSettings', 'view')
  const hasTaxSettings = usePermission('taxSettings', 'view')
  const hasEmailSettings = usePermission('emailSettings', 'view')
  const hasNotificationSettings = usePermission('notificationSettings', 'view')

  // Determine active tab from current route
  const getActiveTabFromRoute = () => {
    if (pathname.includes('/company-settings')) return 'company'
    if (pathname.includes('/change-password')) return 'changePassword'
    if (pathname.includes('/notification-settings')) return 'notification'
    if (pathname.includes('/invoice-templates')) return 'invoiceTemplates'
    if (pathname.includes('/signatures')) return 'signatureLists'
    if (pathname.includes('/invoice-settings')) return 'invoice'
    if (pathname.includes('/payment-settings')) return 'payment'
    if (pathname.includes('/bank-settings')) return 'bank'
    if (pathname.includes('/tax-settings')) return 'tax'
    if (pathname.includes('/email-settings')) return 'email'
    if (pathname.includes('/preference-settings')) return 'preference'

    // Check search params as fallback
    const tab = searchParams.get('tab')
    return tab || 'company'
  }

  const [activeTab, setActiveTab] = useState(getActiveTabFromRoute)

  // Update active tab when route changes
  useEffect(() => {
    const newActiveTab = getActiveTabFromRoute()
    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab)
    }
  }, [pathname, searchParams])

  // Filter tabs based on permissions
  const visibleTabs = settingsTabs.filter(tab => {
    switch (tab.value) {
      case 'company':
        return hasCompanySettings
      case 'invoice':
        return hasInvoiceSettings
      case 'preference':
        return hasPreferenceSettings
      case 'bank':
        return hasBankSettings
      case 'tax':
        return hasTaxSettings
      case 'email':
        return hasEmailSettings
      case 'notification':
        return hasNotificationSettings
      // These tabs don't require specific permissions
      case 'changePassword':
      case 'invoiceTemplates':
      case 'signatureLists':
      case 'payment':
        return true
      default:
        return true
    }
  })

  const handleTabChange = (_, value) => {
    // Navigate to the appropriate route based on tab value
    switch (value) {
      case 'company':
        router.push('/settings/company-settings')
        break
      case 'changePassword':
        router.push('/settings/change-password')
        break
      case 'notification':
        router.push('/settings/notification-settings')
        break
      case 'invoiceTemplates':
        router.push('/settings/invoice-templates')
        break
      case 'signatureLists':
        router.push('/settings/signatures/list')
        break
      case 'invoice':
        router.push('/settings/invoice-settings')
        break
      case 'payment':
        router.push('/settings/payment-settings')
        break
      case 'bank':
        router.push('/settings/bank-settings/list')
        break
      case 'tax':
        router.push('/settings/tax-settings/list')
        break
      case 'email':
        router.push('/settings/email-settings')
        break
      case 'preference':
        router.push('/settings/preference-settings')
        break
      default:
        router.push('/settings/company-settings')
    }
    setActiveTab(value)
  }

  return (
    <Box className='flex flex-col gap-1'>
      <Typography variant="h4" component="h1" gutterBottom>
        {title || 'Settings'}
      </Typography>

      <TabContext value={activeTab} className='flex flex-col gap-1'>
        <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
          {visibleTabs.map(tab => (
            <Tab
              key={tab.value}
              label={
                <div className='flex items-center gap-1.5'>
                  <i className={`${tab.icon} text-lg`} />
                  {tab.label}
                </div>
              }
              value={tab.value}
            />
          ))}
        </CustomTabList>

        <TabPanel value={activeTab} className="!p-2">
          {children}
        </TabPanel>
      </TabContext>
    </Box>
  )
}

const SettingsLayoutWrapper = (props) => {
  const snackbarAction = (snackbarId) => (
    <IconButton onClick={() => closeSnackbar(snackbarId)}>
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  )

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={5000}
      preventDuplicate
      action={snackbarAction}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <SettingsLayout {...props} />
    </SnackbarProvider>
  )
}

export default SettingsLayoutWrapper