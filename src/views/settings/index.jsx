'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import {
     Tab,
     IconButton,
     Typography,
     Box,
     Alert,
     Snackbar
} from '@mui/material'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

// Third-party Imports
import { Icon } from '@iconify/react'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import { settingsTabs } from '@/data/dataSets'

// Settings Components
import AccountSettingsTab from './accountSettings/AccountSettingsTab'
import CompanySettingsTab from './companySettings/CompanySettingsTab'
import ChangePasswordTab from './changePassword/ChangePasswordTab'
import NotificationSettingsTab from './notificationSettings/NotificationSettingsTab'
import InvoiceTemplatesTab from './invoiceTemplates/InvoiceTemplatesTab'
import SignatureListsTab from './signatureLists/SignatureListsTab'
import InvoiceSettingsTab from './invoiceSettings/InvoiceSettingsTab'
import PaymentSettingsTab from './paymentSettings/PaymentSettingsTab'
import BankSettingsTab from './bankSettings/BankSettingsTab'
import TaxSettingsTab from './taxSettings/TaxSettingsTab'
import EmailSettingsTab from './emailSettings/EmailSettingsTab'
import PreferenceSettingsTab from './preferenceSettings/PreferenceSettingsTab'

// Auth
import { usePermission } from '@/Auth/usePermission'

const UnifiedSettingsIndex = ({ initialData = {} }) => {
     const router = useRouter()
     const searchParams = useSearchParams()

     // Snackbar state
     const [snackbar, setSnackbar] = useState({
          open: false,
          message: '',
          severity: 'success'
     })

     // Permission checks
     const hasCompanySettings = usePermission('companySettings', 'view')
     const hasInvoiceSettings = usePermission('invoiceSettings', 'view')
     const hasPreferenceSettings = usePermission('preferenceSettings', 'view')
     const hasBankSettings = usePermission('bankSettings', 'view')
     const hasTaxSettings = usePermission('taxSettings', 'view')
     const hasEmailSettings = usePermission('emailSettings', 'view')
     const hasNotificationSettings = usePermission('notificationSettings', 'view')

     // Determine active tab from URL search params
     const getActiveTabFromUrl = () => {
          const tab = searchParams.get('tab')
          return tab || 'company'
     }

     const [activeTab, setActiveTab] = useState(getActiveTabFromUrl)

     // Update active tab when URL changes
     useEffect(() => {
          const newActiveTab = getActiveTabFromUrl()
          if (newActiveTab !== activeTab) {
               setActiveTab(newActiveTab)
          }
     }, [searchParams])

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
          setActiveTab(value)
          // Update URL with new tab
          const url = new URL(window.location)
          url.searchParams.set('tab', value)
          router.push(url.pathname + url.search, { scroll: false })
     }

     // Snackbar handlers for child components
     const enqueueSnackbar = (message, options = {}) => {
          setSnackbar({
               open: true,
               message,
               severity: options.variant || 'success'
          })
     }

     const handleSnackbarClose = () => {
          setSnackbar(prev => ({ ...prev, open: false }))
     }

     return (
          <Box className='flex flex-col gap-6'>
               <Typography variant="h4" component="h1" gutterBottom>
                    Settings
               </Typography>

               <TabContext value={activeTab} >
                    <CustomTabList
                         onChange={handleTabChange}
                         variant='scrollable'
                    // pill='true'
                    >
                         {visibleTabs.map(tab => (
                              <Tab
                                   key={tab.value}
                                   icon={<Icon width={20} icon={tab.icon} />}
                                   label={

                                        tab.label

                                   }
                                   value={tab.value}

                              />
                         ))}
                    </CustomTabList>

                    {/* Tab Panels */}
                    <TabPanel value="account" className="!p-0">
                         <AccountSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="company" className="!p-0">
                         <CompanySettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="changePassword" className="!p-0">
                         <ChangePasswordTab
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="notification" className="!p-0">
                         <NotificationSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="invoiceTemplates" className="!p-0">
                         <InvoiceTemplatesTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="signatureLists" className="!p-0">
                         <SignatureListsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="invoice" className="!p-0">
                         <InvoiceSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="payment" className="!p-0">
                         <PaymentSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="bank" className="!p-0">
                         <BankSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="tax" className="!p-0">
                         <TaxSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="email" className="!p-0">
                         <EmailSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>

                    <TabPanel value="preference" className="!p-0">
                         <PreferenceSettingsTab
                              initialData={initialData}
                              enqueueSnackbar={enqueueSnackbar}
                         />
                    </TabPanel>
               </TabContext>

               {/* Global Snackbar */}
               <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
               >
                    <Alert
                         onClose={handleSnackbarClose}
                         severity={snackbar.severity}
                         variant="filled"
                         className="w-full"
                    >
                         {snackbar.message}
                    </Alert>
               </Snackbar>
          </Box>
     )
}

export default UnifiedSettingsIndex
