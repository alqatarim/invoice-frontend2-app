'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import Overview from './rightSection/Overview'
import Security from './rightSection/Security'
import AddressBilling from './rightSection/AddressBilling'
import Notifications from './rightSection/Notifications'

const CustomerRight = ({ customerData, invoices, cardDetails }) => {




  // States
  const [activeTab, setActiveTab] = useState('overview')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab icon={<i className='ri-user-3-line' />} value='overview' label='Overview' iconPosition='start' />
              <Tab icon={<i className='ri-lock-line' />} value='security' label='Security' iconPosition='start' />
              <Tab
                icon={<i className='ri-map-pin-line' />}
                value='addressBilling'
                label='Address & Billing'
                iconPosition='start'
              />
              <Tab
                icon={<i className='ri-notification-2-line' />}
                value='notifications'
                label='Notifications'
                iconPosition='start'
              />
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value='overview' className='p-0'>
              <Overview 
                customerData={customerData} 
                invoices={invoices} 
                cardDetails={cardDetails} 
              />
            </TabPanel>
            <TabPanel value='security' className='p-0'>
              <Security customerData={customerData} />
            </TabPanel>
            <TabPanel value='addressBilling' className='p-0'>
              <AddressBilling customerData={customerData} />
            </TabPanel>
            <TabPanel value='notifications' className='p-0'>
              <Notifications customerData={customerData} />
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default CustomerRight