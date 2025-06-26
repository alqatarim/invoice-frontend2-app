'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid, Tab, IconButton } from '@mui/material'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'

// Third-party Imports
import { SnackbarProvider, closeSnackbar, useSnackbar } from 'notistack'
import { Icon } from '@iconify/react'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import ProfileTab from './ProfileTab'
import TeamsTab from './TeamsTab'
import ProjectsTab from './ProjectsTab'
import ConnectionsTab from './ConnectionsTab'
import CustomTabList from '@core/components/mui/TabList'
import { updateProfile } from '@/app/(dashboard)/profile/actions'
import { profileTabs } from '@/data/dataSets'

const ProfileContent = ({ initialData }) => {
  const [profile, setProfile] = useState(initialData.profile)
  const [loading, setLoading] = useState(initialData.loading)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(initialData.error)
  const [activeTab, setActiveTab] = useState('profile')

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating profile...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updateProfile(formData)
      closeSnackbar(loadingKey)

      if (result.success) {
        setProfile(result.data)
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update profile'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      closeSnackbar()
      const errorMessage = error.message || 'Failed to update profile'
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      })
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setUpdating(false)
    }
  }

  const handleTabChange = (event, value) => {
    setActiveTab(value)
  }

  // Tab content mapping
  const tabContentList = {
    profile: (
      <ProfileTab
        data={profile}
        onUpdate={handleUpdate}
        updating={updating}
        error={error}
        enqueueSnackbar={enqueueSnackbar}
      />
    ),
    teams: <TeamsTab />,
    projects: <ProjectsTab />,
    connections: <ConnectionsTab />
  }

  return (
    <Grid container spacing={6}>
      {/* Profile Header */}
      <Grid size={{xs:12}}>
        <UserProfileHeader data={profile} />
      </Grid>

      {/* Tab Content */}
      {activeTab === undefined ? null : (
        <Grid item xs={12} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
              {profileTabs.map(tab => (
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

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

const ProfileIndex = (props) => {
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
      <ProfileContent {...props} />
    </SnackbarProvider>
  )
}

export default ProfileIndex