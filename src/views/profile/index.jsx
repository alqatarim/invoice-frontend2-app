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
import { profileTabs } from '@/data/dataSets'
import { useProfileHandler } from './handler'

const ProfileContent = ({ initialProfile = {}, initialErrorMessage = '' }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const {
    profile,
    updating,
    error,
    activeTab,
    setActiveTab,
    handleUpdate,
  } = useProfileHandler({
    initialProfile,
    initialErrorMessage,
  })

  const handleTabChange = (event, value) => {
    setActiveTab(value)
  }

  // Tab content mapping
  const tabContentList = {
    profile: (
      <ProfileTab
        data={profile}
        onUpdate={(formData) => handleUpdate(formData, enqueueSnackbar, closeSnackbar)}
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